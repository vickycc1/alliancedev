package com.techcommunity.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostCreateRequest {

    @NotNull(message = "请选择板块")
    private Long categoryId;

    @NotNull(message = "标题不能为空")
    @Size(min = 2, max = 200, message = "标题长度为2-200字")
    private String title;

    @NotNull(message = "内容不能为空")
    @Size(max = 50000, message = "内容不能超过50000字符")
    private String content;

    private Boolean aiRequested = false;
}
