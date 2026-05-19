package com.techcommunity.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CategoryTreeResponse {

    private Long id;
    private Long parentId;
    private String name;
    private String icon;
    private String description;
    private Integer sortOrder;
    private Integer status;
    private Integer postCount;
    private LocalDateTime createdAt;
    private List<CategoryTreeResponse> children;
}
