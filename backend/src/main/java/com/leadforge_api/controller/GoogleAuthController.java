package com.leadforge_api.controller;

import com.leadforge_api.model.User;
import com.leadforge_api.repository.UserRepository;
import com.leadforge_api.security.JwtUtil;
import com.leadforge_api.service.GoogleAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth/google")
public class GoogleAuthController {

    @Autowired
    private GoogleAuthService googleAuthService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${frontend.url}")
    private String frontendUrl;

    @GetMapping("/login")
    public void loginWithGoogle(HttpServletResponse response) throws IOException {
        String authUrl = googleAuthService.getAuthorizationUrl();
        response.sendRedirect(authUrl);
    }

    @GetMapping("/callback")
    public void handleCallback(
            @RequestParam("code") String code,
            HttpServletResponse response
    ) throws IOException {
        try {
            // Échanger le code contre un access token
            Map<String, Object> tokenResponse = googleAuthService.exchangeCodeForToken(code);
            String accessToken = (String) tokenResponse.get("access_token");

            // Récupérer les infos utilisateur
            Map<String, Object> userInfo = googleAuthService.getUserInfo(accessToken);

            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String googleId = (String) userInfo.get("id");

            Optional<User> existingUser = userRepository.findByEmail(email);
            User user;

            if (existingUser.isPresent()) {
                user = existingUser.get();
            } else {
                user = new User();
                user.setEmail(email);
                user.setName(name);
                user.setPassword(null);
                user.setCredits(25);
                userRepository.save(user);
            }

            String token = jwtUtil.generateToken(email);
            String redirectUrl = frontendUrl + "/auth/callback?token=" + token;
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            response.sendRedirect(frontendUrl + "/login?error=oauth_failed");
        }
    }
}