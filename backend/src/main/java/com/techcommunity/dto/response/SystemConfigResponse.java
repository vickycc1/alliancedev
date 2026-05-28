package com.techcommunity.dto.response;

import lombok.Data;

@Data
public class SystemConfigResponse {

    private String aiBaseUrl;
    private String aiApiKey;
    private String aiModel;
    private Double aiTemperature;
    private Integer aiMaxTokens;
    private String casServerUrl;
    private String casCallbackUrl;
    private Integer postRateLimit;
    private Integer commentRateLimit;
    private Integer notificationRetentionDays;
}
