package com.techcommunity.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("t_permission")
public class Permission {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String permissionName;

    private String permissionCode;

    private String resourceType;

    private Long parentId;

    private Integer sortOrder;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
