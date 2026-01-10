package com.company.ExamBackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // Apply CORS to all routes
                .allowedOrigins("http://localhost:5173")  // Replace with your React app's URL
                .allowedMethods("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")  // Accept all headers
                .allowCredentials(true)  // Allow sending cookies
                .maxAge(3600);  // Cache pre-flight requests for 1 hour
    }
}
