package com.techcommunity.controller;

import com.techcommunity.common.Result;
import com.techcommunity.dto.response.AiResponseDTO;
import com.techcommunity.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @GetMapping("/posts/{postId}/response")
    public Result<AiResponseDTO> getResponse(@PathVariable Long postId) {
        AiResponseDTO response = aiService.getResponse(postId);
        return Result.success(response);
    }

    @PostMapping("/posts/{postId}/retry")
    public Result<AiResponseDTO> retry(@PathVariable Long postId) {
        AiResponseDTO response = aiService.retryResponse(postId);
        return Result.success(response);
    }
}
