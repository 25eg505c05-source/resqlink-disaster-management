package com.resqlink.repository;

import com.resqlink.entity.SosTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SosTicketRepository extends JpaRepository<SosTicket, String> {
    List<SosTicket> findByStatus(String status);
    List<SosTicket> findBySeverity(String severity);
    List<SosTicket> findByIncidentId(String incidentId);
}
