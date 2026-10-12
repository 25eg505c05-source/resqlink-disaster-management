import { User, LoginCredentials, RegisterPayload, AuthResponse } from '../types/auth';
import { Incident, IncidentFilterParams } from '../types/incident';
import { SosTicket, PrioritySuggestion } from '../types/sos';
import { SupplyItem, Warehouse, SupplyTransaction } from '../types/supply';
import { Volunteer, MatchScoreResult } from '../types/volunteer';
import { DispatchMission } from '../types/dispatch';
import { EmergencyAlert, AuditLog, SystemNotification } from '../types/alert';
import { 
  SEED_USERS, 
  SEED_WAREHOUSES, 
  SEED_SUPPLIES, 
  SEED_INCIDENTS, 
  SEED_SOS_TICKETS, 
  SEED_VOLUNTEERS, 
  SEED_DISPATCHES, 
  SEED_ALERTS, 
  SEED_SUPPLY_TRANSACTIONS, 
  SEED_AUDIT_LOGS, 
  SEED_NOTIFICATIONS 
} from '../api/mockDb';
import { websocketService } from './websocketService';

const STORE_KEY_PREFIX = 'resqlink_db_';

class DataStore {
  private load<T>(key: string, seed: T): T {
    try {
      const stored = localStorage.getItem(STORE_KEY_PREFIX + key);
      if (stored) return JSON.parse(stored);
    } catch {
      // Return seed on parse error
    }
    return seed;
  }

