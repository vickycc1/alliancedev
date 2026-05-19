package com.techcommunity.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class LoginResponse {

    private String token;
    private String refreshToken;
    private Long expiresIn;
    private UserResponse user;
}
