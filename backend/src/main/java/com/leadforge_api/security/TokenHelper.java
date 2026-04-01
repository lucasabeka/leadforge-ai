package com.leadforge_api.security;

import com.leadforge_api.model.User;
import com.leadforge_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Extrait et résout l'utilisateur à partir d'un header Authorization Bearer.
 * Centralise la logique dupliquée entre les controllers.
 */
@Component
public class TokenHelper {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    public User getUserFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Token manquant ou invalide");
        }
        String email = jwtUtil.extractEmail(authHeader.substring(7));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }
}
