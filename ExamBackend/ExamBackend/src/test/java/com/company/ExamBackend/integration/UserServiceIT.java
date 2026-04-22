package com.company.ExamBackend.integration;

import com.company.ExamBackend.model.Users;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class UserServiceIT extends BaseIntegrationTest {

    // This runs whenever we run integration tests.
    @BeforeEach
    void setUp() {
        userRepository.deleteAll();// Clears the existing database in docker container.

        Users user1 = new Users(); //Creating a user
        user1.setEmail("alice@example.com");
        user1.setName("Alice");
        user1.setRole("ADMIN");
        user1.setPassword("encoded_pass");

        Users user2 = new Users(); //Creating another user
        user2.setEmail("bob@example.com");
        user2.setName("Bob");
        user2.setRole("CANDIDATE");
        user2.setPassword("encoded_pass");

        userRepository.saveAll(List.of(user1, user2)); //Saving both users
    }

    @Test
    @WithMockUser(roles = "ADMIN") // Act as admin in order to bypass security for those endpoints
    void shouldReturnPagedUsers() throws Exception {
        mockMvc.perform(get("/api/user/users") // Which endpoint to call
                        .param("page", "0") // Page number parameter
                        .param("size", "5") // Page size parameter
                        .param("sort", "name,asc") // Page to be sorted by?
                        .contentType(MediaType.APPLICATION_JSON)) // Basically expecting JSON to and fro
                //What all to consider as "good things"
                .andExpect(status().isOk()) // Response should be 200
                // $.content refers to the List inside the Spring Page object
                .andExpect(jsonPath("$.content", hasSize(2))) // Since we created 2 users, page size should
                // be 2.
                .andExpect(jsonPath("$.content[0].name", is("Alice"))) // Name of first user should be
                // Alice
                .andExpect(jsonPath("$.content[1].name", is("Bob"))) // Name of second user should be
                // Bob
                .andExpect(jsonPath("$.totalElements", is(2))); // Should have two elements in total
                // across all pages.
    }
}