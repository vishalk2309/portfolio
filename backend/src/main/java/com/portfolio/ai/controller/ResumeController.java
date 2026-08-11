package com.portfolio.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/resume")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "*"})
public class ResumeController {

    @GetMapping("/download")
    public ResponseEntity<Map<String, String>> getResumeDownloadUrl() {
        Map<String, String> response = new HashMap<>();

        String supabaseUrl = System.getenv("SUPABASE_URL");
        String supabaseKey = System.getenv("SUPABASE_ANON_KEY");

        if (supabaseUrl == null || supabaseKey == null) {
            response.put("error", "Supabase configuration not found");
            return ResponseEntity.badRequest().body(response);
        }

        // Construct the public URL for the resume in Supabase Storage
        // Format: https://{project-id}.supabase.co/storage/v1/object/public/{bucket}/{path}
        String resumeUrl = supabaseUrl.replaceAll("/+$", "") +
                          "/storage/v1/object/public/resume/vishal-resume.pdf";

        response.put("url", resumeUrl);
        response.put("fileName", "Vishal_Kushwaha_Resume.pdf");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Resume service is running!");
    }
}
