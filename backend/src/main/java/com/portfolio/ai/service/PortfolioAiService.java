package com.portfolio.ai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

@Service
public class PortfolioAiService {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    private final String PORTFOLIO_CONTEXT = """
            You are an AI assistant for Vishal Kushwaha's portfolio. Vishal is a Full Stack Developer at Cognizant with skills in React, Java, Spring Boot, JavaScript, Supabase, PostgreSQL, and more.
            Always provide detailed, complete answers. Be friendly and helpful.""";

    public PortfolioAiService(@Value("${OPENAI_API_KEY:}") String apiKey) {
        this.restTemplate = new RestTemplate();
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        System.out.println("OpenAI API Key loaded: " + (this.apiKey.isEmpty() ? "MISSING" : "OK"));
    }

    public String askQuestion(String question) {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                return "Error: OpenAI API key not configured.";
            }

            String fullPrompt = PORTFOLIO_CONTEXT + "\n\nUser Question: " + question;

            String requestBody = """
                    {
                        "model": "gpt-3.5-turbo",
                        "messages": [
                            {
                                "role": "user",
                                "content": "%s"
                            }
                        ],
                        "temperature": 0.5,
                        "max_tokens": 1500
                    }
                    """.formatted(escapeJson(fullPrompt));

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("Content-Type", "application/json");

            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

            System.out.println("Calling OpenAI API...");

            String response = restTemplate.postForObject(OPENAI_API_URL, request, String.class);

            return extractContent(response);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    private String extractContent(String response) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response);
        String content = root.at("/choices/0/message/content").asText("No response");
        String finishReason = root.at("/choices/0/finish_reason").asText("");

        if ("length".equals(finishReason)) {
            System.out.println("WARNING: Response was truncated due to token limit");
        }

        return content;
    }

    private String escapeJson(String input) {
        return input.replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }
}
