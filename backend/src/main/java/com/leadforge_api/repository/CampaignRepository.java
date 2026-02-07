package com.leadforge_api.repository;

import com.leadforge_api.model.Campaign;
import com.leadforge_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    List<Campaign> findByUserOrderByCreatedAtDesc(User user);
}