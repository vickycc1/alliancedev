package com.techcommunity.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "file")
public class FileConfig {

    private String uploadPath;
    private String avatarPath;
    private Long maxAvatarSize;
}
