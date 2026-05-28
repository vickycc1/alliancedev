package com.techcommunity.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReportResponse {

    private Long id;
    private Long reporterId;
    private String reporterName;
    private Integer targetType;
    private Long targetId;
    private String targetTitle;
    private String targetContent;
    private String reason;
    private Integer status;
    private String handlerName;
    private String handleResult;
    private LocalDateTime handleTime;
    private LocalDateTime createdAt;
}
