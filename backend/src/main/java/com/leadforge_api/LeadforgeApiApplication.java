package com.leadforge_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync  // Ajouter cette annotation
public class LeadforgeApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(LeadforgeApiApplication.class, args);
	}

}