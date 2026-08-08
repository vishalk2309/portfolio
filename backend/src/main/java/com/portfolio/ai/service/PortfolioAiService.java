package com.portfolio.ai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

@Service
public class PortfolioAiService {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private static final String GROK_API_URL = "https://api.x.ai/v1/chat/completions";

    private final String PORTFOLIO_CONTEXT = """
            You are an AI assistant representing Vishal Kushwaha, a Full Stack Developer.

            About Vishal:
            - Name: Vishal Kushwaha
            - Role: Full Stack Developer at Cognizant
            - Email: vishalkumar.kushwaha@cognizant.com
            - Skills: React, Java, Spring Boot, JavaScript, Supabase, PostgreSQL, Tailwind CSS, Vite, Node.js, Git
            - Experience: Building scalable web applications with modern technologies
            - Current Focus: AI-powered portfolio with Grok AI chatbot

            Projects:
            - Portfolio Website: An interactive portfolio with AI chatbot powered by Grok AI
            - Various full-stack applications using React and Spring Boot

            Education & Certifications: Working at Cognizant as a developer

            Guidelines:
            - Answer questions professionally and concisely
            - Be friendly and personable
            - Focus on technical skills and experience when relevant
            - If asked something not related to the portfolio or Vishal's work, politely redirect
            - Keep responses concise (2-3 sentences for most questions)
            - If you don't know something specific, say so honestly
            """;

    public PortfolioAiService(@Value("${GROK_API_KEY:}") String apiKey) {
        this.restTemplate = new RestTemplate();
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        System.out.println("Grok API Key loaded: " + (this.apiKey.isEmpty() ? "MISSING" : "OK"));
    }

    public String askQuestion(String question) {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                return "Error: Grok API key not configured. Please set GROK_API_KEY environment variable.";
            }

            String fullPrompt = PORTFOLIO_CONTEXT + "\n\nUser Question: " + question;

            String requestBody = """
                    {
                        "model": "grok-4.3",
                        "messages": [
                            {
                                "role": "user",
                                "content": "%s"
                            }
                        ],
                        "temperature": 0.7
                    }
                    """.formatted(escapeJson(fullPrompt));

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("Content-Type", "application/json");

            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

            System.out.println("Calling Grok API...");

            String response = restTemplate.postForObject(GROK_API_URL, request, String.class);

            return extractContent(response);
        } catch (Exception e) {
            System.err.println("Error in askQuestion: " + e.getMessage());
            e.printStackTrace();
            return "Sorry, I encountered an error: " + e.getMessage();
        }
    }

    private String extractContent(String response) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response);
        return root.at("/choices/0/message/content").asText("No response");
    }

    private String escapeJson(String input) {
        return input.replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }
}
