package com.leadforge_api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class GoogleAuthService {

    @Value("${google.oauth.client-id}")
    private String clientId;

    @Value("${google.oauth.client-secret}")
    private String clientSecret;

    @Value("${google.oauth.redirect-uri}")
    private String redirectUri;

    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Génère l'URL de redirection Google OAuth
     */
    public String getAuthorizationUrl() {
        return "https://accounts.google.com/o/oauth2/v2/auth?" +
                "client_id=" + clientId +
                "&redirect_uri=" + redirectUri +
                "&response_type=code" +
                "&scope=openid%20email%20profile" +
                "&access_type=offline" +
                "&prompt=consent";
    }

    /**
     * Échange le code d'autorisation contre un access token
     */
    public Map<String, Object> exchangeCodeForToken(String code) throws IOException {
        RequestBody formBody = new FormBody.Builder()
                .add("code", code)
                .add("client_id", clientId)
                .add("client_secret", clientSecret)
                .add("redirect_uri", redirectUri)
                .add("grant_type", "authorization_code")
                .build();

        Request request = new Request.Builder()
                .url("https://oauth2.googleapis.com/token")
                .post(formBody)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            String body = response.body().string();
            return objectMapper.readValue(body, Map.class);
        }
    }

    /**
     * Récupère les informations de l'utilisateur depuis Google
     */
    public Map<String, Object> getUserInfo(String accessToken) throws IOException {
        Request request = new Request.Builder()
                .url("https://www.googleapis.com/oauth2/v2/userinfo")
                .addHeader("Authorization", "Bearer " + accessToken)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            String body = response.body().string();
            return objectMapper.readValue(body, Map.class);
        }
    }
}