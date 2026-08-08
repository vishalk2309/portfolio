package com.portfolio.ai.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GoogleGenAiConfig {

    @Value("${spring.ai.google.generativeai.api-key:}")
    private String apiKey;

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalStateException(
                "Google Gemini API key is not configured. " +
                "Please set SPRING_AI_GOOGLE_GENERATIVEAI_API_KEY environment variable or " +
                "spring.ai.google.generativeai.api-key in application.properties"
            );
        }
        return builder.build();
    }
}
