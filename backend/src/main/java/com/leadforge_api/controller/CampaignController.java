package com.leadforge_api.controller;

import com.leadforge_api.dto.CampaignDto;
import com.leadforge_api.dto.CampaignRequest;
import com.leadforge_api.dto.ProspectDto;
import com.leadforge_api.model.Campaign;
import com.leadforge_api.model.User;
import com.leadforge_api.repository.UserRepository;
import com.leadforge_api.security.TokenHelper;
import com.leadforge_api.service.CampaignService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {

    @Autowired
    private CampaignService campaignService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenHelper tokenHelper;

    @PostMapping
    public ResponseEntity<?> createCampaign(
            @RequestBody @Valid CampaignRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            User user = tokenHelper.getUserFromHeader(authHeader);
            int cost = request.getNumberOfProspects();

            if (user.getCredits() < cost) {
                return ResponseEntity.status(402)
                        .body("Crédits insuffisants. Vous avez " + user.getCredits() +
                                " crédits, mais " + cost + " sont nécessaires.");
            }

            Campaign campaign = new Campaign();
            campaign.setUser(user);
            campaign.setName(request.getName());
            campaign.setIndustry(request.getIndustry());
            campaign.setCompanySize(request.getCompanySize());
            campaign.setLocation(request.getLocation());
            campaign.setJobTitle(request.getJobTitle());
            campaign.setPainPoint(request.getPainPoint());
            campaign.setNumberOfProspects(request.getNumberOfProspects());

            campaign = campaignService.createCampaign(campaign);

            user.setCredits(user.getCredits() - cost);
            userRepository.save(user);

            Long campaignId = campaign.getId();
            campaignService.generateProspects(campaignId);

            return ResponseEntity.ok(CampaignDto.fromCampaign(campaign));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> listCampaigns(@RequestHeader("Authorization") String authHeader) {
        try {
            User user = tokenHelper.getUserFromHeader(authHeader);
            List<CampaignDto> dtos = campaignService.getUserCampaigns(user).stream()
                    .map(CampaignDto::fromCampaign)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCampaign(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            User user = tokenHelper.getUserFromHeader(authHeader);
            Campaign campaign = campaignService.getCampaign(id, user);
            return ResponseEntity.ok(CampaignDto.fromCampaign(campaign));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/prospects")
    public ResponseEntity<?> getProspects(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            User user = tokenHelper.getUserFromHeader(authHeader);
            Campaign campaign = campaignService.getCampaign(id, user);

            List<ProspectDto> prospects = campaign.getProspects().stream()
                    .map(ProspectDto::fromProspect)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(prospects);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
