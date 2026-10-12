package com.resqlink.repository;

import com.resqlink.entity.EmergencyAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyAlertRepository extends JpaRepository<EmergencyAlert, String> {
    List<EmergencyAlert> findByIsActiveTrue();
}
