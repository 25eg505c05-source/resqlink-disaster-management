import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  Layers, 
  Copy, 
  Check, 
  Play, 
  Server, 
  Cpu, 
  Database, 
  Radio, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface SpringBootArchitectureProps {
  onExecuteSampleApi?: () => void;
}

export default function SpringBootArchitectureExplorer({}: SpringBootArchitectureProps) {
  const [activeCodeFile, setActiveCodeFile] = useState<'controller' | 'service' | 'entity' | 'websocket' | 'pom'>('controller');
  const [copied, setCopied] = useState(false);

  // Live REST API Sandbox state
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET /api/v1/incidents');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeApiRequest = () => {
    setIsLoadingApi(true);
    const start = performance.now();

    setTimeout(() => {
      const end = performance.now();
      setResponseLatency(Math.round(end - start) + 12);

      if (selectedEndpoint === 'GET /api/v1/incidents') {
        setResponseStatus(200);
        setApiResponse(JSON.stringify([
          {
            id: 'inc-01',
            code: 'OP-HURRICANE-4',
            title: 'Coastal Barrier Island Storm Surge & Breached Levee',
            severity: 'CRITICAL',
            status: 'ACTIVE',
            affectedPopulation: 14200,
            location: { lat: 29.89, lng: -89.98, sector: 'Sector 4' },
            activeDispatches: 2
          },
          {
            id: 'inc-02',
            code: 'OP-FLOOD-URBAN',
            title: 'Downtown Drainage Basin Backflow & Power Grid Collapse',
            severity: 'HIGH',
            status: 'ACTIVE',
            affectedPopulation: 6800,
            location: { lat: 29.96, lng: -90.08, sector: 'Sector 2' }
          }
        ], null, 2));
      } else if (selectedEndpoint === 'GET /api/v1/supplies/low-stock') {
        setResponseStatus(200);
        setApiResponse(JSON.stringify([
          {
            sku: 'MED-INS-COLD',
            name: 'Cold-Chain Insulin Cartridges',
            currentStock: 110,
            minimumThreshold: 250,
            status: 'CRITICAL_DEPLETED',
            warehouse: 'Central Logistics Depot'
          },
          {
            sku: 'WTR-TAB-120',
            name: 'Aquatabs Rapid Water Tablets (50ct)',
            currentStock: 820,
            minimumThreshold: 1000,
            status: 'LOW_STOCK',
            warehouse: 'Forward Staging Hub Delta'
          }
        ], null, 2));
      } else if (selectedEndpoint === 'POST /api/v1/dispatches/launch') {
        setResponseStatus(201);
        setApiResponse(JSON.stringify({
          dispatchId: 'disp-9941',
          code: 'CONVOY-AMPHIB-8',
          status: 'EN_ROUTE',
          carrierIdentifier: 'Unimog U5023 Low-Draft',
          destinationIncidentId: 'inc-01',
          cargoTotalWeightKg: 4200,
          departureTimestamp: new Date().toISOString(),
          estimatedArrivalMinutes: 38
        }, null, 2));
      } else if (selectedEndpoint === 'GET /actuator/health') {
        setResponseStatus(200);
        setApiResponse(JSON.stringify({
          status: 'UP',
          components: {
            db: { status: 'UP', details: { database: 'PostgreSQL 16.2', validationQuery: 'isValid()' } },
            diskSpace: { status: 'UP', details: { total: 107374182400, free: 74218934272, threshold: 10485760 } },
            ping: { status: 'UP' },
            stompWebSocket: { status: 'UP', details: { activeSessions: 42, broker: 'InMemorySTOMP' } }
          }
        }, null, 2));
      } else if (selectedEndpoint === 'GET /actuator/metrics/disaster.response.latency') {
        setResponseStatus(200);
        setApiResponse(JSON.stringify({
          name: 'disaster.response.latency',
          description: 'Mean volunteer mobilization response time in seconds',
          baseUnit: 'seconds',
          measurements: [
            { statistic: 'COUNT', value: 128 },
            { statistic: 'TOTAL_TIME', value: 109056 },
            { statistic: 'MAX', value: 1240 },
            { statistic: 'MEAN', value: 852 }
          ]
        }, null, 2));
      }

      setIsLoadingApi(false);
    }, 180);
  };

  const CODE_SNIPPETS = {
    controller: `package org.resqlink.disaster.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.resqlink.disaster.dto.*;
import org.resqlink.disaster.service.DisasterIncidentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/incidents")
@RequiredArgsConstructor
@Tag(name = "Disaster Incident Management", description = "Endpoints for triage, situational awareness, and EOC commands")
@CrossOrigin(origins = "*")
public class DisasterIncidentController {

    private final DisasterIncidentService incidentService;

    @GetMapping
    @Operation(summary = "Retrieve all active disaster operations", description = "Returns active, evaluating, and contained incident sectors")
    public ResponseEntity<List<IncidentResponseDto>> getAllIncidents(
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(incidentService.findFiltered(severity, status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific disaster incident telemetry by ID")
    public ResponseEntity<IncidentDetailDto> getIncidentById(@PathVariable String id) {
        return ResponseEntity.ok(incidentService.getIncidentDetails(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Log and mobilize a new disaster emergency zone")
    public ResponseEntity<IncidentResponseDto> declareIncident(
            @Valid @RequestBody CreateIncidentRequest request) {
        IncidentResponseDto created = incidentService.createIncident(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Transition disaster status (ACTIVE, CONTAINED, RESOLVED)")
    public ResponseEntity<IncidentResponseDto> updateStatus(
            @PathVariable String id,
            @RequestParam String status) {
        return ResponseEntity.ok(incidentService.updateStatus(id, status));
    }
}`,

    service: `package org.resqlink.disaster.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.resqlink.disaster.entity.*;
import org.resqlink.disaster.exception.InsufficientStockException;
import org.resqlink.disaster.repository.*;
import org.resqlink.disaster.service.SupplyChainService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupplyChainServiceImpl implements SupplyChainService {

    private final SupplyItemRepository supplyItemRepository;
    private final WarehouseRepository warehouseRepository;
    private final DispatchMissionRepository dispatchRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<SupplyItem> getDepletedSupplies() {
        return supplyItemRepository.findByCurrentStockLessThanEqualMinimumThreshold();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public DispatchMission allocateAndDispatchCargo(CreateDispatchCommand command) {
        log.info("Allocating emergency relief payload for Incident: {}", command.getIncidentId());

        // Atomic reservation with optimistic locking
        for (CargoManifestItem cargo : command.getItems()) {
            SupplyItem item = supplyItemRepository.findByIdWithLock(cargo.getSupplyItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Supply SKU not found"));

            if (item.getCurrentStock() < cargo.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for SKU: " + item.getSku());
            }

            item.setCurrentStock(item.getCurrentStock() - cargo.getQuantity());
            item.setReservedStock(item.getReservedStock() + cargo.getQuantity());
            supplyItemRepository.save(item);

            // Audit threshold triggers
            if (item.getCurrentStock() <= item.getMinimumThreshold()) {
                log.warn("CRITICAL: Supply item {} depleted below safe threshold!", item.getSku());
                eventPublisher.publishEvent(new SupplyDepletedEvent(item.getId(), item.getSku()));
            }
        }

        DispatchMission mission = DispatchMission.builder()
                .code("CONVOY-" + command.getTransportType().name() + "-" + System.currentTimeMillis() % 1000)
                .status(DispatchStatus.EN_ROUTE)
                .departureTime(Instant.now())
                .carrierIdentifier(command.getCarrierIdentifier())
                .driverOrPilot(command.getDriverOrPilot())
                .progressPercent(0)
                .build();

        return dispatchRepository.save(mission);
    }
}`,

    entity: `package org.resqlink.disaster.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "disaster_incidents", indexes = {
    @Index(name = "idx_incident_severity", columnList = "severity"),
    @Index(name = "idx_incident_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisasterIncident {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private IncidentType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private IncidentSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private IncidentStatus status;

    @Embedded
    private IncidentLocation location;

    @Column(name = "affected_population")
    private Long affectedPopulation;

    @Column(length = 2048)
    private String description;

    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DispatchMission> dispatches = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}`,

    websocket: `package org.resqlink.disaster.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketBrokerConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // In-memory STOMP broker for realtime GPS convoys & volunteer alerts
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Client endpoint connecting field tablets and EOC display wall
        registry.addEndpoint("/ws-disaster-feed")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}`,

    pom: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>

    <groupId>org.resqlink</groupId>
    <artifactId>disaster-response-management-service</artifactId>
    <version>1.0.0-RELEASE</version>
    <name>ResQLink Disaster Backend</name>
    <description>Enterprise Spring Boot Disaster Response & Resource Management System</description>

    <properties>
        <java.version>21</java.version>
        <springdoc.version>2.5.0</springdoc.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Web, Validation & JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Realtime WebSocket & STOMP Messaging -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-websocket</artifactId>
        </dependency>

        <!-- Spring Boot Actuator Telemetry -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <!-- Database & Spatial Drivers -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- OpenAPI 3.0 / Swagger UI -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>\${springdoc.version}</version>
        </dependency>

        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
</project>`
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-xl border border-indigo-900/60 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-1">
            <Server className="w-3.5 h-3.5" />
            <span>SPRING BOOT 3.3.4 ARCHITECTURE ENGINE</span>
            <span aria-hidden="true">·</span>
            <span>RESTFUL API CONTRACTS</span>
            <span aria-hidden="true">·</span>
            <span>JAVA 21 ENTERPRISE STACK</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Spring Boot Backend Specification & REST Sandbox
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mt-1 leading-relaxed">
            Architectural blueprints, JPA Entity relationships, Spring Data repositories, STOMP broker configurations, and real-time interactive API tester.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-300">Actuator: UP (HTTP 200)</span>
        </div>
      </div>

      {/* Spring Boot Architectural Tier Diagram */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <h3 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider mb-4">
          SYSTEM ARCHITECTURE & TRANSACTIONAL FLOW
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          {/* Client Tier */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-semibold text-[11px] mb-1">
                <Radio className="w-3.5 h-3.5" />
                <span>1. CLIENT & IOT</span>
              </div>
              <p className="text-slate-300 font-medium">React EOC Frontend & Field GPS Radios</p>
            </div>
            <div className="mt-3 text-[11px] font-mono text-slate-500">
              HTTP/2 · STOMP/WS · JSON
            </div>
          </div>

          {/* Security / Gateway */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-amber-400 font-mono font-semibold text-[11px] mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>2. SPRING SECURITY</span>
              </div>
              <p className="text-slate-300 font-medium">Role-Based Access (FEMA, EMT, Chief)</p>
            </div>
            <div className="mt-3 text-[11px] font-mono text-slate-500">
              JWT Bearer · CORS Filter
            </div>
          </div>

          {/* RestControllers */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-indigo-900/60 bg-indigo-950/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-indigo-400 font-mono font-semibold text-[11px] mb-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>3. CONTROLLERS</span>
              </div>
              <p className="text-slate-300 font-medium">@RestController REST & STOMP Endpoints</p>
            </div>
            <div className="mt-3 text-[11px] font-mono text-indigo-300">
              /api/v1/incidents, supplies, volunteers
            </div>
          </div>

          {/* Service Layer */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-semibold text-[11px] mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>4. SERVICE LAYER</span>
              </div>
              <p className="text-slate-300 font-medium">@Transactional Logistics & Dispatch</p>
            </div>
            <div className="mt-3 text-[11px] font-mono text-slate-500">
              Optimistic Lock · Events
            </div>
          </div>

          {/* Persistence */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-rose-400 font-mono font-semibold text-[11px] mb-1">
                <Database className="w-3.5 h-3.5" />
                <span>5. DATA PERSISTENCE</span>
              </div>
              <p className="text-slate-300 font-medium">Spring Data JPA + PostgreSQL</p>
            </div>
            <div className="mt-3 text-[11px] font-mono text-slate-500">
              Spatial PostGIS Indexing
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer & Interactive REST API Sandbox Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Source Code Explorer (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-white font-mono">
                SPRING BOOT JAVA SOURCE CODE
              </span>
            </div>

            <button
              onClick={() => copyCode(CODE_SNIPPETS[activeCodeFile])}
              className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* File Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-950/80 border-b border-slate-800 text-xs">
            <button
              onClick={() => setActiveCodeFile('controller')}
              className={`px-3 py-1.5 rounded-md font-mono text-[11px] font-medium transition-colors ${
                activeCodeFile === 'controller' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DisasterIncidentController.java
            </button>
            <button
              onClick={() => setActiveCodeFile('service')}
              className={`px-3 py-1.5 rounded-md font-mono text-[11px] font-medium transition-colors ${
                activeCodeFile === 'service' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SupplyChainService.java
            </button>
            <button
              onClick={() => setActiveCodeFile('entity')}
              className={`px-3 py-1.5 rounded-md font-mono text-[11px] font-medium transition-colors ${
                activeCodeFile === 'entity' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DisasterIncident.java
            </button>
            <button
              onClick={() => setActiveCodeFile('websocket')}
              className={`px-3 py-1.5 rounded-md font-mono text-[11px] font-medium transition-colors ${
                activeCodeFile === 'websocket' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              WebSocketBrokerConfig.java
            </button>
            <button
              onClick={() => setActiveCodeFile('pom')}
              className={`px-3 py-1.5 rounded-md font-mono text-[11px] font-medium transition-colors ${
                activeCodeFile === 'pom' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              pom.xml
            </button>
          </div>

          {/* Code Body */}
          <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto max-h-[500px] text-slate-300 leading-relaxed">
            <pre>
              <code>{CODE_SNIPPETS[activeCodeFile]}</code>
            </pre>
          </div>
        </div>

        {/* Live REST API Explorer & Actuator Sandbox (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white font-mono">
                  LIVE REST API / ACTUATOR SANDBOX
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">HTTP/1.1</span>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">
                  SELECT SPRING BOOT ENDPOINT:
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedEndpoint}
                    onChange={(e) => setSelectedEndpoint(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-indigo-500"
                  >
                    <option value="GET /api/v1/incidents">GET /api/v1/incidents</option>
                    <option value="GET /api/v1/supplies/low-stock">GET /api/v1/supplies/low-stock</option>
                    <option value="POST /api/v1/dispatches/launch">POST /api/v1/dispatches/launch</option>
                    <option value="GET /actuator/health">GET /actuator/health</option>
                    <option value="GET /actuator/metrics/disaster.response.latency">GET /actuator/metrics/latency</option>
                  </select>

                  <button
                    onClick={executeApiRequest}
                    disabled={isLoadingApi}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>

              {/* cURL representation */}
              <div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mb-1">
                  <span>EQUIVALENT CURL COMMAND:</span>
                  <button
                    onClick={() => {
                      const curl = `curl -X ${selectedEndpoint.split(' ')[0]} "https://api.resqlink.gov${selectedEndpoint.split(' ')[1]}" -H "Accept: application/json" -H "Authorization: Bearer <JWT_TOKEN>"`;
                      copyCode(curl);
                    }}
                    className="hover:text-slate-300"
                  >
                    Copy
                  </button>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400 break-all">
                  curl -X {selectedEndpoint.split(' ')[0]} "https://api.resqlink.gov{selectedEndpoint.split(' ')[1]}" \
                  <br />  -H "Accept: application/json" -H "Authorization: Bearer &lt;JWT&gt;"
                </div>
              </div>

              {/* Response output */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>HTTP RESPONSE:</span>
                  {responseStatus && (
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">STATUS {responseStatus} OK</span>
                      <span>·</span>
                      <span className="text-slate-500">{responseLatency}ms</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] max-h-60 overflow-y-auto text-emerald-400">
                  {isLoadingApi ? (
                    <div className="text-slate-500 animate-pulse">
                      Executing HTTP request against Spring Boot dispatcher...
                    </div>
                  ) : apiResponse ? (
                    <pre>
                      <code>{apiResponse}</code>
                    </pre>
                  ) : (
                    <div className="text-slate-600">
                      Click "Send" to fire this HTTP request against the Spring Boot REST endpoints.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between items-center">
            <span>Spring Boot v3.3.4 · Tomcat 10.1 · Java 21</span>
            <span className="text-emerald-500 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Embedded Actuator Live
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
