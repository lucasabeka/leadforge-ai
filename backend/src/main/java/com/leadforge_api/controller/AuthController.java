package com.leadforge_api.controller;


import com.leadforge_api.dto.AuthResponse;
import com.leadforge_api.dto.LoginRequest;
import com.leadforge_api.dto.RegisterRequest;
import com.leadforge_api.dto.UserDto;
import com.leadforge_api.model.User;
import com.leadforge_api.repository.UserRepository;
import com.leadforge_api.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest request) {
        // Vérifier si email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Cet email est déjà utilisé");
        }

        // Créer nouvel utilisateur
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setCredits(25);
        user.setCreatedAt(LocalDateTime.now());

        user = userRepository.save(user);

        // Générer token JWT
        String token = jwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(token, UserDto.fromUser(user)));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest request) {
        // Trouver utilisateur par email
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(401).body("Email ou mot de passe incorrect");
        }

        // Vérifier mot de passe
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Email ou mot de passe incorrect");
        }

        // Générer token JWT
        String token = jwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(token, UserDto.fromUser(user)));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            return ResponseEntity.ok(UserDto.fromUser(user));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Token invalide");
        }
    }
}