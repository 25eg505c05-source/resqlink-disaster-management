package com.resqlink.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "supplies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplyItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 64)
    private String sku;

    @Column(nullable = false, length = 128)
    private String name;

    @Column(nullable = false, length = 64)
    private String category;

    @Column(name = "warehouse_id", nullable = false)
    private String warehouseId;

    @Column(name = "current_stock", nullable = false)
    private Integer currentStock;

    @Column(name = "reserved_stock", nullable = false)
    @Builder.Default
    private Integer reservedStock = 0;

    @Column(name = "minimum_threshold", nullable = false)
    private Integer minimumThreshold;

    @Column(nullable = false, length = 32)
    private String unit;

    @Column(name = "unit_weight_kg", nullable = false, precision = 8, scale = 2)
    private BigDecimal unitWeightKg;

    @Column(name = "batch_number", nullable = false, length = 64)
    private String batchNumber;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "IN_STOCK";

    @Column(name = "last_updated")
    private Instant lastUpdated;
}