  private save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(STORE_KEY_PREFIX + key, JSON.stringify(data));
    } catch {
      // Storage quota safety
    }
  }

  // --- AUTH ---
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const users = this.load<User[]>('users', SEED_USERS);
    const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
    if (!user) {
      throw new Error('Invalid credentials: user not found');
    }
    // Dummy JWT token structure for dev/demo
    const token = `resqlink_jwt_${user.id}_${Date.now()}`;
    this.addAuditLog(user.id, user.fullName, user.role, 'LOGIN', 'User', user.id, 'User logged into Operations Center');
    return {
      token,
      user,
      expiresIn: 86400,
    };
  }

  public async register(payload: RegisterPayload): Promise<AuthResponse> {
    const users = this.load<User[]>('users', SEED_USERS);
    if (users.some(u => u.email.toLowerCase() === payload.email.toLowerCase())) {
      throw new Error('Email already registered');
    }
    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
      phone: payload.phone,
      badgeNumber: `${payload.role.slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.save('users', users);
    const token = `resqlink_jwt_${newUser.id}_${Date.now()}`;
    return { token, user: newUser, expiresIn: 86400 };
  }

  // --- INCIDENTS ---
  public async getIncidents(params?: IncidentFilterParams): Promise<{ items: Incident[]; total: number }> {
    let items = this.load<Incident[]>('incidents', SEED_INCIDENTS);

    if (params) {
      if (params.search) {
        const q = params.search.toLowerCase();
        items = items.filter(i => 
          i.title.toLowerCase().includes(q) ||
          i.code.toLowerCase().includes(q) ||
          i.location.sector.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
        );
      }
      if (params.severity && params.severity !== 'ALL') {
        items = items.filter(i => i.severity === params.severity);
      }
      if (params.status && params.status !== 'ALL') {
        items = items.filter(i => i.status === params.status);
      }
      if (params.type && params.type !== 'ALL') {
        items = items.filter(i => i.type === params.type);
      }
      if (params.sector) {
        items = items.filter(i => i.location.sector === params.sector);
      }
    }

    const total = items.length;
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const paginated = items.slice((page - 1) * limit, page * limit);
    return { items: paginated, total };
  }

  public async getIncidentById(id: string): Promise<Incident | null> {
    const items = this.load<Incident[]>('incidents', SEED_INCIDENTS);
    return items.find(i => i.id === id) || null;
  }

  public async createIncident(data: Partial<Incident>, user: User): Promise<Incident> {
    const items = this.load<Incident[]>('incidents', SEED_INCIDENTS);
    const newInc: Incident = {
      id: `inc-${Date.now()}`,
      code: `OP-${(data.type || 'HAZMAT').slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
      title: data.title || 'Untitled Emergency Incident',
      type: data.type || 'HAZMAT',
      severity: data.severity || 'HIGH',
      status: 'ACTIVE',
      location: data.location || { sector: 'Sector 1', address: 'Unknown', lat: 29.95, lng: -90.07 },
      affectedPopulation: data.affectedPopulation || 100,
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      commander: data.commander || user.fullName,
      description: data.description || '',
      requiredResources: data.requiredResources || [],
      assignedVolunteerIds: [],
      activeDispatchIds: [],
      relatedSosTicketIds: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'Incident Declared',
          description: `Disaster zone registered by ${user.fullName}`,
          authorName: user.fullName,
        }
      ],
    };
    items.unshift(newInc);
    this.save('incidents', items);

    this.addAuditLog(user.id, user.fullName, user.role, 'CREATE', 'Incident', newInc.id, `Created incident ${newInc.code}: ${newInc.title}`);
    websocketService.broadcast('INCIDENT_UPDATED', newInc);
    return newInc;
  }

  public async updateIncident(id: string, updates: Partial<Incident>, user: User): Promise<Incident> {
    const items = this.load<Incident[]>('incidents', SEED_INCIDENTS);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Incident not found');

    const old = items[idx];
    const updated: Incident = {
      ...old,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.status && updates.status !== old.status) {
      updated.timeline.unshift({
        id: `tl-${Date.now()}`,
        timestamp: new Date().toISOString(),
        title: `Status Changed to ${updates.status}`,
        description: `Operational state updated by ${user.fullName}`,
        authorName: user.fullName,
      });
    }

    items[idx] = updated;
    this.save('incidents', items);

    this.addAuditLog(user.id, user.fullName, user.role, 'UPDATE', 'Incident', id, `Updated incident ${updated.code}`);
    websocketService.broadcast('INCIDENT_UPDATED', updated);
    return updated;
  }

  public async deleteIncident(id: string, user: User): Promise<void> {
    const items = this.load<Incident[]>('incidents', SEED_INCIDENTS);
    const target = items.find(i => i.id === id);
    const filtered = items.filter(i => i.id !== id);
    this.save('incidents', filtered);
    if (target) {
      this.addAuditLog(user.id, user.fullName, user.role, 'DELETE', 'Incident', id, `Deactivated incident ${target.code}`);
    }
  }

  // --- SOS ---
  public async getSosTickets(): Promise<SosTicket[]> {
    return this.load<SosTicket[]>('sos_tickets', SEED_SOS_TICKETS);
  }

  public async createSosTicket(data: Partial<SosTicket>): Promise<SosTicket> {
    const items = this.load<SosTicket[]>('sos_tickets', SEED_SOS_TICKETS);
    const newSos: SosTicket = {
      id: `sos-${Date.now()}`,
      ticketNumber: `SOS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      callerName: data.callerName || 'Anonymous',
      contactNumber: data.contactNumber || 'N/A',
      sector: data.sector || 'Sector 1',
      address: data.address || '',
      lat: data.lat || 29.95,
      lng: data.lng || -90.07,
      victimCount: data.victimCount || 1,
      requiresMedical: !!data.requiresMedical,
      requiresEvacuation: !!data.requiresEvacuation,
      waterRescueNeeded: !!data.waterRescueNeeded,
      severity: data.severity || 'HIGH',
      status: 'PENDING',
      timeReceived: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: data.description || '',
      assignedResponderIds: [],
    };
    items.unshift(newSos);
    this.save('sos_tickets', items);

    this.addNotification({
      type: 'CRITICAL_SOS',
      title: `Incoming SOS ${newSos.ticketNumber}`,
      message: `${newSos.callerName} reports ${newSos.victimCount} victims in ${newSos.sector}`,
      severity: newSos.severity,
      link: '/sos',
    });

    websocketService.broadcast('SOS_CREATED', newSos);
    return newSos;
  }

  public async updateSosTicket(id: string, updates: Partial<SosTicket>, user: User): Promise<SosTicket> {
    const items = this.load<SosTicket[]>('sos_tickets', SEED_SOS_TICKETS);
    const idx = items.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('SOS Ticket not found');

    const updated: SosTicket = {
      ...items[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    if (updates.status === 'RESOLVED') {
      updated.resolvedAt = new Date().toISOString();
    }
    items[idx] = updated;
    this.save('sos_tickets', items);

    this.addAuditLog(user.id, user.fullName, user.role, 'STATUS_CHANGE', 'SosTicket', id, `SOS ${updated.ticketNumber} status: ${updated.status}`);
    websocketService.broadcast('SOS_UPDATED', updated);
    return updated;
  }

  public calculatePrioritySuggestion(ticket: Partial<SosTicket>): PrioritySuggestion {
    let score = 0;
    const reasons: string[] = [];

    if (ticket.requiresMedical) {
      score += 35;
      reasons.push('Medical emergency requested (+35)');
    }
    if (ticket.waterRescueNeeded) {
      score += 30;
      reasons.push('Swift-water boat extraction required (+30)');
    }
    if (ticket.requiresEvacuation) {
      score += 20;
      reasons.push('Immediate evacuation needed (+20)');
    }
    if ((ticket.victimCount || 1) >= 10) {
      score += 25;
      reasons.push(`High victim volume (${ticket.victimCount} people) (+25)`);
    } else if ((ticket.victimCount || 1) >= 4) {
      score += 15;
      reasons.push(`Multiple victims stranded (${ticket.victimCount}) (+15)`);
    }

    let calculatedSeverity: SosTicket['severity'] = 'LOW';
    let recommendedAction = 'Queue for regional aid dispatch';

    if (score >= 60) {
      calculatedSeverity = 'CRITICAL';
      recommendedAction = 'Deploy immediate tactical USAR and paramedic crew';
    } else if (score >= 40) {
      calculatedSeverity = 'HIGH';
      recommendedAction = 'Assign high-priority rescue squad and ambulance';
    } else if (score >= 20) {
      calculatedSeverity = 'MEDIUM';
      recommendedAction = 'Assign standard volunteer transport';
    }

    return { calculatedSeverity, score, reasons, recommendedAction };
  }

  // --- SUPPLIES & WAREHOUSES ---
  public async getWarehouses(): Promise<Warehouse[]> {
    return this.load<Warehouse[]>('warehouses', SEED_WAREHOUSES);
  }

  public async getSupplies(): Promise<SupplyItem[]> {
    return this.load<SupplyItem[]>('supplies', SEED_SUPPLIES);
  }

  public async adjustStock(supplyId: string, newStock: number, reason: string, user: User): Promise<SupplyItem> {
    const supplies = this.load<SupplyItem[]>('supplies', SEED_SUPPLIES);
    const item = supplies.find(s => s.id === supplyId);
    if (!item) throw new Error('Supply SKU not found');

    const delta = newStock - item.currentStock;
    item.currentStock = Math.max(0, newStock);
    
    if (item.currentStock === 0) item.status = 'OUT_OF_STOCK';
    else if (item.currentStock <= item.minimumThreshold * 0.5) item.status = 'CRITICAL';
    else if (item.currentStock <= item.minimumThreshold) item.status = 'LOW_STOCK';
    else item.status = 'IN_STOCK';

    item.lastUpdated = new Date().toISOString();
    this.save('supplies', supplies);

    // Record transaction
    this.addSupplyTransaction({
      supplyId: item.id,
      supplySku: item.sku,
      supplyName: item.name,
      warehouseId: item.warehouseId,
      warehouseName: item.warehouseName,
      type: 'ADJUSTMENT',
      quantityDelta: delta,
      remainingStock: item.currentStock,
      reason: reason || 'Physical inventory audit',
      performedByUserId: user.id,
      performedByUserName: user.fullName,
    });

    this.addAuditLog(user.id, user.fullName, user.role, 'UPDATE', 'SupplyItem', supplyId, `Stock adjusted for ${item.sku} to ${item.currentStock}`);
    websocketService.broadcast('SUPPLY_UPDATED', item);
    return item;
  }

  public async transferStock(supplyId: string, targetWarehouseId: string, quantity: number, user: User): Promise<void> {
    const supplies = this.load<SupplyItem[]>('supplies', SEED_SUPPLIES);
    const warehouses = this.load<Warehouse[]>('warehouses', SEED_WAREHOUSES);

    const sourceItem = supplies.find(s => s.id === supplyId);
    const targetWh = warehouses.find(w => w.id === targetWarehouseId);
    if (!sourceItem || !targetWh) throw new Error('Source or Target not found');
    if (sourceItem.currentStock < quantity) throw new Error('Insufficient source stock');

    sourceItem.currentStock -= quantity;
    sourceItem.lastUpdated = new Date().toISOString();

    const targetItem = supplies.find(s => s.sku === sourceItem.sku && s.warehouseId === targetWarehouseId);
    if (targetItem) {
      targetItem.currentStock += quantity;
      targetItem.lastUpdated = new Date().toISOString();
    } else {
      supplies.push({
        ...sourceItem,
        id: `sup-${Date.now()}`,
        warehouseId: targetWh.id,
        warehouseName: targetWh.name,
        currentStock: quantity,
        reservedStock: 0,
        lastUpdated: new Date().toISOString(),
      });
    }

    this.save('supplies', supplies);

    this.addSupplyTransaction({
      supplyId: sourceItem.id,
      supplySku: sourceItem.sku,
      supplyName: sourceItem.name,
      warehouseId: sourceItem.warehouseId,
      warehouseName: sourceItem.warehouseName,
      type: 'TRANSFER_OUT',
      quantityDelta: -quantity,
      remainingStock: sourceItem.currentStock,
      reason: `Transfer to ${targetWh.name}`,
      performedByUserId: user.id,
      performedByUserName: user.fullName,
    });

    this.addAuditLog(user.id, user.fullName, user.role, 'STOCK_TRANSFER', 'SupplyItem', supplyId, `Transferred ${quantity} units of ${sourceItem.sku} to ${targetWh.name}`);
    websocketService.broadcast('SUPPLY_UPDATED', sourceItem);
  }

  public async getTransactions(): Promise<SupplyTransaction[]> {
    return this.load<SupplyTransaction[]>('supply_transactions', SEED_SUPPLY_TRANSACTIONS);
  }

  private addSupplyTransaction(txData: Omit<SupplyTransaction, 'id' | 'timestamp'>): void {
    const list = this.load<SupplyTransaction[]>('supply_transactions', SEED_SUPPLY_TRANSACTIONS);
    const tx: SupplyTransaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    list.unshift(tx);
    this.save('supply_transactions', list);
  }

  // --- VOLUNTEERS ---
  public async getVolunteers(): Promise<Volunteer[]> {
    return this.load<Volunteer[]>('volunteers', SEED_VOLUNTEERS);
  }

  public async updateVolunteerStatus(id: string, status: Volunteer['status'], incidentId?: string, incidentTitle?: string, user?: User): Promise<Volunteer> {
    const volunteers = this.load<Volunteer[]>('volunteers', SEED_VOLUNTEERS);
    const vol = volunteers.find(v => v.id === id);
    if (!vol) throw new Error('Volunteer not found');

    vol.status = status;
    if (incidentId) {
      vol.currentIncidentId = incidentId;
      vol.currentIncidentName = incidentTitle;
      vol.deployedAt = new Date().toISOString();
    } else if (status === 'AVAILABLE') {
      vol.currentIncidentId = undefined;
      vol.currentIncidentName = undefined;
      vol.totalMissionsCompleted += 1;
    }

    this.save('volunteers', volunteers);
    if (user) {
      this.addAuditLog(user.id, user.fullName, user.role, 'STATUS_CHANGE', 'Volunteer', id, `Responder ${vol.fullName} status updated to ${status}`);
    }
    websocketService.broadcast('VOLUNTEER_STATUS_CHANGED', vol);
    return vol;
  }

  public async registerVolunteer(data: Partial<Volunteer>, user: User): Promise<Volunteer> {
    const list = this.load<Volunteer[]>('volunteers', SEED_VOLUNTEERS);
    const newVol: Volunteer = {
      id: `vol-${Date.now()}`,
      badgeNumber: `VOL-${Math.floor(100 + Math.random() * 900)}`,
      fullName: data.fullName || 'New Volunteer',
      phone: data.phone || '',
      email: data.email || '',
      bloodType: data.bloodType || 'O_POS',
      primarySkill: data.primarySkill || 'SEARCH_AND_RESCUE',
      skills: data.skills || [data.primarySkill || 'SEARCH_AND_RESCUE'],
      status: 'AVAILABLE',
      currentLocationName: data.currentLocationName || 'Central Hub',
      lat: data.lat || 29.95,
      lng: data.lng || -90.07,
      totalMissionsCompleted: 0,
      certifications: data.certifications || ['ICS-100 Incident Command'],
      experienceYears: data.experienceYears || 1,
    };
    list.unshift(newVol);
    this.save('volunteers', list);
    this.addAuditLog(user.id, user.fullName, user.role, 'CREATE', 'Volunteer', newVol.id, `Registered responder ${newVol.fullName}`);
    return newVol;
  }

  public findSmartMatches(incident: Incident, requiredSkills: string[]): MatchScoreResult[] {
    const volunteers = this.load<Volunteer[]>('volunteers', SEED_VOLUNTEERS);
    
    return volunteers.map(vol => {
      let score = 0;
      const matchingSkills = vol.skills.filter(s => requiredSkills.includes(s));
      score += matchingSkills.length * 30;

      if (vol.status === 'AVAILABLE') score += 25;
      else if (vol.status === 'STANDBY') score += 10;
      else score -= 40;

      // Approximate distance calculation using spherical formula
      const latDiff = (vol.lat - incident.location.lat) * 111;
      const lngDiff = (vol.lng - incident.location.lng) * 96;
      const dist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

      if (dist < 5) score += 20;
      else if (dist < 15) score += 10;
      else if (dist > 30) score -= 10;

      let recommendationTag: MatchScoreResult['recommendationTag'] = 'BACKUP';
      if (score >= 65 && vol.status === 'AVAILABLE') recommendationTag = 'HIGHLY_RECOMMENDED';
      else if (score >= 40) recommendationTag = 'QUALIFIED';

      return {
        volunteer: vol,
        matchScore: Math.max(5, Math.min(100, score)),
        matchingSkills,
        isAvailable: vol.status === 'AVAILABLE',
        approxDistanceKm: Number(dist.toFixed(1)),
        recommendationTag,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  // --- DISPATCHES ---
  public async getDispatches(): Promise<DispatchMission[]> {
    return this.load<DispatchMission[]>('dispatches', SEED_DISPATCHES);
  }

  public async createDispatch(data: Partial<DispatchMission>, user: User): Promise<DispatchMission> {
    const list = this.load<DispatchMission[]>('dispatches', SEED_DISPATCHES);
    const newDisp: DispatchMission = {
      id: `disp-${Date.now()}`,
      code: `CONVOY-${(data.transportType || 'HEAVY_TRUCK').slice(0, 3)}-${Math.floor(10 + Math.random() * 90)}`,
      incidentId: data.incidentId || '',
      incidentTitle: data.incidentTitle || '',
      originWarehouseId: data.originWarehouseId || '',
      originWarehouseName: data.originWarehouseName || '',
      destinationAddress: data.destinationAddress || 'Disaster Incident Perimeter',
      transportType: data.transportType || 'HEAVY_TRUCK',
      carrierIdentifier: data.carrierIdentifier || 'Tactical Vehicle',
      driverOrPilot: data.driverOrPilot || user.fullName,
      status: 'STAGING',
      startTime: new Date().toISOString(),
      estimatedArrival: new Date(Date.now() + 45 * 60000).toISOString(),
      progressPercent: 5,
      cargo: data.cargo || [],
      escortVolunteerIds: data.escortVolunteerIds || [],
      currentGps: data.currentGps || { lat: 29.95, lng: -90.07 },
      priority: data.priority || 'HIGH',
      timeline: [
        {
          status: 'STAGING',
          label: 'Mission Staging Initiated',
          timestamp: new Date().toISOString(),
          description: `Payload manifest authorized by ${user.fullName}`,
          completed: true,
        }
      ],
      notes: data.notes,
    };
    list.unshift(newDisp);
    this.save('dispatches', list);

    // Reserve cargo stock
    const supplies = this.load<SupplyItem[]>('supplies', SEED_SUPPLIES);
    for (const c of newDisp.cargo) {
      const s = supplies.find(sup => sup.id === c.supplyItemId);
      if (s) s.reservedStock += c.quantity;
    }
    this.save('supplies', supplies);

    // Mark escort volunteers in transit
    if (newDisp.escortVolunteerIds.length > 0) {
      const vols = this.load<Volunteer[]>('volunteers', SEED_VOLUNTEERS);
      for (const vId of newDisp.escortVolunteerIds) {
        const v = vols.find(vol => vol.id === vId);
        if (v) {
          v.status = 'IN_TRANSIT';
          v.assignedDispatchId = newDisp.id;
          v.currentIncidentId = newDisp.incidentId;
          v.currentIncidentName = newDisp.incidentTitle;
        }
      }
      this.save('volunteers', vols);
    }

    this.addAuditLog(user.id, user.fullName, user.role, 'DISPATCH_LAUNCH', 'DispatchMission', newDisp.id, `Launched convoy ${newDisp.code} to ${newDisp.incidentTitle}`);
    websocketService.broadcast('DISPATCH_UPDATED', newDisp);
    return newDisp;
  }

  public async updateDispatchProgress(id: string, progress: number, newStatus?: DispatchMission['status']): Promise<DispatchMission> {
    const list = this.load<DispatchMission[]>('dispatches', SEED_DISPATCHES);
    const d = list.find(disp => disp.id === id);
    if (!d) throw new Error('Dispatch not found');

    d.progressPercent = Math.min(100, Math.max(0, progress));
    if (newStatus) d.status = newStatus;
    else if (d.progressPercent >= 100) {
      d.status = 'COMPLETED';
      d.completionTime = new Date().toISOString();
    } else if (d.progressPercent > 80) {
      d.status = 'DELIVERING';
    } else if (d.progressPercent > 10) {
      d.status = 'EN_ROUTE';
    }

    this.save('dispatches', list);
    websocketService.broadcast('DISPATCH_UPDATED', d);
    return d;
  }

  // --- ALERTS ---
  public async getAlerts(): Promise<EmergencyAlert[]> {
    return this.load<EmergencyAlert[]>('alerts', SEED_ALERTS);
  }

  public async createAlert(data: Partial<EmergencyAlert>, user: User): Promise<EmergencyAlert> {
    const list = this.load<EmergencyAlert[]>('alerts', SEED_ALERTS);
    const alert: EmergencyAlert = {
      id: `alt-${Date.now()}`,
      title: data.title || 'CIVIL DEFENSE ALERT',
      description: data.description || '',
      type: data.type || 'WARNING',
      severity: data.severity || 'CRITICAL',
      targetSector: data.targetSector || 'ALL_SECTORS',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 8 * 3600000).toISOString(),
      channels: data.channels || ['WEA_CELL', 'EAS_RADIO'],
      isActive: true,
      createdByUserName: user.fullName,
      createdAt: new Date().toISOString(),
    };
    list.unshift(alert);
    this.save('alerts', list);

    this.addNotification({
      type: 'EMERGENCY_ALERT',
      title: alert.title,
      message: alert.description,
      severity: alert.severity,
      link: '/alerts',
    });

    this.addAuditLog(user.id, user.fullName, user.role, 'ALERT_BROADCAST', 'EmergencyAlert', alert.id, `Broadcast alert: ${alert.title}`);
    websocketService.broadcast('ALERT_CREATED', alert);
    return alert;
  }

  public async expireAlert(id: string, user: User): Promise<EmergencyAlert> {
    const list = this.load<EmergencyAlert[]>('alerts', SEED_ALERTS);
    const target = list.find(a => a.id === id);
    if (!target) throw new Error('Alert not found');
    target.isActive = false;
    this.save('alerts', list);
    this.addAuditLog(user.id, user.fullName, user.role, 'STATUS_CHANGE', 'EmergencyAlert', id, `Expired broadcast alert ${target.title}`);
    return target;
  }

  // --- NOTIFICATIONS ---
  public async getNotifications(): Promise<SystemNotification[]> {
    return this.load<SystemNotification[]>('notifications', SEED_NOTIFICATIONS);
  }

  public async markNotificationRead(id: string): Promise<void> {
    const list = this.load<SystemNotification[]>('notifications', SEED_NOTIFICATIONS);
    const target = list.find(n => n.id === id);
    if (target) target.read = true;
    this.save('notifications', list);
  }

  public async markAllNotificationsRead(): Promise<void> {
    const list = this.load<SystemNotification[]>('notifications', SEED_NOTIFICATIONS);
    list.forEach(n => n.read = true);
    this.save('notifications', list);
  }

  private addNotification(nData: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>): void {
    const list = this.load<SystemNotification[]>('notifications', SEED_NOTIFICATIONS);
    const n: SystemNotification = {
      ...nData,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    list.unshift(n);
    this.save('notifications', list);
  }

  // --- AUDIT LOGS ---
  public async getAuditLogs(): Promise<AuditLog[]> {
    return this.load<AuditLog[]>('audit_logs', SEED_AUDIT_LOGS);
  }

  public addAuditLog(
    userId: string, 
    userName: string, 
    userRole: string, 
    action: AuditLog['action'], 
    entity: string, 
    entityId: string, 
    details: string,
    oldValue?: string,
    newValue?: string
  ): void {
    const list = this.load<AuditLog[]>('audit_logs', SEED_AUDIT_LOGS);
    const log: AuditLog = {
      id: `aud-${Date.now()}`,
      userId,
      userName,
      userRole,
      action,
      entity,
      entityId,
      details,
      oldValue,
      newValue,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
    };
    list.unshift(log);
    this.save('audit_logs', list);
  }

  // Reset defaults
  public resetAllData(): void {
    localStorage.removeItem(STORE_KEY_PREFIX + 'users');
    localStorage.removeItem(STORE_KEY_PREFIX + 'incidents');
    localStorage.removeItem(STORE_KEY_PREFIX + 'sos_tickets');
    localStorage.removeItem(STORE_KEY_PREFIX + 'supplies');
    localStorage.removeItem(STORE_KEY_PREFIX + 'warehouses');
    localStorage.removeItem(STORE_KEY_PREFIX + 'supply_transactions');
    localStorage.removeItem(STORE_KEY_PREFIX + 'volunteers');
    localStorage.removeItem(STORE_KEY_PREFIX + 'dispatches');
    localStorage.removeItem(STORE_KEY_PREFIX + 'alerts');
    localStorage.removeItem(STORE_KEY_PREFIX + 'audit_logs');
    localStorage.removeItem(STORE_KEY_PREFIX + 'notifications');
  }
}

export const dataStore = new DataStore();
