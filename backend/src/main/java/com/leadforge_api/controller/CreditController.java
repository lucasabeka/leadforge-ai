package com.leadforge_api.controller;

import com.leadforge_api.model.User;
import com.leadforge_api.repository.UserRepository;
import com.leadforge_api.security.JwtUtil;
import com.leadforge_api.service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/credits")
public class CreditController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private StripeService stripeService;

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

    /**
     * Crée une session Stripe Checkout
     */
    @PostMapping("/create-checkout-session")
    public ResponseEntity<?> createCheckoutSession(
            @RequestBody Map<String, Integer> request,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            User user = getUserFromToken(authHeader);

            Integer credits = request.get("credits");
            Integer price = request.get("price");

            if (credits == null || price == null) {
                return ResponseEntity.badRequest().body("Credits et price requis");
            }

            // Créer la session Stripe
            Map<String, Object> session = stripeService.createCheckoutSession(
                    credits,
                    price,
                    user.getEmail()
            );

            return ResponseEntity.ok(session);

        } catch (StripeException e) {
            System.err.println("Erreur Stripe: " + e.getMessage());
            return ResponseEntity.status(500).body("Erreur Stripe: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Confirme le paiement après retour de Stripe
     */
    @GetMapping("/confirm-payment")
    public ResponseEntity<?> confirmPayment(
            @RequestParam("session_id") String sessionId,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            User user = getUserFromToken(authHeader);

            // Récupérer la session Stripe
            Session session = stripeService.retrieveSession(sessionId);

            // Vérifier que le paiement est réussi
            if (!"complete".equals(session.getStatus()) || !"paid".equals(session.getPaymentStatus())) {
                return ResponseEntity.badRequest().body("Paiement non confirmé");
            }

            // Récupérer les crédits depuis les métadonnées
            String creditsStr = session.getMetadata().get("credits");
            int credits = Integer.parseInt(creditsStr);

            // Ajouter les crédits à l'utilisateur
            user.setCredits(user.getCredits() + credits);
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("credits", user.getCredits());
            response.put("purchased", credits);
            response.put("success", true);

            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            System.err.println("Erreur Stripe: " + e.getMessage());
            return ResponseEntity.status(500).body("Erreur Stripe");
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