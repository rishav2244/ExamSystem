package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.CandidateRegisterRequestDTO;
import com.company.ExamBackend.dto.RegistrationResponseDTO;
import com.company.ExamBackend.dto.UserHeavyDTO;
import com.company.ExamBackend.dto.UserSearchDTO;
import com.company.ExamBackend.mapper.UserMapper;
import com.company.ExamBackend.model.PendingRegistration;
import com.company.ExamBackend.model.Users;
import com.company.ExamBackend.repository.PendingRegistrationRepository;
import com.company.ExamBackend.repository.UserRepository;
import com.company.ExamBackend.service.impl.EmailServiceImpl;
import com.company.ExamBackend.service.impl.UserServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PendingRegistrationRepository pendingRegistrationRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    @Mock
    private EmailServiceImpl emailService;

    @Test
    void getCandidates() {
    }

    @Test
    void checkGetAllUsersForOneUser() {
        // Let's assume page of size 5
        Pageable pageable = PageRequest.of(0, 5);

        // Fake user
        Users mockUser = new Users();
        mockUser.setEmail("test@company.com");
        mockUser.setName("Test User");

        // This page will contain the user
        Page<Users> userPage = new PageImpl<>(List.of(mockUser));

        // Expected DTO structure to be returned
        UserHeavyDTO expectedDto = new UserHeavyDTO();
        expectedDto.setEmail("test@company.com");
        expectedDto.setName("Test User");

        // When repository is called with any pageable, return our userPage
        Mockito.when(userRepository.findAll(Mockito.any(Pageable.class))).thenReturn(userPage);

        // When mapper is called with our mockUser, return our DTO
        Mockito.when(userMapper.toUserHeavy(mockUser)).thenReturn(expectedDto);

        // Calling the service method
        Page<UserHeavyDTO> result = userService.getUsers(pageable);

        // Asserting to verify the results
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("test@company.com", result.getContent().get(0).getEmail());

        // Verify interactions
        Mockito.verify(userRepository).findAll(pageable);
        Mockito.verify(userMapper).toUserHeavy(Mockito.any(Users.class));
    }

    @Test
    void searchUsers_ShouldReturnFilteredPage() {
        // Creates the list to hold fake users
        List<Users> allUsers = new ArrayList<>();

        // Creates 30 Candidates
        for (int i = 0; i < 30; i++) {
            Users u = new Users();
            u.setName("Candidate " + i);
            u.setEmail("candidate" + i + "@test.com");
            u.setRole("CANDIDATE");
            allUsers.add(u);
        }

        // Creates 3 Admins
        for (int i = 0; i < 3; i++) {
            Users u = new Users();
            u.setName("Admin " + i);
            u.setEmail("admin" + i + "@admin.com");
            u.setRole("ADMIN");
            allUsers.add(u);
        }

        // In Mockito, we have to manually filter and select
        Page<Users> userPage = new PageImpl<>(allUsers, PageRequest.of(0, 33), allUsers.size());

        // 3. Setup the Mock
        Mockito.when(userRepository.findUserByQuery(Mockito.anyString(), Mockito.any(Pageable.class)))
                .thenReturn(userPage);

        // If you use a mapper inside a .map(), you must mock it
        Mockito.when(userMapper.toUserHeavy(Mockito.any(Users.class))).thenReturn(new UserHeavyDTO());

        // 4. Act
        UserSearchDTO searchDTO = new UserSearchDTO();
        searchDTO.setSearchQuery("admin");
        Page<UserHeavyDTO> result = userService.searchUsers(searchDTO, 10, 0, "name");

        // 5. Assert
        assertEquals(33, result.getTotalElements());
    }

    @Test
    void searchUsers_ShouldReturnOnlyAdmins_WhenQueryIsAdmin() {
        List<Users> adminsOnly = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            Users u = new Users();
            u.setName("Admin " + i);
            u.setRole("ADMIN");
            adminsOnly.add(u);
        }

        Page<Users> expectedFilteredPage = new PageImpl<>(adminsOnly, PageRequest.of(0, 10), 3);

        Mockito.when(userRepository.findUserByQuery(Mockito.eq("admin"), Mockito.any(Pageable.class)))
                .thenReturn(expectedFilteredPage);

        Mockito.when(userMapper.toUserHeavy(Mockito.any(Users.class))).thenReturn(new UserHeavyDTO());

        UserSearchDTO searchDTO = new UserSearchDTO();
        searchDTO.setSearchQuery("admin");
        Page<UserHeavyDTO> result = userService.searchUsers(searchDTO, 10, 0, "name");

        assertEquals(3, result.getTotalElements(), "The search should only return 3 users");
    }

    @Test
    void searchCandidates() {
    }

    @Test
    void getUserById() {
    }

    @Test
    void registerHappyCase() {

        ArgumentCaptor<PendingRegistration> captor = ArgumentCaptor.forClass(PendingRegistration.class);

        CandidateRegisterRequestDTO candidateRegisterRequestDTO =
                new CandidateRegisterRequestDTO();
        candidateRegisterRequestDTO.setEmail("candidate@candidate.com");
        candidateRegisterRequestDTO.setName("Candidate surname");
        candidateRegisterRequestDTO.setPassword("Test password");

        RegistrationResponseDTO registrationResponseDTO =
                new RegistrationResponseDTO();
        registrationResponseDTO.setMessage(
                "OTP sent to candidate@candidate.com");
        registrationResponseDTO.setMaxAttempts(6);
        registrationResponseDTO.setResendSeconds(60);
        registrationResponseDTO.setTtlSeconds(600);

        Mockito.when(userRepository.findByEmail(Mockito.anyString()))
                .thenReturn(Optional.empty());
        Mockito.when(pendingRegistrationRepository.findByEmail(Mockito.anyString()))
                .thenReturn(Optional.empty());
        Mockito.when(passwordEncoder.encode(Mockito.anyString()))
                .thenReturn("hashed_value");

        RegistrationResponseDTO result =
                userService.candidateRegisterAttempt(
                        candidateRegisterRequestDTO);

        assertNotNull(result); //Non null result means it went well.
        assertEquals(registrationResponseDTO.getMessage(), result.getMessage());

        Mockito.verify(emailService)
                .sendOtp(Mockito
                        .eq("candidate@candidate.com"), Mockito.anyString());
        Mockito.verify(pendingRegistrationRepository).save(captor.capture());

        PendingRegistration captured = captor.getValue();
        assertEquals("Candidate surname", captured.getName());
        assertEquals("candidate@candidate.com", captured.getEmail());
        assertEquals("hashed_value", captured.getPassword());
        assertTrue(captured.isValid());
    }
}