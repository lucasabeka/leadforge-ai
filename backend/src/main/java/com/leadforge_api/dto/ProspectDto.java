package com.leadforge_api.dto;

import com.leadforge_api.model.Prospect;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProspectDto {
    private Long id;
    private String name;
    private String company;
    private String jobTitle;
    private String email;
    private String linkedinUrl;
    private String location;
    private String emailSubject;
    private String emailBody;
    private Integer qualificationScore;
    private LocalDateTime createdAt;

    public static ProspectDto fromProspect(Prospect prospect) {
        ProspectDto dto = new ProspectDto();
        dto.setId(prospect.getId());
        dto.setName(prospect.getName());
        dto.setCompany(prospect.getCompany());
        dto.setJobTitle(prospect.getJobTitle());
        dto.setEmail(prospect.getEmail());
        dto.setLinkedinUrl(prospect.getLinkedinUrl());
        dto.setLocation(prospect.getLocation());
        dto.setEmailSubject(prospect.getEmailSubject());
        dto.setEmailBody(prospect.getEmailBody());
        dto.setQualificationScore(prospect.getQualificationScore());
        dto.setCreatedAt(prospect.getCreatedAt());
        return dto;
    }
}