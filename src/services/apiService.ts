import { 
  DisasterIncident, 
  SupplyItem, 
  Warehouse, 
  Volunteer, 
  DispatchMission, 
  SosTriageTicket, 
  SystemMetrics,
  VolunteerStatus
} from '../types/disaster';
import { 
  INITIAL_INCIDENTS, 
  INITIAL_SUPPLIES, 
  INITIAL_WAREHOUSES, 
  INITIAL_VOLUNTEERS, 
  INITIAL_DISPATCHES, 
  INITIAL_SOS_TICKETS 
} from '../data/mockData';

const STORAGE_KEYS = {
  INCIDENTS: 'resqlink_incidents_v1',
  SUPPLIES: 'resqlink_supplies_v1',
  WAREHOUSES: 'resqlink_warehouses_v1',
  VOLUNTEERS: 'resqlink_volunteers_v1',
  DISPATCHES: 'resqlink_dispatches_v1',
  SOS_TICKETS: 'resqlink_sos_tickets_v1',
};

class DisasterApiService {
  private load<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return fallback;
  }

  private save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Fail silently if quota exceeded
    }
  }

  // Incidents
  async getIncidents(): Promise<DisasterIncident[]> {
    return this.load<DisasterIncident[]>(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
  }

  async createIncident(incident: Omit<DisasterIncident, 'id' | 'code' | 'reportedAt' | 'assignedVolunteerIds' | 'activeDispatchIds'>): Promise<DisasterIncident> {
    const incidents = await this.getIncidents();
    const newIncident: DisasterIncident = {
      ...incident,
      id: `inc-${Date.now()}`,
      code: `OP-${incident.type.slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
      reportedAt: new Date().toISOString(),
      assignedVolunteerIds: [],
      activeDispatchIds: [],
    };
    incidents.unshift(newIncident);
    this.save(STORAGE_KEYS.INCIDENTS, incidents);
    return newIncident;
  }

  async updateIncidentStatus(id: string, status: DisasterIncident['status']): Promise<DisasterIncident> {
    const incidents = await this.getIncidents();
    const target = incidents.find(i => i.id === id);
    if (!target) throw new Error('Incident not found');
    target.status = status;
    this.save(STORAGE_KEYS.INCIDENTS, incidents);
    return target;
  }

  // Supplies & Warehouses
  async getWarehouses(): Promise<Warehouse[]> {
    return this.load<Warehouse[]>(STORAGE_KEYS.WAREHOUSES, INITIAL_WAREHOUSES);
  }

  async getSupplies(): Promise<SupplyItem[]> {
    return this.load<SupplyItem[]>(STORAGE_KEYS.SUPPLIES, INITIAL_SUPPLIES);
  }

  async updateSupplyStock(id: string, newStock: number, reservedDelta: number = 0): Promise<SupplyItem> {
    const supplies = await this.getSupplies();
    const item = supplies.find(s => s.id === id);
    if (!item) throw new Error('Supply item not found');
    
    item.currentStock = Math.max(0, newStock);
    if (reservedDelta !== 0) {
      item.reservedStock = Math.max(0, item.reservedStock + reservedDelta);
    }
    
    if (item.currentStock <= item.minimumThreshold * 0.5) {
      item.status = 'CRITICAL_DEPLETED';
    } else if (item.currentStock <= item.minimumThreshold) {
      item.status = 'LOW_STOCK';
    } else {
      item.status = 'IN_STOCK';
    }
    item.lastUpdated = new Date().toISOString();
    this.save(STORAGE_KEYS.SUPPLIES, supplies);
    return item;
  }

  async transferSupply(supplyId: string, targetWarehouseId: string, quantity: number): Promise<void> {
    const supplies = await this.getSupplies();
    const warehouses = await this.getWarehouses();
    const sourceItem = supplies.find(s => s.id === supplyId);
    const targetWh = warehouses.find(w => w.id === targetWarehouseId);
    if (!sourceItem || !targetWh) throw new Error('Source or target not found');
    if (sourceItem.currentStock < quantity) throw new Error('Insufficient stock for transfer');

    sourceItem.currentStock -= quantity;
    sourceItem.lastUpdated = new Date().toISOString();

    const existingTargetItem = supplies.find(s => s.sku === sourceItem.sku && s.warehouseId === targetWarehouseId);
    if (existingTargetItem) {
      existingTargetItem.currentStock += quantity;
      existingTargetItem.lastUpdated = new Date().toISOString();
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

    this.save(STORAGE_KEYS.SUPPLIES, supplies);
  }

  // Volunteers
  async getVolunteers(): Promise<Volunteer[]> {
    return this.load<Volunteer[]>(STORAGE_KEYS.VOLUNTEERS, INITIAL_VOLUNTEERS);
  }

  async registerVolunteer(volunteer: Omit<Volunteer, 'id' | 'badgeNumber' | 'totalMissionsCompleted'>): Promise<Volunteer> {
    const volunteers = await this.getVolunteers();
    const newVol: Volunteer = {
      ...volunteer,
      id: `vol-${Date.now()}`,
      badgeNumber: `VOL-${Math.floor(100 + Math.random() * 900)}`,
      totalMissionsCompleted: 0,
    };
    volunteers.unshift(newVol);
    this.save(STORAGE_KEYS.VOLUNTEERS, volunteers);
    return newVol;
  }

  async updateVolunteerStatus(id: string, status: VolunteerStatus, incidentId?: string, incidentName?: string): Promise<Volunteer> {
    const volunteers = await this.getVolunteers();
    const target = volunteers.find(v => v.id === id);
    if (!target) throw new Error('Volunteer not found');

    target.status = status;
    if (incidentId) {
      target.currentIncidentId = incidentId;
      target.currentIncidentName = incidentName;
      target.deployedAt = new Date().toISOString();
    } else if (status === 'AVAILABLE') {
      target.currentIncidentId = undefined;
      target.currentIncidentName = undefined;
      target.deployedAt = undefined;
      target.totalMissionsCompleted += 1;
    }
    this.save(STORAGE_KEYS.VOLUNTEERS, volunteers);
    return target;
  }

  // Dispatches
  async getDispatches(): Promise<DispatchMission[]> {
    return this.load<DispatchMission[]>(STORAGE_KEYS.DISPATCHES, INITIAL_DISPATCHES);
  }

  async createDispatch(dispatch: Omit<DispatchMission, 'id' | 'code' | 'progressPercent' | 'departureTime'>): Promise<DispatchMission> {
    const dispatches = await this.getDispatches();
    const newDisp: DispatchMission = {
      ...dispatch,
      id: `disp-${Date.now()}`,
      code: `CONVOY-${dispatch.transportType.slice(0, 3)}-${Math.floor(10 + Math.random() * 90)}`,
      departureTime: new Date().toISOString(),
      progressPercent: 5,
    };
    dispatches.unshift(newDisp);
    this.save(STORAGE_KEYS.DISPATCHES, dispatches);

    // Reserve cargo stock
    const supplies = await this.getSupplies();
    for (const c of newDisp.cargo) {
      const sup = supplies.find(s => s.id === c.supplyItemId);
      if (sup) {
        sup.reservedStock += c.quantity;
      }
    }
    this.save(STORAGE_KEYS.SUPPLIES, supplies);

    // Update escorted volunteers status
    if (newDisp.escortVolunteerIds.length > 0) {
      const volunteers = await this.getVolunteers();
      for (const vId of newDisp.escortVolunteerIds) {
        const v = volunteers.find(vol => vol.id === vId);
        if (v) {
          v.status = 'IN_TRANSIT';
          v.assignedDispatchId = newDisp.id;
          v.currentIncidentId = newDisp.incidentId;
          v.currentIncidentName = newDisp.incidentTitle;
        }
      }
      this.save(STORAGE_KEYS.VOLUNTEERS, volunteers);
    }

    return newDisp;
  }

  async updateDispatchProgress(id: string, progress: number, newGps?: { lat: number; lng: number }): Promise<DispatchMission> {
    const dispatches = await this.getDispatches();
    const mission = dispatches.find(d => d.id === id);
    if (!mission) throw new Error('Dispatch mission not found');

    mission.progressPercent = Math.min(100, Math.max(0, progress));
    if (newGps) {
      mission.currentGps = newGps;
    }
    if (mission.progressPercent >= 100) {
      mission.status = 'COMPLETED';
    } else if (mission.progressPercent > 80) {
      mission.status = 'DELIVERING';
    } else {
      mission.status = 'EN_ROUTE';
    }

    this.save(STORAGE_KEYS.DISPATCHES, dispatches);
    return mission;
  }

  // SOS Triage
  async getSosTickets(): Promise<SosTriageTicket[]> {
    return this.load<SosTriageTicket[]>(STORAGE_KEYS.SOS_TICKETS, INITIAL_SOS_TICKETS);
  }

  async createSosTicket(ticket: Omit<SosTriageTicket, 'id' | 'ticketNumber' | 'status' | 'timeReceived'>): Promise<SosTriageTicket> {
    const tickets = await this.getSosTickets();
    const newTicket: SosTriageTicket = {
      ...ticket,
      id: `sos-${Date.now()}`,
      ticketNumber: `SOS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'PENDING',
      timeReceived: new Date().toISOString(),
    };
    tickets.unshift(newTicket);
    this.save(STORAGE_KEYS.SOS_TICKETS, tickets);
    return newTicket;
  }

  async updateSosStatus(id: string, status: SosTriageTicket['status'], dispatchId?: string): Promise<SosTriageTicket> {
    const tickets = await this.getSosTickets();
    const t = tickets.find(ticket => ticket.id === id);
    if (!t) throw new Error('SOS ticket not found');

    t.status = status;
    if (dispatchId) t.allocatedDispatchId = dispatchId;
    this.save(STORAGE_KEYS.SOS_TICKETS, tickets);
    return t;
  }

  // Reset to initial mock data
  resetDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.INCIDENTS);
    localStorage.removeItem(STORAGE_KEYS.SUPPLIES);
    localStorage.removeItem(STORAGE_KEYS.WAREHOUSES);
    localStorage.removeItem(STORAGE_KEYS.VOLUNTEERS);
    localStorage.removeItem(STORAGE_KEYS.DISPATCHES);
    localStorage.removeItem(STORAGE_KEYS.SOS_TICKETS);
  }

  // Metrics
  async getMetrics(): Promise<SystemMetrics> {
    const [incidents, supplies, volunteers, dispatches] = await Promise.all([
      this.getIncidents(),
      this.getSupplies(),
      this.getVolunteers(),
      this.getDispatches(),
    ]);

    const criticalIncidents = incidents.filter(i => i.severity === 'CRITICAL' && i.status === 'ACTIVE').length;
    const activeDeployedVols = volunteers.filter(v => v.status === 'DEPLOYED' || v.status === 'IN_TRANSIT').length;
    const totalTonnage = Math.round(supplies.reduce((acc, item) => acc + (item.currentStock * item.unitWeightKg) / 1000, 0));
    const activeDispatches = dispatches.filter(d => d.status !== 'COMPLETED').length;

    return {
      totalIncidentsActive: incidents.filter(i => i.status === 'ACTIVE').length,
      criticalIncidents,
      volunteersTotal: volunteers.length,
      volunteersActiveDeployed: activeDeployedVols,
      suppliesTotalTonnage: totalTonnage,
      activeDispatches,
      peopleAssisted24h: 39500,
      burnRateHourlyTonnes: 4.8,
    };
  }
}

export const apiService = new DisasterApiService();
