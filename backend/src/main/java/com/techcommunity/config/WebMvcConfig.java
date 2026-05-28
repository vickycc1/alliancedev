package com.techcommunity.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final FileConfig fileConfig;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String avatarPath = Paths.get(fileConfig.getAvatarPath()).toAbsolutePath().toUri().toString();
        if (!avatarPath.endsWith("/")) {
            avatarPath = avatarPath + "/";
        }
        registry.addResourceHandler("/uploads/avatars/**")
                .addResourceLocations(avatarPath);

        String uploadPath = Paths.get(fileConfig.getUploadPath()).toAbsolutePath().toUri().toString();
        if (!uploadPath.endsWith("/")) {
            uploadPath = uploadPath + "/";
        }
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath);
    }
}
