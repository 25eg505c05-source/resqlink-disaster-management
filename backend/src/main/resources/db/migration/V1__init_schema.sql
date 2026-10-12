-- =====================================================================
-- ResQLink Disaster Response & Resource Management System
-- Database Schema Definition (PostgreSQL 16+)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users and Roles
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(32) NOT NULL UNIQUE,
    description VARCHAR(255)
);

INSERT INTO roles (id, name, description) VALUES
('ROLE_ADMIN', 'ADMIN', 'Full system and incident control authority'),
('ROLE_COORDINATOR', 'COORDINATOR', 'Disaster triage and supply coordinator'),
('ROLE_RESPONDER', 'RESPONDER', 'Field volunteer and mission responder')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    phone VARCHAR(32),
    badge_number VARCHAR(32),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    role_id VARCHAR(32) REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 2. Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    type VARCHAR(32) NOT NULL,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    address VARCHAR(255) NOT NULL,
    capacity_tonnes NUMERIC(10, 2) NOT NULL,
    used_tonnes NUMERIC(10, 2) NOT NULL DEFAULT 0,
    contact_officer VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Relief Supplies & Transactions
CREATE TABLE IF NOT EXISTS supplies (
    id VARCHAR(64) PRIMARY KEY,
    sku VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    warehouse_id VARCHAR(64) REFERENCES warehouses(id) ON DELETE CASCADE,
    current_stock INT NOT NULL DEFAULT 0,
    reserved_stock INT NOT NULL DEFAULT 0,
    minimum_threshold INT NOT NULL DEFAULT 100,
    unit VARCHAR(32) NOT NULL,
    unit_weight_kg NUMERIC(8, 2) NOT NULL DEFAULT 1.0,
    batch_number VARCHAR(64) NOT NULL,
    expiry_date DATE,
    status VARCHAR(32) NOT NULL DEFAULT 'IN_STOCK',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_positive_stock CHECK (current_stock >= 0 AND reserved_stock >= 0)
);

CREATE INDEX IF NOT EXISTS idx_supplies_warehouse ON supplies(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_supplies_status ON supplies(status);

CREATE TABLE IF NOT EXISTS supply_transactions (
    id VARCHAR(64) PRIMARY KEY,
    supply_id VARCHAR(64) REFERENCES supplies(id) ON DELETE CASCADE,
    supply_sku VARCHAR(64) NOT NULL,
    supply_name VARCHAR(128) NOT NULL,
    warehouse_id VARCHAR(64) REFERENCES warehouses(id),
    warehouse_name VARCHAR(128) NOT NULL,
    type VARCHAR(32) NOT NULL,
    quantity_delta INT NOT NULL,
    remaining_stock INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    performed_by_user_id VARCHAR(64) REFERENCES users(id),
    performed_by_user_name VARCHAR(128) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Disaster Incidents
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    sector VARCHAR(128) NOT NULL,
    address VARCHAR(255) NOT NULL,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    affected_population INT NOT NULL DEFAULT 0,
    commander VARCHAR(128) NOT NULL,
    description TEXT,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);

-- 5. Citizen SOS Triage Tickets
CREATE TABLE IF NOT EXISTS sos_tickets (
    id VARCHAR(64) PRIMARY KEY,
    ticket_number VARCHAR(64) NOT NULL UNIQUE,
    incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE SET NULL,
    caller_name VARCHAR(128) NOT NULL,
    contact_number VARCHAR(32) NOT NULL,
    sector VARCHAR(128) NOT NULL,
    address VARCHAR(255) NOT NULL,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    victim_count INT NOT NULL DEFAULT 1,
    requires_medical BOOLEAN NOT NULL DEFAULT FALSE,
    requires_evacuation BOOLEAN NOT NULL DEFAULT FALSE,
    water_rescue_needed BOOLEAN NOT NULL DEFAULT FALSE,
    severity VARCHAR(32) NOT NULL DEFAULT 'HIGH',
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    description TEXT,
    allocated_dispatch_id VARCHAR(64),
    operator_notes TEXT,
    time_received TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_sos_status ON sos_tickets(status);
CREATE INDEX IF NOT EXISTS idx_sos_severity ON sos_tickets(severity);

-- 6. Volunteers & Responders
CREATE TABLE IF NOT EXISTS volunteers (
    id VARCHAR(64) PRIMARY KEY,
    badge_number VARCHAR(32) NOT NULL UNIQUE,
    full_name VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(128) NOT NULL UNIQUE,
    blood_type VARCHAR(16) NOT NULL,
    primary_skill VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE',
    current_location_name VARCHAR(128) NOT NULL,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    current_incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE SET NULL,
    assigned_dispatch_id VARCHAR(64),
    deployed_at TIMESTAMP WITH TIME ZONE,
    total_missions_completed INT NOT NULL DEFAULT 0,
    experience_years INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS volunteer_skills (
    volunteer_id VARCHAR(64) REFERENCES volunteers(id) ON DELETE CASCADE,
    skill VARCHAR(64) NOT NULL,
    PRIMARY KEY (volunteer_id, skill)
);

-- 7. Dispatch Missions & Convoys
CREATE TABLE IF NOT EXISTS dispatches (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64) NOT NULL UNIQUE,
    incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE CASCADE,
    origin_warehouse_id VARCHAR(64) REFERENCES warehouses(id),
    destination_address VARCHAR(255) NOT NULL,
    transport_type VARCHAR(32) NOT NULL,
    carrier_identifier VARCHAR(128) NOT NULL,
    driver_or_pilot VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'STAGING',
    priority VARCHAR(32) NOT NULL DEFAULT 'HIGH',
    progress_percent INT NOT NULL DEFAULT 0,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    completion_time TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS dispatch_items (
    id VARCHAR(64) PRIMARY KEY,
    dispatch_id VARCHAR(64) REFERENCES dispatches(id) ON DELETE CASCADE,
    supply_id VARCHAR(64) REFERENCES supplies(id),
    quantity INT NOT NULL,
    unit VARCHAR(32) NOT NULL
);

-- 8. Emergency Alerts & Notifications
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(32) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    target_sector VARCHAR(128) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    created_by_user_name VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. System Security Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    user_name VARCHAR(128) NOT NULL,
    user_role VARCHAR(32) NOT NULL,
    action VARCHAR(64) NOT NULL,
    entity VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    details TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(64),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
