package com.techcommunity.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "cas")
public class CasConfig {

    private Boolean enabled;
    private String serverUrl;
    private String clientService;
}
