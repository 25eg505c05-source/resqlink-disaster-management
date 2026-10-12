package com.resqlink.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "sos_tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SosTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "ticket_number", nullable = false, unique = true, length = 64)
    private String ticketNumber;

    @Column(name = "incident_id")
    private String incidentId;

    @Column(name = "caller_name", nullable = false, length = 128)
    private String callerName;

    @Column(name = "contact_number", nullable = false, length = 32)
    private String contactNumber;

    @Column(nullable = false, length = 128)
    private String sector;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal lat;

    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal lng;

    @Column(name = "victim_count", nullable = false)
    private Integer victimCount;

    @Column(name = "requires_medical", nullable = false)
    private Boolean requiresMedical;

    @Column(name = "requires_evacuation", nullable = false)
    private Boolean requiresEvacuation;

    @Column(name = "water_rescue_needed", nullable = false)
    private Boolean waterRescueNeeded;

    @Column(nullable = false, length = 32)
    private String severity;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "PENDING";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "allocated_dispatch_id")
    private String allocatedDispatchId;

    @Column(name = "operator_notes", columnDefinition = "TEXT")
    private String operatorNotes;

    @CreationTimestamp
    @Column(name = "time_received", updatable = false)
    private Instant timeReceived;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;
}
