package com.portfolio.ai.config;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentRequest;
import com.google.genai.types.Part;
import com.google.genai.types.TextPart;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.ai.google.genai.api.GoogleGenAiApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GoogleGenAiConfig {

    @Value("${spring.ai.google.generativeai.api-key:}")
    private String apiKey;

    @Bean
    public ChatClient chatClient() {
        // Get API key from environment variable with fallback to property
        String key = apiKey;
        if (key == null || key.isEmpty()) {
            key = System.getenv("SPRING_AI_GOOGLE_GENERATIVEAI_API_KEY");
        }
        if (key == null || key.isEmpty()) {
            key = System.getenv("GOOGLE_API_KEY");
        }

        if (key == null || key.isEmpty()) {
            throw new IllegalStateException(
                "Google Gemini API key not found. Set SPRING_AI_GOOGLE_GENERATIVEAI_API_KEY environment variable."
            );
        }

        GoogleGenAiApi googleGenAiApi = new GoogleGenAiApi(key);
        GoogleGenAiChatModel chatModel = new GoogleGenAiChatModel(googleGenAiApi);

        return ChatClient.builder(chatModel).build();
    }
}
