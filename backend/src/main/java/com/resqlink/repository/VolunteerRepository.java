package com.resqlink.repository;

import com.resqlink.entity.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VolunteerRepository extends JpaRepository<Volunteer, String> {
    List<Volunteer> findByStatus(String status);
    List<Volunteer> findByPrimarySkill(String primarySkill);
}
