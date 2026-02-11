package com.leadforge_api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class ClaudeService {

    @Value("${anthropic.api.key}")
    private String apiKey;

    private final WebClient webClient;

    public ClaudeService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.anthropic.com/v1")
                .build();
    }

    public String generatePersonalizedEmail(
            String prospectName,
            String prospectCompany,
            String prospectJobTitle,
            String prospectLocation,
            String industry,
            String companySize,
            String painPoint
    ) {
        String prompt = buildPrompt(
                prospectName, prospectCompany, prospectJobTitle,
                prospectLocation, industry, companySize, painPoint
        );

        Map<String, Object> requestBody = Map.of(
                "model", "claude-haiku-4-5-20251001",  // ✅ HAIKU 4.5
                "max_tokens", 1024,
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                )
        );

        try {
            Map<String, Object> response = webClient.post()
                    .uri("/messages")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            List<Map<String, Object>> content =
                    (List<Map<String, Object>>) response.get("content");

            return (String) content.get(0).get("text");

        } catch (Exception e) {
            System.err.println("Erreur Claude API: " + e.getMessage());
            return generateFallbackEmail(prospectName, prospectCompany, painPoint);
        }
    }

    private String buildPrompt(
            String name, String company, String jobTitle,
            String location, String industry, String companySize, String painPoint
    ) {
        return String.format("""
            Tu es un expert en prospection B2B. Génère un email de prospection ultra-personnalisé.
            
            PROSPECT :
            - Nom : %s
            - Entreprise : %s
            - Poste : %s
            - Localisation : %s
            - Industrie : %s
            - Taille : %s
            - Pain point identifié : %s
            
            
            CONSIGNES STRICTES :
            1. Accroche : Mentionne un élément spécifique de l'entreprise
            2. Pain point : Identifie un challenge concret de leur industrie
            3. Crédibilité : Utilise UNE statistique pertinente
            4. Solution : Bénéfice tangible sans jargon
            5. CTA : Proposition d'horaire précis OU question ouverte
            6. Ton : Conversationnel, direct, pas de corporate speak
            7. Longueur : 120-150 mots MAX
            
            Format : Texte pur, pas de signature, pas de [NOM DE L'EXPÉDITEUR]
            """,
                name, company, jobTitle, location, industry, companySize, painPoint
        );
    }

    private String generateFallbackEmail(String name, String company, String painPoint) {
        return String.format("""
            Bonjour %s,
            
            Je travaille avec des entreprises comme %s pour résoudre %s.
            
            Nous avons aidé des clients similaires à obtenir des résultats mesurables 
            en automatisant leur prospection B2B.
            
            Seriez-vous disponible pour un échange rapide de 15 minutes cette semaine ?
            
            Cordialement
            """,
                name, company, painPoint.toLowerCase()
        );
    }

    public String generateEmailSubject(String company, String painPoint) {
        String prompt = String.format("""
            Génère un objet d'email de prospection B2B percutant.
            
            Entreprise cible : %s
            Pain point : %s
            
            Consignes :
            - Maximum 60 caractères
            - Pas de questions
            - Pas de "Re:" ou "Fwd:"
            - Crée de la curiosité
            - Personnalisé à l'entreprise
            
            Réponds UNIQUEMENT avec l'objet, rien d'autre.
            """,
                company, painPoint
        );

        Map<String, Object> requestBody = Map.of(
                "model", "claude-haiku-4-5-20251001",  // ✅ HAIKU 4.5
                "max_tokens", 100,
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                )
        );

        try {
            Map<String, Object> response = webClient.post()
                    .uri("/messages")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            List<Map<String, Object>> content =
                    (List<Map<String, Object>>) response.get("content");

            return ((String) content.get(0).get("text")).trim();

        } catch (Exception e) {
            return company + " - Opportunité de collaboration";
        }
    }
}