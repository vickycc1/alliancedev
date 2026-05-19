package com.techcommunity.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReportCreateRequest {

    @NotNull(message = "目标ID不能为空")
    private Long targetId;

    @NotNull(message = "目标类型不能为空")
    private Integer targetType;

    @NotNull(message = "举报原因不能为空")
    @Size(max = 500, message = "举报原因不能超过500字")
    private String reason;
}
