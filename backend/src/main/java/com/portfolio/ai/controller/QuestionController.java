package com.portfolio.ai.controller;

import com.portfolio.ai.model.QuestionRequest;
import com.portfolio.ai.model.QuestionResponse;
import com.portfolio.ai.service.PortfolioAiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "*"})
public class QuestionController {

    private final PortfolioAiService aiService;

    public QuestionController(PortfolioAiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/ask")
    public ResponseEntity<QuestionResponse> askQuestion(@RequestBody QuestionRequest request) {
        if (request.getQuestion() == null || request.getQuestion().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String answer = aiService.askQuestion(request.getQuestion());
        QuestionResponse response = new QuestionResponse(request.getQuestion(), answer);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend is running!");
    }
}
