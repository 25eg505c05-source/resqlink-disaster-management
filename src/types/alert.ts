import { IncidentSeverity } from './incident';

export type AlertType = 'INFORMATION' | 'WARNING' | 'EVACUATION' | 'CRITICAL';
export type CommunicationChannel = 'WEA_CELL' | 'EAS_RADIO' | 'SIREN' | 'FIRSTNET_PAGER' | 'SMS_ALL';

export interface EmergencyAlert {
  id: string;
  title: string;
  description: string;
  type: AlertType;
  severity: IncidentSeverity;
  targetSector: string;
  startTime: string;
  endTime: string;
  channels: CommunicationChannel[];
  isActive: boolean;
  createdByUserName: string;
  createdAt: string;
}

export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'STATUS_CHANGE' 
  | 'DISPATCH_LAUNCH' 
  | 'STOCK_TRANSFER' 
  | 'ALERT_BROADCAST' 
  | 'LOGIN';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  details: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress?: string;
}

export type NotificationType = 
  | 'CRITICAL_SOS' 
  | 'LOW_STOCK' 
  | 'CRITICAL_STOCK' 
  | 'NEW_INCIDENT' 
  | 'DISPATCH_DELAYED' 
  | 'DISPATCH_ARRIVED' 
  | 'EMERGENCY_ALERT' 
  | 'RESPONDER_ASSIGNMENT';

export interface SystemNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: IncidentSeverity;
  timestamp: string;
  read: boolean;
  link?: string;
}
