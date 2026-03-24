package com.company.ExamBackend.config;

import com.company.ExamBackend.exception.InvalidTokenException;
import com.company.ExamBackend.exception.TokenExpiredException;
import com.company.ExamBackend.service.CustomUserDetailsService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;
    private final HandlerExceptionResolver resolver;

    public JwtFilter(JwtUtils jwtUtils,
                     CustomUserDetailsService userDetailsService,
                     @Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolver) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
        this.resolver = resolver;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authHeader.substring(7);
            String email = jwtUtils.validateAndGetEmail(token);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                authenticateUser(email, request);
            }

            filterChain.doFilter(request, response);

        } catch (ExpiredJwtException e) {
            // Specific signal for Frontend to call /refresh
            resolver.resolveException(request, response, null, new TokenExpiredException("Access token expired"));
        } catch (JwtException | IllegalArgumentException e) {
            // Signal for Frontend to clear local storage and redirect to login
            resolver.resolveException(request, response, null, new InvalidTokenException("Token is invalid or tampered with"));
        }
    }

    private void authenticateUser(String email, HttpServletRequest request) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }
}