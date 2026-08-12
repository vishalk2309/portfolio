package com.portfolio.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/resume")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "*"})
public class ResumeUploadController {

    private static final String RESUME_BUCKET = "resume";
    private static final String RESUME_FILE_NAME = "vishal-resume.pdf";

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("email") String email) {

        Map<String, String> response = new HashMap<>();

        String ownerEmail = System.getenv("VITE_OWNER_EMAIL");
        if (ownerEmail == null) {
            ownerEmail = "kushwahavishal296@gmail.com";
        }

        if (!email.equalsIgnoreCase(ownerEmail)) {
            response.put("error", "Unauthorized: Only owner can upload resume");
            return ResponseEntity.status(403).body(response);
        }

        if (!file.getContentType().contains("pdf") &&
            !file.getContentType().contains("document") &&
            !file.getContentType().contains("word")) {
            response.put("error", "Only PDF or document files are allowed");
            return ResponseEntity.badRequest().body(response);
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            response.put("error", "File size exceeds 5MB limit");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            String supabaseUrl = System.getenv("SUPABASE_URL");
            String supabaseServiceKey = System.getenv("SUPABASE_SERVICE_KEY");

            if (supabaseUrl == null || supabaseServiceKey == null) {
                response.put("error", "Supabase configuration missing");
                return ResponseEntity.badRequest().body(response);
            }

            // Upload to Supabase using service role key (bypasses RLS)
            String uploadUrl = supabaseUrl + "/storage/v1/object/" + RESUME_BUCKET + "/" + RESUME_FILE_NAME;

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(uploadUrl))
                    .header("Authorization", "Bearer " + supabaseServiceKey)
                    .header("Content-Type", file.getContentType())
                    .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                    .build();

            HttpResponse<String> httpResponse = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (httpResponse.statusCode() >= 200 && httpResponse.statusCode() < 300) {
                String downloadUrl = supabaseUrl + "/storage/v1/object/public/" + RESUME_BUCKET + "/" + RESUME_FILE_NAME;
                response.put("message", "Resume uploaded successfully");
                response.put("url", downloadUrl);
                return ResponseEntity.ok(response);
            } else {
                response.put("error", "Supabase upload failed: " + httpResponse.body());
                return ResponseEntity.status(500).body(response);
            }

        } catch (IOException | InterruptedException e) {
            response.put("error", "Upload failed: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, String>> deleteResume(
            @RequestParam("email") String email) {

        Map<String, String> response = new HashMap<>();

        String ownerEmail = System.getenv("VITE_OWNER_EMAIL");
        if (ownerEmail == null) {
            ownerEmail = "kushwahavishal296@gmail.com";
        }

        if (!email.equalsIgnoreCase(ownerEmail)) {
            response.put("error", "Unauthorized: Only owner can delete resume");
            return ResponseEntity.status(403).body(response);
        }

        try {
            String supabaseUrl = System.getenv("SUPABASE_URL");
            String supabaseServiceKey = System.getenv("SUPABASE_SERVICE_KEY");

            if (supabaseUrl == null || supabaseServiceKey == null) {
                response.put("error", "Supabase configuration missing");
                return ResponseEntity.badRequest().body(response);
            }

            String deleteUrl = supabaseUrl + "/storage/v1/object/" + RESUME_BUCKET + "/" + RESUME_FILE_NAME;

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(deleteUrl))
                    .header("Authorization", "Bearer " + supabaseServiceKey)
                    .DELETE()
                    .build();

            HttpResponse<String> httpResponse = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (httpResponse.statusCode() >= 200 && httpResponse.statusCode() < 300) {
                response.put("message", "Resume deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("error", "Supabase delete failed: " + httpResponse.body());
                return ResponseEntity.status(500).body(response);
            }

        } catch (IOException | InterruptedException e) {
            response.put("error", "Delete failed: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
