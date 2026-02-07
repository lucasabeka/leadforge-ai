package com.leadforge_api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Email est requis")
    @Email(message = "Email invalide")
    private String email;

    @NotBlank(message = "Mot de passe est requis")
    private String password;
}