package com.leadforge_api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "prospects")
@Data
@NoArgsConstructor
public class Prospect {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    @Column(nullable = false)
    private String name;

    private String company;
    private String jobTitle;
    private String email;
    private String linkedinUrl;
    private String location;

    @Column(length = 500)
    private String emailSubject;

    @Column(length = 2000)
    private String emailBody;

    private Integer qualificationScore;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}