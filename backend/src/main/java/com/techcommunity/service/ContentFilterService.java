package com.techcommunity.service;

public interface ContentFilterService {

    String cleanHtml(String content);

    String cleanText(String content);

    boolean containsSensitiveWord(String content);

    String filterSensitiveWord(String content);
}
