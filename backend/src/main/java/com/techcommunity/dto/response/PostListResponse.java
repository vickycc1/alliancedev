package com.techcommunity.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PostListResponse {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private UserSimpleResponse author;
    private String title;
    private String summary;
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
    private Integer favoriteCount;
    private Integer isTop;
    private Integer isEssence;
    private Integer aiRequested;
    private Integer status;
    private LocalDateTime createdAt;
}
