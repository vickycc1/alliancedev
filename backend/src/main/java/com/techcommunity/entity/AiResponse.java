package com.techcommunity.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("t_ai_response")
public class AiResponse {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long postId;

    private String content;

    private String model;

    private Integer promptTokens;

    private Integer completionTokens;

    private Integer status;

    private String errorMessage;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
