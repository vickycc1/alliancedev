package com.techcommunity.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RateLimit {

    int limit() default 10;

    int period() default 60;

    String message() default "请求过于频繁，请稍后重试";
}
