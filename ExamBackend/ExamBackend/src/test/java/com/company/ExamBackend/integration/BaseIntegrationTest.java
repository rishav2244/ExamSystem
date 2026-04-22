package com.company.ExamBackend.integration;

import com.company.ExamBackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT) // Starts ENTIRE application on any port.
@Testcontainers // Uses Testcontainers over docker.
@AutoConfigureMockMvc // Allows you to call endpoints without starting a full HTTP client. Acts like a "Browser".
public abstract class BaseIntegrationTest {

    @Container // Asks Testcontainers to go to docker and pull postgre 16 alpine image.
    @ServiceConnection // Overrides env file DB url to docker so that you don't bomb production DB.
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected UserRepository userRepository;
}