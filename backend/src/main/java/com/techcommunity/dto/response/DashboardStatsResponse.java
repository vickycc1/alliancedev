package com.techcommunity.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class DashboardStatsResponse {

    private Long userTotal;

    private Long userTodayNew;

    private Long postTotal;

    private Long postTodayNew;

    private Long commentTotal;

    private Long commentTodayNew;

    private Long reportPending;

    private Long aiCallCount;

    private Double aiSuccessRate;

    private List<TrendItem> activeTrend;

    @Data
    public static class TrendItem {
        private String date;
        private Integer users;
        private Integer posts;
    }
}
