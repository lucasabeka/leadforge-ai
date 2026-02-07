package com.leadforge_api.dto;

import com.leadforge_api.model.SubscriptionPlan;
import com.leadforge_api.model.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDto {
    private Long id;
    private String email;
    private String name;
    private Integer credits;
    private SubscriptionPlan plan;
    private LocalDateTime createdAt;

    public static UserDto fromUser(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setCredits(user.getCredits());
        dto.setPlan(user.getPlan());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}