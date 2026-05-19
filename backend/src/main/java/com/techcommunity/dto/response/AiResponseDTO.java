package com.techcommunity.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AiResponseDTO {

    private Long id;
    private Long postId;
    private String content;
    private String model;
    private Integer promptTokens;
    private Integer completionTokens;
    private Integer status;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
