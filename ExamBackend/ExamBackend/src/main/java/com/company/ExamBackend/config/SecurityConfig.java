package com.company.ExamBackend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final HandlerExceptionResolver resolver;

    public SecurityConfig(JwtFilter jwtFilter,
                          @Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolver) {
        this.jwtFilter = jwtFilter;
        this.resolver = resolver;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(org.springframework.security.config.Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/user/login").permitAll()
                        .requestMatchers("/api/user/self-register").permitAll()
                        .requestMatchers("/api/user/verify-registration-otp").permitAll()
                        .requestMatchers("/api/user/resend-registration-otp").permitAll()
                        .requestMatchers("/api/user/forgot-password").permitAll()
                        .requestMatchers("/api/user/verify-reset-password").permitAll()
                        .requestMatchers("/api/user/resend-forgot-password").permitAll()
                        .requestMatchers("/api/user/refresh").permitAll()
                        .requestMatchers("/api/user/reset-password").authenticated()
                        .requestMatchers("/api/user/logout").authenticated()
                        .requestMatchers("/api/candidateUser/**").hasRole("CANDIDATE")
                        .requestMatchers("/api/snapshots/submission/**").hasRole("ADMIN")
                        .requestMatchers("/api/snapshots/**").hasRole("CANDIDATE")
                        .requestMatchers("/api/user/bulk-register").hasRole("ADMIN")
                        .requestMatchers("/api/user/**").hasRole("ADMIN")//Done after normal login
                        //since doing before that would override login's permitAll and thus restrict
                        //login only to admin.
                        .requestMatchers("/api/exams/**").hasRole("ADMIN")
                        .requestMatchers("/api/candidate/**").hasRole("ADMIN")
                        .requestMatchers("/api/userGroups/**").hasRole("ADMIN")
                        .requestMatchers("/api/submissions/**").hasRole("ADMIN")
                        .requestMatchers("/api/images/admin/**").hasRole("ADMIN")
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(ex -> ex
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            resolver.resolveException(request, response, null, accessDeniedException);
                        })
                )
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}