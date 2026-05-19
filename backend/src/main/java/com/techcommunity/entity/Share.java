package com.techcommunity.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("t_share")
public class Share {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long postId;

    private String channel;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
