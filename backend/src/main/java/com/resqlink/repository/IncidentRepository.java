package com.resqlink.repository;

import com.resqlink.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, String>, JpaSpecificationExecutor<Incident> {
    List<Incident> findByStatus(String status);
    List<Incident> findBySeverity(String severity);
}
