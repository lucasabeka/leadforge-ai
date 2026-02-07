package com.leadforge_api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Email est requis")
    @Email(message = "Email invalide")
    private String email;

    @NotBlank(message = "Mot de passe est requis")
    @Size(min = 6, message = "Mot de passe doit faire au moins 6 caractères")
    private String password;

    @NotBlank(message = "Nom est requis")
    private String name;
}