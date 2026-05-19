package com.techcommunity.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PostResponse {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private UserResponse author;
    private String title;
    private String content;
    private String summary;
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
    private Integer favoriteCount;
    private Integer shareCount;
    private Integer isTop;
    private Integer isEssence;
    private Integer aiRequested;
    private Integer status;
    private AiResponseDTO aiResponse;
    private Boolean liked;
    private Boolean favorited;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
