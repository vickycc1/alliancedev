package com.techcommunity.aspect;

import com.techcommunity.annotation.RateLimit;
import com.techcommunity.common.ErrorCode;
import com.techcommunity.exception.BusinessException;
import com.techcommunity.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.concurrent.TimeUnit;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class RateLimitAspect {

    private final RedisTemplate<String, Object> redisTemplate;

    @Around("@annotation(com.techcommunity.annotation.RateLimit)")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();
        RateLimit rateLimit = method.getAnnotation(RateLimit.class);

        String key = generateKey(point);
        int limit = rateLimit.limit();
        int period = rateLimit.period();

        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1) {
            redisTemplate.expire(key, period, TimeUnit.SECONDS);
        }

        if (count != null && count > limit) {
            log.warn("触发限流: key={}, count={}, limit={}", key, count, limit);
            throw new BusinessException(ErrorCode.RATE_LIMITED, rateLimit.message());
        }

        return point.proceed();
    }

    private String generateKey(ProceedingJoinPoint point) {
        String username = SecurityUtils.getCurrentUsername();
        String userId = username != null ? username : "anonymous";
        String methodName = point.getSignature().toShortString();
        return "rate_limit:" + userId + ":" + methodName;
    }
}
