package com.techcommunity.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.techcommunity.entity.SensitiveWord;
import com.techcommunity.mapper.SensitiveWordMapper;
import com.techcommunity.service.ContentFilterService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContentFilterServiceImpl implements ContentFilterService {

    private final SensitiveWordMapper sensitiveWordMapper;

    @Value("${content-filter.enabled:true}")
    private boolean filterEnabled;

    private Map<Character, Set<String>> sensitiveWordMap = new HashMap<>();
    private Set<String> allSensitiveWords = new HashSet<>();

    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>");
    private static final Pattern SCRIPT_PATTERN = Pattern.compile("<script[^>]*>.*?</script>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern EVENT_HANDLER_PATTERN = Pattern.compile("on\\w+\\s*=", Pattern.CASE_INSENSITIVE);
    private static final Pattern JAVASCRIPT_PATTERN = Pattern.compile("javascript:", Pattern.CASE_INSENSITIVE);
    private static final Pattern IFRAME_PATTERN = Pattern.compile("<iframe[^>]*>.*?</iframe>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern OBJECT_PATTERN = Pattern.compile("<object[^>]*>.*?</object>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern EMBED_PATTERN = Pattern.compile("<embed[^>]*>", Pattern.CASE_INSENSITIVE);
    private static final Pattern EXPRESSION_PATTERN = Pattern.compile("expression\\s*\\(", Pattern.CASE_INSENSITIVE);

    private static final Set<String> ALLOWED_TAGS = Set.of(
            "p", "br", "strong", "b", "em", "i", "u", "s", "strike",
            "h1", "h2", "h3", "h4", "h5", "h6",
            "ul", "ol", "li", "dl", "dt", "dd",
            "blockquote", "pre", "code",
            "a", "img",
            "table", "thead", "tbody", "tr", "th", "td",
            "div", "span",
            "hr"
    );

    @PostConstruct
    public void init() {
        loadSensitiveWords();
    }

    private void loadSensitiveWords() {
        try {
            List<SensitiveWord> words = sensitiveWordMapper.selectList(
                    new LambdaQueryWrapper<SensitiveWord>()
            );
            for (SensitiveWord word : words) {
                String w = word.getWord().trim().toLowerCase();
                if (w.isEmpty()) continue;
                char firstChar = w.charAt(0);
                sensitiveWordMap.computeIfAbsent(firstChar, k -> new HashSet<>()).add(w);
                allSensitiveWords.add(w);
            }
            log.info("加载敏感词数量: {}", words.size());
        } catch (Exception e) {
            log.warn("加载敏感词失败: {}", e.getMessage());
        }
    }

    @Override
    public String cleanHtml(String content) {
        if (content == null || content.isEmpty()) {
            return content;
        }

        String cleaned = content;

        cleaned = SCRIPT_PATTERN.matcher(cleaned).replaceAll("");
        cleaned = IFRAME_PATTERN.matcher(cleaned).replaceAll("");
        cleaned = OBJECT_PATTERN.matcher(cleaned).replaceAll("");
        cleaned = EMBED_PATTERN.matcher(cleaned).replaceAll("");
        cleaned = EVENT_HANDLER_PATTERN.matcher(cleaned).replaceAll("data-blocked=");
        cleaned = JAVASCRIPT_PATTERN.matcher(cleaned).replaceAll("blocked:");
        cleaned = EXPRESSION_PATTERN.matcher(cleaned).replaceAll("blocked(");

        return cleaned;
    }

    @Override
    public String cleanText(String content) {
        if (content == null || content.isEmpty()) {
            return content;
        }

        String cleaned = HTML_TAG_PATTERN.matcher(content).replaceAll("");
        cleaned = cleaned.replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");

        return cleaned;
    }

    @Override
    public boolean containsSensitiveWord(String content) {
        if (!filterEnabled || content == null || content.isEmpty()) {
            return false;
        }

        String lowerContent = content.toLowerCase();
        for (int i = 0; i < lowerContent.length(); i++) {
            char c = lowerContent.charAt(i);
            Set<String> words = sensitiveWordMap.get(c);
            if (words != null) {
                for (String word : words) {
                    if (lowerContent.indexOf(word, i) == i) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    @Override
    public String filterSensitiveWord(String content) {
        if (!filterEnabled || content == null || content.isEmpty()) {
            return content;
        }

        String result = content;
        String lowerResult = result.toLowerCase();
        for (String word : allSensitiveWords) {
            int idx = 0;
            while ((idx = lowerResult.indexOf(word, idx)) != -1) {
                String replacement = "*".repeat(word.length());
                result = result.substring(0, idx) + replacement + result.substring(idx + word.length());
                lowerResult = result.toLowerCase();
                idx += word.length();
            }
        }
        return result;
    }

    @Override
    public void refreshSensitiveWords() {
        sensitiveWordMap.clear();
        allSensitiveWords.clear();
        loadSensitiveWords();
    }
}
