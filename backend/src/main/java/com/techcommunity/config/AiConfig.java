package com.techcommunity.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "ai")
public class AiConfig {

    private Boolean enabled;
    private String baseUrl;
    private String apiKey;
    private String model;
    private Integer maxTokens;
    private Double temperature;
    private Integer timeout;
}
