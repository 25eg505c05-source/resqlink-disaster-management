package com.resqlink.repository;

import com.resqlink.entity.SupplyItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplyItemRepository extends JpaRepository<SupplyItem, String> {
    List<SupplyItem> findByWarehouseId(String warehouseId);
    List<SupplyItem> findByStatus(String status);
    List<SupplyItem> findByCategory(String category);
}
