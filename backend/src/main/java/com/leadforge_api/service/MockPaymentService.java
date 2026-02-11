package com.leadforge_api.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class MockPaymentService {

    public Map<String, Object> createCheckoutSession(int credits, int price) {
        // Simulation d'une session Stripe
        Map<String, Object> session = new HashMap<>();
        session.put("id", "mock_session_" + System.currentTimeMillis());
        session.put("url", "https://demo.leadforge.com/payment-success");
        session.put("status", "open");
        return session;
    }

    public boolean verifyPayment(String sessionId) {
        // En mode démo, tous les paiements sont validés
        return true;
    }
}