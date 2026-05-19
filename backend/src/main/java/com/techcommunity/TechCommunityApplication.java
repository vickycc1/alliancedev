package com.techcommunity;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@MapperScan("com.techcommunity.mapper")
@EnableAsync
public class TechCommunityApplication {

    public static void main(String[] args) {
        SpringApplication.run(TechCommunityApplication.class, args);
    }
}
