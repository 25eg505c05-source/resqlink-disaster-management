package com.resqlink.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "dispatches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DispatchMission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 64)
    private String code;

    @Column(name = "incident_id", nullable = false)
    private String incidentId;

    @Column(name = "origin_warehouse_id", nullable = false)
    private String originWarehouseId;

    @Column(name = "destination_address", nullable = false)
    private String destinationAddress;

    @Column(name = "transport_type", nullable = false, length = 32)
    private String transportType;

    @Column(name = "carrier_identifier", nullable = false, length = 128)
    private String carrierIdentifier;

    @Column(name = "driver_or_pilot", nullable = false, length = 128)
    private String driverOrPilot;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "STAGING";

    @Column(nullable = false, length = 32)
    private String priority;

    @Column(name = "progress_percent", nullable = false)
    @Builder.Default
    private Integer progressPercent = 0;

    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal lat;

    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal lng;

    @Column(name = "start_time")
    private Instant startTime;

    @Column(name = "estimated_arrival")
    private Instant estimatedArrival;

    @Column(name = "completion_time")
    private Instant completionTime;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
