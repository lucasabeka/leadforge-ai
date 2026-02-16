package com.leadforge_api.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private static final long EXPIRATION_TIME = 86400000; // 24 heures en ms

    @PostConstruct
    public void init() {
        System.out.println("🔑 JWT Secret chargé (longueur): " + secret.length() + " caractères");
        System.out.println("🔑 JWT Secret (début): " + secret.substring(0, Math.min(20, secret.length())) + "...");
    }

    public String generateToken(String email) {
        Algorithm algorithm = Algorithm.HMAC256(secret);

        String token = JWT.create()
                .withSubject(email)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .sign(algorithm);

        System.out.println("✅ Token généré pour: " + email);
        return token;
    }

    public String extractEmail(String token) {
        try {
            DecodedJWT jwt = decodeToken(token);
            String email = jwt.getSubject();
            System.out.println("✅ Email extrait du token: " + email);
            return email;
        } catch (JWTVerificationException e) {
            System.err.println("❌ Erreur extraction email: " + e.getMessage());
            throw e;
        }
    }

    public boolean validateToken(String token, String email) {
        try {
            String tokenEmail = extractEmail(token);
            boolean valid = tokenEmail.equals(email) && !isTokenExpired(token);
            System.out.println("🔍 Token validation: " + (valid ? "✅ VALIDE" : "❌ INVALIDE") + " pour " + email);
            return valid;
        } catch (JWTVerificationException e) {
            System.err.println("❌ Token invalide: " + e.getMessage());
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        DecodedJWT jwt = decodeToken(token);
        boolean expired = jwt.getExpiresAt().before(new Date());
        if (expired) {
            System.out.println("⏰ Token expiré");
        }
        return expired;
    }

    private DecodedJWT decodeToken(String token) {
        Algorithm algorithm = Algorithm.HMAC256(secret);
        return JWT.require(algorithm).build().verify(token);
    }
}