package com.leadforge_api.controller;

import com.leadforge_api.model.User;
import com.leadforge_api.repository.UserRepository;
import com.leadforge_api.security.TokenHelper;
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
    private TokenHelper tokenHelper;

    @Autowired
    private StripeService stripeService;

    @GetMapping("/balance")
    public ResponseEntity<?> getBalance(@RequestHeader("Authorization") String authHeader) {
        try {
            User user = tokenHelper.getUserFromHeader(authHeader);
            return ResponseEntity.ok(Map.of("credits", user.getCredits()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/create-checkout-session")
    public ResponseEntity<?> createCheckoutSession(
            @RequestBody Map<String, Integer> request,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            User user = tokenHelper.getUserFromHeader(authHeader);

            Integer credits = request.get("credits");
            Integer price = request.get("price");

            if (credits == null || price == null) {
                return ResponseEntity.badRequest().body("Credits et price requis");
            }

            Map<String, Object> session = stripeService.createCheckoutSession(credits, price, user.getEmail());
            return ResponseEntity.ok(session);

        } catch (StripeException e) {
            return ResponseEntity.status(500).body("Erreur Stripe: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/confirm-payment")
    public ResponseEntity<?> confirmPayment(
            @RequestParam("session_id") String sessionId,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            User user = tokenHelper.getUserFromHeader(authHeader);

            if (user.getProcessedStripeSessions().contains(sessionId)) {
                return ResponseEntity.badRequest().body("Session déjà traitée");
            }

            Session session = stripeService.retrieveSession(sessionId);

            if (!"complete".equals(session.getStatus()) || !"paid".equals(session.getPaymentStatus())) {
                return ResponseEntity.badRequest().body("Paiement non confirmé");
            }

            int credits = Integer.parseInt(session.getMetadata().get("credits"));
            user.setCredits(user.getCredits() + credits);
            user.getProcessedStripeSessions().add(sessionId);
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("credits", user.getCredits());
            response.put("purchased", credits);
            response.put("success", true);
            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            return ResponseEntity.status(500).body("Erreur Stripe");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
