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
        // Check for API key from multiple sources
        String key = apiKey;
        if (key == null || key.isEmpty()) {
            key = System.getenv("SPRING_AI_GOOGLE_GENERATIVEAI_API_KEY");
        }
        if (key == null || key.isEmpty()) {
            key = System.getenv("GOOGLE_API_KEY");
        }

        if (key == null || key.isEmpty()) {
            System.err.println("WARNING: Google Gemini API key not found!");
            System.err.println("Please set SPRING_AI_GOOGLE_GENERATIVEAI_API_KEY environment variable");
        }

        return builder.build();
    }
}
