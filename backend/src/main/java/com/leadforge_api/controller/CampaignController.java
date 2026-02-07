package com.leadforge_api.controller;

import com.leadforge_api.dto.CampaignDto;
import com.leadforge_api.dto.CampaignRequest;
import com.leadforge_api.dto.ProspectDto;
import com.leadforge_api.model.Campaign;
import com.leadforge_api.model.User;
import com.leadforge_api.repository.UserRepository;
import com.leadforge_api.security.JwtUtil;
import com.leadforge_api.service.CampaignService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/campaigns")
@CrossOrigin(origins = "http://localhost:4200")
public class CampaignController {

    @Autowired
    private CampaignService campaignService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<?> createCampaign(
            @RequestBody @Valid CampaignRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            User user = getUserFromToken(authHeader);

            // Calculer le coût en crédits (1 crédit = 1 prospect)
            int cost = request.getNumberOfProspects();

            // Vérifier crédits
            if (user.getCredits() < cost) {
                return ResponseEntity.status(402)
                        .body("Crédits insuffisants. Vous avez " + user.getCredits() +
                                " crédits, mais " + cost + " sont nécessaires.");
            }

            // Créer campagne
            Campaign campaign = new Campaign();
            campaign.setUser(user);
            campaign.setName(request.getName());
            campaign.setIndustry(request.getIndustry());
            campaign.setCompanySize(request.getCompanySize());
            campaign.setLocation(request.getLocation());
            campaign.setJobTitle(request.getJobTitle());
            campaign.setPainPoint(request.getPainPoint());
            campaign.setNumberOfProspects(request.getNumberOfProspects()); // NOUVEAU

            campaign = campaignService.createCampaign(campaign);

            // Déduire crédits
            user.setCredits(user.getCredits() - cost);
            userRepository.save(user);

            // Lancer génération asynchrone
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
            User user = getUserFromToken(authHeader);
            List<Campaign> campaigns = campaignService.getUserCampaigns(user);

            List<CampaignDto> dtos = campaigns.stream()
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
            User user = getUserFromToken(authHeader);
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
            User user = getUserFromToken(authHeader);
            Campaign campaign = campaignService.getCampaign(id, user);

            List<ProspectDto> prospects = campaign.getProspects().stream()
                    .map(ProspectDto::fromProspect)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(prospects);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private User getUserFromToken(String authHeader) {
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}