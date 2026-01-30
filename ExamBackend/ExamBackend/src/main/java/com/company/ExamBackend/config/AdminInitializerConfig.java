package com.company.ExamBackend.config;

import com.company.ExamBackend.model.Users;
import com.company.ExamBackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializerConfig implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.security.default-admin-password}")
    private String defaultAdminPassword;

    @Value("${app.security.default-admin-email}")
    private String defaultAdminEmail;

    @Value("${app.security.default-admin-name}")
    private String defaultAdminName;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            Users admin = new Users();
            admin.setEmail(defaultAdminEmail);
            admin.setName(defaultAdminName);
            admin.setRole("ADMIN");
            admin.setPassword(passwordEncoder.encode(defaultAdminPassword));

            userRepository.save(admin);

            System.out.println("--------------------------------------");
            System.out.println("INITIAL ADMIN CREATED");
            System.out.println("Email: "+defaultAdminEmail);
            System.out.println("Password: "+defaultAdminPassword);
            System.out.println("--------------------------------------");
        }
    }
}