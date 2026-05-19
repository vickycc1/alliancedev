package com.techcommunity.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.techcommunity.entity.Notification;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface NotificationMapper extends BaseMapper<Notification> {
}
