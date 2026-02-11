package com.leadforge_api.controller;

import com.leadforge_api.model.User;
import com.leadforge_api.repository.UserRepository;
import com.leadforge_api.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/credits")
@CrossOrigin(origins = "http://localhost:4200")
public class CreditController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/balance")
    public ResponseEntity<?> getBalance(@RequestHeader("Authorization") String authHeader) {
        try {
            User user = getUserFromToken(authHeader);

            Map<String, Object> response = new HashMap<>();
            response.put("credits", user.getCredits());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/purchase")
    public ResponseEntity<?> purchaseCredits(
            @RequestBody Map<String, Integer> request,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            User user = getUserFromToken(authHeader);
            Integer amount = request.get("amount");

            if (amount == null || amount <= 0) {
                return ResponseEntity.badRequest().body("Montant invalide");
            }

            user.setCredits(user.getCredits() + amount);
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("credits", user.getCredits());
            response.put("purchased", amount);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/demo-purchase")
    public ResponseEntity<?> demoPurchase(
            @RequestBody Map<String, Integer> request,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            User user = getUserFromToken(authHeader);
            Integer credits = request.get("credits");

            if (credits == null || credits <= 0) {
                return ResponseEntity.badRequest().body("Montant invalide");
            }

            user.setCredits(user.getCredits() + credits);
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("credits", user.getCredits());
            response.put("purchased", credits);
            response.put("demo", true);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private User getUserFromToken(String authHeader) {
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}