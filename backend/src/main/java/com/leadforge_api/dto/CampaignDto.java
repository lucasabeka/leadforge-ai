package com.leadforge_api.dto;

import com.leadforge_api.model.Campaign;
import com.leadforge_api.model.CampaignStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CampaignDto {
    private Long id;
    private String name;
    private String industry;
    private String companySize;
    private String location;
    private String jobTitle;
    private String painPoint;
    private CampaignStatus status;
    private Integer prospectsCount;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public static CampaignDto fromCampaign(Campaign campaign) {
        CampaignDto dto = new CampaignDto();
        dto.setId(campaign.getId());
        dto.setName(campaign.getName());
        dto.setIndustry(campaign.getIndustry());
        dto.setCompanySize(campaign.getCompanySize());
        dto.setLocation(campaign.getLocation());
        dto.setJobTitle(campaign.getJobTitle());
        dto.setPainPoint(campaign.getPainPoint());
        dto.setStatus(campaign.getStatus());
        dto.setProspectsCount(campaign.getProspects() != null ? campaign.getProspects().size() : 0);
        dto.setCreatedAt(campaign.getCreatedAt());
        dto.setCompletedAt(campaign.getCompletedAt());
        return dto;
    }
}