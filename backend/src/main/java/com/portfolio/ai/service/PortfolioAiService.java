package com.portfolio.ai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

@Service
public class PortfolioAiService {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    private final String PORTFOLIO_CONTEXT = """
            You are an AI assistant for Vishal Kushwaha's portfolio. Vishal is a Full Stack Developer at Cognizant with skills in React, Java, Spring Boot, JavaScript, Supabase, PostgreSQL, and more.

            Guidelines:
            - Always provide detailed, complete answers about Vishal's portfolio, skills, experience, or projects.
            - Be friendly and helpful.
            - If the question is not related to Vishal's portfolio or professional background, politely say: "I can only answer questions about Vishal's portfolio and professional experience. Feel free to ask me about his skills, projects, experience, or background!"
            - Never say you cannot answer - always provide a helpful response.""";

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

            ResponseEntity<String> response = restTemplate.exchange(
                OPENAI_API_URL,
                org.springframework.http.HttpMethod.POST,
                request,
                String.class
            );

            if (response.getBody() != null) {
                return extractContent(response.getBody());
            }
            return "Error: Empty response from OpenAI";
        } catch (HttpClientErrorException e) {
            String errorMsg = "OpenAI API Error: " + e.getStatusCode();
            System.err.println(errorMsg + " - " + e.getResponseBodyAsString());
            return "Error: API request failed. Please try again.";
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    private String extractContent(String response) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response);

        // Check for error in response
        if (root.has("error")) {
            String errorMsg = root.at("/error/message").asText("Unknown error");
            System.err.println("OpenAI Error: " + errorMsg);
            return "Error: " + errorMsg;
        }

        String content = root.at("/choices/0/message/content").asText("");
        if (content.isEmpty()) {
            return "Error: No response content from OpenAI";
        }

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
