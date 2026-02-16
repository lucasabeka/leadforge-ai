package com.leadforge_api.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Service
public class StripeService {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${frontend.url}")
    private String frontendUrl;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    /**
     * Crée une session de paiement Stripe Checkout
     */
    public Map<String, Object> createCheckoutSession(int credits, int priceInEuros, String userEmail) throws StripeException {

        // Convertir euros en centimes
        long priceInCents = priceInEuros * 100L;

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + "/purchase/success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(frontendUrl + "/purchase")
                .setCustomerEmail(userEmail)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("eur")
                                                .setUnitAmount(priceInCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("LeadForge - " + credits + " crédits")
                                                                .setDescription("Pack de " + credits + " crédits pour générer des prospects")
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .putMetadata("credits", String.valueOf(credits))
                .putMetadata("user_email", userEmail)
                .build();

        Session session = Session.create(params);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("sessionId", session.getId());
        responseData.put("url", session.getUrl());

        return responseData;
    }

    /**
     * Récupère une session Stripe
     */
    public Session retrieveSession(String sessionId) throws StripeException {
        return Session.retrieve(sessionId);
    }
}