package com.portfolio.ai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

@Service
public class PortfolioAiService {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    private final String PORTFOLIO_CONTEXT = """
            You are an AI assistant representing Vishal Kushwaha, a Full Stack Developer.

            About Vishal:
            - Name: Vishal Kushwaha
            - Role: Full Stack Developer at Cognizant
            - Email: vishalkumar.kushwaha@cognizant.com
            - Skills: React, Java, Spring Boot, JavaScript, Supabase, PostgreSQL, Tailwind CSS, Vite, Node.js, Git
            - Experience: Building scalable web applications with modern technologies
            - Current Focus: AI-powered portfolio with Google Gemini chatbot

            Projects:
            - Portfolio Website: An interactive portfolio with AI chatbot powered by Google Gemini
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

    public PortfolioAiService(@Value("${SPRING_AI_GOOGLE_GENERATIVEAI_API_KEY:}") String apiKey) {
        this.restTemplate = new RestTemplate();
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        System.out.println("API Key loaded: " + (this.apiKey.isEmpty() ? "MISSING" : "OK"));
    }

    public String askQuestion(String question) {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                return "Error: API key not configured. Please set SPRING_AI_GOOGLE_GENERATIVEAI_API_KEY environment variable.";
            }

            String fullPrompt = PORTFOLIO_CONTEXT + "\n\nUser Question: " + question;

            String requestBody = """
                    {
                        "contents": [{
                            "parts": [{
                                "text": "%s"
                            }]
                        }]
                    }
                    """.formatted(escapeJson(fullPrompt));

            String url = GEMINI_API_URL + "?key=" + apiKey;
            System.out.println("Calling Gemini API: " + url.substring(0, 50) + "...");

            String response = restTemplate.postForObject(url, requestBody, String.class);

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
        return root.at("/candidates/0/content/parts/0/text").asText("No response");
    }

    private String escapeJson(String input) {
        return input.replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }
}
