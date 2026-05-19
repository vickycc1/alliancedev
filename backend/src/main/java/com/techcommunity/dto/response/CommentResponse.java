package com.techcommunity.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CommentResponse {

    private Long id;
    private Long postId;
    private Long parentId;
    private UserResponse author;
    private UserResponse replyToUser;
    private String content;
    private Integer likeCount;
    private Integer status;
    private Boolean liked;
    private LocalDateTime createdAt;
    private List<CommentResponse> children;
}
