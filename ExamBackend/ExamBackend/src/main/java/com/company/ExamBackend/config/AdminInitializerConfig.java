package com.company.ExamBackend.config;

import com.company.ExamBackend.model.Users;
import com.company.ExamBackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializerConfig implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            Users admin = new Users();
            admin.setEmail("admin@test.com");
            admin.setName("Ethan Miller");
            admin.setRole("ADMIN");
            admin.setPassword(passwordEncoder.encode("admin123"));

            userRepository.save(admin);

            System.out.println("--------------------------------------");
            System.out.println("INITIAL ADMIN CREATED");
            System.out.println("Email: admin@company.com");
            System.out.println("Password: admin1234");
            System.out.println("--------------------------------------");
        }
    }
}