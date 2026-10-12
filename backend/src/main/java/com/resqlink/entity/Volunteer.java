package com.resqlink.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "volunteers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Volunteer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "badge_number", nullable = false, unique = true, length = 32)
    private String badgeNumber;

    @Column(name = "full_name", nullable = false, length = 128)
    private String fullName;

    @Column(nullable = false, length = 32)
    private String phone;

    @Column(nullable = false, unique = true, length = 128)
    private String email;

    @Column(name = "blood_type", nullable = false, length = 16)
    private String bloodType;

    @Column(name = "primary_skill", nullable = false, length = 64)
    private String primarySkill;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "AVAILABLE";

    @Column(name = "current_location_name", nullable = false, length = 128)
    private String currentLocationName;

    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal lat;

    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal lng;

    @Column(name = "current_incident_id")
    private String currentIncidentId;

    @Column(name = "assigned_dispatch_id")
    private String assignedDispatchId;

    @Column(name = "deployed_at")
    private Instant deployedAt;

    @Column(name = "total_missions_completed", nullable = false)
    @Builder.Default
    private Integer totalMissionsCompleted = 0;

    @Column(name = "experience_years", nullable = false)
    @Builder.Default
    private Integer experienceYears = 1;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "volunteer_skills", joinColumns = @JoinColumn(name = "volunteer_id"))
    @Column(name = "skill")
    @Builder.Default
    private Set<String> skills = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
