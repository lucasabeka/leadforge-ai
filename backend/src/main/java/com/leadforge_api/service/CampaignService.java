package com.leadforge_api.service;

import com.leadforge_api.model.Campaign;
import com.leadforge_api.model.CampaignStatus;
import com.leadforge_api.model.Prospect;
import com.leadforge_api.model.User;
import com.leadforge_api.repository.CampaignRepository;
import com.leadforge_api.repository.ProspectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.CompletableFuture;

@Service
public class CampaignService {

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private ProspectRepository prospectRepository;

    @Autowired
    private ClaudeService claudeService;

    public Campaign createCampaign(Campaign campaign) {
        campaign.setStatus(CampaignStatus.PENDING);
        campaign.setCreatedAt(LocalDateTime.now());
        return campaignRepository.save(campaign);
    }

    @Async
    public CompletableFuture<Campaign> generateProspects(Long campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        try {
            campaign.setStatus(CampaignStatus.PROCESSING);
            campaignRepository.save(campaign);

            Thread.sleep(3000);
            List<Prospect> prospects = generateMockProspects(campaign);


            for (Prospect prospect : prospects) {
                try {
                    // Générer sujet avec Claude
                    String subject = claudeService.generateEmailSubject(
                            prospect.getCompany(),
                            campaign.getPainPoint()
                    );
                    prospect.setEmailSubject(subject);


                    String emailBody = claudeService.generatePersonalizedEmail(
                            prospect.getName(),
                            prospect.getCompany(),
                            prospect.getJobTitle(),
                            prospect.getLocation(),
                            campaign.getIndustry(),
                            campaign.getCompanySize(),
                            campaign.getPainPoint()
                    );
                    prospect.setEmailBody(emailBody);

                } catch (Exception e) {
                    System.err.println("Erreur génération email pour " +
                            prospect.getName() + ": " + e.getMessage());

                    prospect.setEmailSubject(generateFallbackSubject(prospect, campaign));
                    prospect.setEmailBody(generateFallbackEmail(prospect, campaign));
                }
            }

            prospectRepository.saveAll(prospects);

            campaign.setStatus(CampaignStatus.COMPLETED);
            campaign.setCompletedAt(LocalDateTime.now());
            campaignRepository.save(campaign);

            return CompletableFuture.completedFuture(campaign);

        } catch (Exception e) {
            campaign.setStatus(CampaignStatus.FAILED);
            campaignRepository.save(campaign);
            throw new RuntimeException("Prospecting failed", e);
        }
    }

    private List<Prospect> generateMockProspects(Campaign campaign) {
        List<Prospect> prospects = new ArrayList<>();
        Random random = new Random();

        String[] firstNames = {"Marie", "Thomas", "Sophie", "Lucas", "Julie", "Pierre",
                "Emma", "Alexandre", "Léa", "Nicolas", "Camille", "Antoine",
                "Laura", "Maxime", "Clara", "Hugo", "Sarah", "Baptiste",
                "Chloé", "Mathis", "Manon", "Julien", "Léna", "Romain"};
        String[] lastNames = {"Martin", "Bernard", "Dubois", "Rousseau", "Laurent",
                "Simon", "Michel", "Lefebvre", "Leroy", "Moreau",
                "Garcia", "Roux", "Fournier", "Girard", "Bonnet",
                "Lambert", "Fontaine", "Chevalier", "Bertrand", "Clement"};
        String[] companies = {"TechCorp", "InnovateLab", "Digital Solutions", "Growth Agency",
                "Smart Consulting", "Future Labs", "Prime Marketing", "Apex Digital",
                "Vertex Solutions", "Nexus Group", "Quantum Tech", "Pulse Digital",
                "Peak Ventures", "Summit Digital", "Horizon Tech", "Catalyst Group"};

        int numberOfProspects = campaign.getNumberOfProspects();

        for (int i = 0; i < numberOfProspects; i++) {
            Prospect prospect = new Prospect();
            prospect.setCampaign(campaign);

            String firstName = firstNames[random.nextInt(firstNames.length)];
            String lastName = lastNames[random.nextInt(lastNames.length)];
            String company = companies[random.nextInt(companies.length)];

            prospect.setName(firstName + " " + lastName);
            prospect.setCompany(company + " " + (i / 3));
            prospect.setJobTitle(campaign.getJobTitle());
            prospect.setEmail(generateProspectEmail(firstName, lastName, company));
            prospect.setLinkedinUrl("https://linkedin.com/in/" +
                    firstName.toLowerCase() + "-" + lastName.toLowerCase());
            prospect.setLocation(campaign.getLocation());
            prospect.setQualificationScore(70 + random.nextInt(30));
            prospect.setCreatedAt(LocalDateTime.now());

            prospects.add(prospect);
        }

        return prospects;
    }

    private String generateProspectEmail(String firstName, String lastName, String company) {
        String cleanCompany = company.toLowerCase()
                .replace(" ", "")
                .replace("é", "e")
                .replace("è", "e");
        return firstName.toLowerCase() + "." + lastName.toLowerCase() +
                "@" + cleanCompany + ".com";
    }

    private String generateFallbackSubject(Prospect prospect, Campaign campaign) {
        String firstName = prospect.getName().split(" ")[0];
        return firstName + ", intéressé par " + campaign.getIndustry() + " ?";
    }

    private String generateFallbackEmail(Prospect prospect, Campaign campaign) {
        String firstName = prospect.getName().split(" ")[0];
        return String.format("""
            Bonjour %s,
            
            Je travaille avec des entreprises comme %s dans le secteur %s.
            
            J'ai remarqué que vous pourriez être confronté à : %s
            
            Seriez-vous disponible pour un échange rapide cette semaine ?
            
            Cordialement
            """,
                firstName,
                prospect.getCompany(),
                campaign.getIndustry(),
                campaign.getPainPoint()
        );
    }

    public List<Campaign> getUserCampaigns(User user) {
        return campaignRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Campaign getCampaign(Long id, User user) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        if (!campaign.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        return campaign;
    }
}