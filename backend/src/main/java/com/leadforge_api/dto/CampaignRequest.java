package com.leadforge_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.Data;

@Data
public class CampaignRequest {

    @NotBlank(message = "Le nom est requis")
    private String name;

    @NotBlank(message = "L'industrie est requise")
    private String industry;

    @NotBlank(message = "La taille d'entreprise est requise")
    private String companySize;

    @NotBlank(message = "La localisation est requise")
    private String location;

    @NotBlank(message = "Le poste cible est requis")
    private String jobTitle;

    @NotBlank(message = "Le pain point est requis")
    private String painPoint;

    // NOUVEAU : Nombre de prospects à générer
    @Min(value = 10, message = "Minimum 10 prospects")
    @Max(value = 200, message = "Maximum 200 prospects")
    private Integer numberOfProspects = 50; // Valeur par défaut
}