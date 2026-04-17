package com.company.ExamBackend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Value("${app.security.candidate-password-max-length}")
    private int maxLen;

    @Value("${app.security.default-candidate-password}")
    private String defaultPass;

    @Bean
    public OpenAPI customOpenAPI() {
        // MOVE THE LOGIC HERE
        String dynamicDescription = String.format(
                "Backend APIs for the Exam Portal.\n\n" +
                        "### System Configuration\n" +
                        "- **Max Password Length:** %d\n" +
                        "- **Default Candidate Password:** `%s`",
                maxLen, defaultPass
        );

        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("Exam Portal API")
                        .version("1.0")
                        .description(dynamicDescription))
                .addSecurityItem(new SecurityRequirement()
                        .addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}