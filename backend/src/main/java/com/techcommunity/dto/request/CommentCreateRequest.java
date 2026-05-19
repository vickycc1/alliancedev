package com.techcommunity.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentCreateRequest {

    @NotNull(message = "帖子ID不能为空")
    private Long postId;

    private Long parentId;

    private Long replyToUserId;

    @NotNull(message = "评论内容不能为空")
    @Size(max = 1000, message = "评论内容不能超过1000字")
    private String content;
}
