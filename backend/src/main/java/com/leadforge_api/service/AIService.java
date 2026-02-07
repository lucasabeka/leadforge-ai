package com.leadforge_api.service;

import com.leadforge_api.model.Campaign;
import com.leadforge_api.model.Prospect;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AIService {

    @Value("${anthropic.api.key:}")
    private String apiKey;

    public String generateEmail(Prospect prospect, Campaign campaign) {
        // Pour l'instant, génération simple sans API
        // On intégrera Claude API plus tard

        String firstName = prospect.getName().split(" ")[0];

        return String.format("""
            Bonjour %s,
            
            Je travaille avec des entreprises dans le secteur %s qui cherchent à %s.
            
            Chez %s, avez-vous déjà exploré des solutions pour améliorer cette dimension ?
            
            Seriez-vous ouvert à un échange de 15 minutes cette semaine pour en discuter ?
            
            Cordialement
            """,
                firstName,
                campaign.getIndustry().toLowerCase(),
                campaign.getPainPoint().toLowerCase(),
                prospect.getCompany()
        );
    }
}