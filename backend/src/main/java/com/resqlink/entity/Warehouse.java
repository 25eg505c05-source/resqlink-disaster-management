package com.resqlink.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "warehouses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @Column(nullable = false, length = 128)
    private String name;

    @Column(nullable = false, length = 32)
    private String type;

    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal lat;

    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal lng;

    @Column(nullable = false)
    private String address;

    @Column(name = "capacity_tonnes", nullable = false, precision = 10, scale = 2)
    private BigDecimal capacityTonnes;

    @Column(name = "used_tonnes", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal usedTonnes = BigDecimal.ZERO;

    @Column(name = "contact_officer", nullable = false, length = 128)
    private String contactOfficer;

    @Column(nullable = false, length = 32)
    private String phone;
}
