package com.portfolio.ai.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class PortfolioAiService {

    private final ChatClient chatClient;

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
            - Portfolio Website: An interactive portfolio with AI chatbot powered by Spring AI and Google Gemini
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

    public PortfolioAiService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String askQuestion(String question) {
        return chatClient.prompt()
                .system(PORTFOLIO_CONTEXT)
                .user(question)
                .call()
                .content();
    }
}
