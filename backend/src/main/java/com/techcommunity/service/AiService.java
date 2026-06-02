package com.techcommunity.service;

import com.techcommunity.dto.response.AiResponseDTO;

public interface AiService {

    AiResponseDTO generateResponse(Long postId);

    AiResponseDTO retryResponse(Long postId);

    AiResponseDTO getResponse(Long postId);
}
