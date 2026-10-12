package com.resqlink.repository;

import com.resqlink.entity.DispatchMission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DispatchMissionRepository extends JpaRepository<DispatchMission, String> {
    List<DispatchMission> findByStatus(String status);
    List<DispatchMission> findByIncidentId(String incidentId);
}
