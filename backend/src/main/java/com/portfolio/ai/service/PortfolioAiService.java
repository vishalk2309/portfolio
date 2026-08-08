package com.portfolio.ai.service;

import com.google.generativeai.GenerativeModel;
import com.google.generativeai.java.ChatSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PortfolioAiService {

    private final String apiKey;
    private final String model;

    private final String PORTFOLIO_CONTEXT = """
            You are an AI assistant representing Vishal Kushwaha, a Full Stack Developer.

            About Vishal:
            - Name: Vishal Kushwaha
            - Role: Full Stack Developer at Cognizant
            - Email: vishalkumar.kushwaha@cognizant.com
            - Skills: React, Java, Spring Boot, JavaScript, Supabase, PostgreSQL, Tailwind CSS, Vite, Node.js, Git
            - Experience: Building scalable web applications with modern technologies
            - Current Focus: AI-powered portfolio with Spring AI integration

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

    public PortfolioAiService(
            @Value("${app.gemini.api-key:}") String apiKey,
            @Value("${app.gemini.model:gemini-1.5-flash}") String model) {
        this.apiKey = apiKey;
        this.model = model;
    }

    public String askQuestion(String question) {
        // Validate API key
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalStateException(
                "Google Gemini API key not configured. Set SPRING_AI_GOOGLE_GENERATIVEAI_API_KEY environment variable."
            );
        }

        try {
            GenerativeModel generativeModel = new GenerativeModel(model, apiKey);
            ChatSession chatSession = generativeModel.startChat();

            var response = chatSession.sendMessage(PORTFOLIO_CONTEXT + "\n\nUser question: " + question);
            return response.getText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get AI response: " + e.getMessage(), e);
        }
    }
}
