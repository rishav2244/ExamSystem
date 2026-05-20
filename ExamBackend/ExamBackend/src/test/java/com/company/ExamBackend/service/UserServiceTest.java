package com.company.ExamBackend.service;

import com.company.ExamBackend.dto.*;
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

import java.time.Instant;
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
    void registerHappyCase() {

        ArgumentCaptor<PendingRegistration> captor = ArgumentCaptor.forClass(PendingRegistration.class);

        CandidateRegisterRequestDTO candidateRegisterRequestDTO =
                createCandidateRegisterRequestDTO(
                        "Candidate surname",
                        "candidate@candidate.com",
                        "Test password"
                );

        RegistrationResponseDTO registrationResponseDTO =
                createRegistrationResponseDTO(
                        "OTP sent to candidate@candidate.com",
                        6,
                        60,
                        600
                );

        registrationHappyMockHits();

        RegistrationResponseDTO result =
                userService.candidateRegisterAttempt(
                        candidateRegisterRequestDTO);

        assertNotNull(result); //Not null result means it went well.
        assertEquals(registrationResponseDTO.getMessage(), result.getMessage());

        Mockito.verify(emailService)
                .sendRegistrationOtp(Mockito
                        .eq("candidate@candidate.com"), Mockito.anyString());
        Mockito.verify(pendingRegistrationRepository).save(captor.capture());

        PendingRegistration captured = captor.getValue();
        assertEquals("Candidate surname", captured.getName());
        assertEquals("candidate@candidate.com", captured.getEmail());
        assertEquals("hashed_value", captured.getPassword());
        assertTrue(captured.isValid());
    }

    @Test
    void registerEmailExists()
    {
        String existingEmail = "candidate@gmail.com";

        CandidateRegisterRequestDTO candidateRegisterRequestDTO =
                createCandidateRegisterRequestDTO(
                        "Candidate surname",
                        existingEmail,
                        "Test password"
                );

        Users existingUser = new Users();
        existingUser.setEmail(existingEmail);

        Mockito.when(userRepository.findByEmail(existingEmail))
                .thenReturn(Optional.of(existingUser));

        // We expect an EmailExistsException here
        assertThrows(com.company.ExamBackend.exception.EmailExistsException.class, () -> {
            userService.candidateRegisterAttempt(candidateRegisterRequestDTO);
        });

        // Verify that we never tried to save anything to the pending repository
        Mockito.verify(pendingRegistrationRepository, Mockito.never()).save(Mockito.any());

        // Verify that NO email was sent
        Mockito.verify(emailService, Mockito.never()).sendRegistrationOtp(Mockito.anyString(), Mockito.anyString());
    }

    @Test
    void registerMaxOTPAttemptsBlocked() {

        String email = "candidate@candidate.com";
        CandidateRegisterRequestDTO dto = createCandidateRegisterRequestDTO(
                "John Doe", email, "password");

        // Creating a pending registration that has reached limit
        // and its lockout period hasn't expired.
        PendingRegistration lockedRegistration = createPendingRegistration(
                email,
                "John Doe",
                "password",
                "123456",
                6,
                false,
                Instant.now().plusSeconds(3600) // 1 hour locking
        );

        Mockito.when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        Mockito.when(pendingRegistrationRepository.findByEmail(email))
                .thenReturn(Optional.of(lockedRegistration));

        // Should throw InvalidActionException because of invalid, ie lockout.
        assertThrows(com.company.ExamBackend.exception.InvalidActionException.class, () -> {
            userService.candidateRegisterAttempt(dto);
        });

        // Ensure we didn't generate a new OTP or save any updates
        Mockito.verify(emailService, Mockito.never()).sendRegistrationOtp(Mockito.anyString(), Mockito.anyString());
        // The only interaction with pendingRegistrationRepository should have been the findByEmail
        Mockito.verify(pendingRegistrationRepository, Mockito.never()).save(Mockito.any());
    }

    @Test
    void verifyOTPHappyCase() {
        String email = "candidate@email.com";
        String rawOtp = "123456";

        // Create pending registration
        PendingRegistration pending = createPendingRegistration(
                email, "John Doe", "password", rawOtp, 0, true, Instant.now().plusSeconds(600));

        VerifyOtpRequestDTO dto = new VerifyOtpRequestDTO();
        dto.setEmail(email);
        dto.setOtp(rawOtp);

        Users mappedUser = new Users();
        mappedUser.setEmail(email);
        mappedUser.setName("John Doe");

        // Mocking Repository Find
        Mockito.when(pendingRegistrationRepository.findByEmail(email))
                .thenReturn(Optional.of(pending));

        // Mocking Password Match
        Mockito.when(passwordEncoder
                        .matches(Mockito.eq(rawOtp), Mockito.anyString()))
                .thenReturn(true);

        // Mocking Mapper
        Mockito.when(userMapper.pendingToUser(pending)).thenReturn(mappedUser);
        Mockito.when(userMapper.toUserResponse(mappedUser)).thenReturn(new UserResponseDTO());

        // Mocking the User Save
        Mockito.when(
                userRepository
                        .save(Mockito.any(Users.class))).thenReturn(mappedUser);

        UserResponseDTO result = userService
                .verifyRegistration(dto);

        assertNotNull(result);
        Mockito.verify(userRepository).save(Mockito.any(Users.class));
        Mockito.verify(pendingRegistrationRepository).delete(pending);
        // Verify we didn't accidentally increment attempts
        assertEquals(0, pending.getAttempts());
    }

//    ==========================================Helper Methods=========================================================

    private CandidateRegisterRequestDTO createCandidateRegisterRequestDTO(
            String name,
            String email,
            String password
    ) {
        CandidateRegisterRequestDTO candidateRegisterRequestDTO =
                new CandidateRegisterRequestDTO();
        candidateRegisterRequestDTO.setEmail(email);
        candidateRegisterRequestDTO.setName(name);
        candidateRegisterRequestDTO.setPassword(password);
        return  candidateRegisterRequestDTO;
    }

    private RegistrationResponseDTO createRegistrationResponseDTO(
            String message,
            int maxAttempts,
            int resendSeconds,
            int ttlSeconds
    ){
        RegistrationResponseDTO registrationResponseDTO =
                new RegistrationResponseDTO();
        registrationResponseDTO.setMessage(message);
        registrationResponseDTO.setMaxAttempts(maxAttempts);
        registrationResponseDTO.setResendSeconds(resendSeconds);
        registrationResponseDTO.setTtlSeconds(ttlSeconds);
        return registrationResponseDTO;
    }

    private void registrationHappyMockHits()
    {
        Mockito.when(userRepository.findByEmail(Mockito.anyString()))
                .thenReturn(Optional.empty());
        Mockito.when(pendingRegistrationRepository.findByEmail(Mockito.anyString()))
                .thenReturn(Optional.empty());
        Mockito.when(passwordEncoder.encode(Mockito.anyString()))
                .thenReturn("hashed_value");
    }

    private Users createUser(
            String name,
            String role,
            String password
    ) {
        Users user = new Users();
        user.setName(name);
        user.setRole(role);
        user.setPassword(passwordEncoder.encode(password));
        return user;
    }

    private PendingRegistration createPendingRegistration(
        String email,
        String name,
        String password,
        String otp,
        Integer attempts,
        Boolean valid,
        Instant validUntil
    ){
        String checkedEmail =
                email != null ? email : "candidate@candidate.com";
        String checkedName =
                name != null ? name : "John Doe" ;
        String checkedPassword = passwordEncoder.encode(
                password != null ? password : "password") ;
        Integer checkedAttempts =
                attempts != null ? attempts : Integer.valueOf(6) ;
        Boolean checkedValid =
                valid != null ? valid : Boolean.valueOf(true) ;
        Instant checkedValidUntil =
                 validUntil != null ? validUntil : Instant.now().plusSeconds(60);
        PendingRegistration pendingRegistration = new PendingRegistration();
        pendingRegistration.setEmail(checkedEmail);
        pendingRegistration.setName(checkedName);
        pendingRegistration.setPassword(checkedPassword);
        pendingRegistration.setOtp("MOCKED_HASHED_OTP");
        pendingRegistration.setAttempts(checkedAttempts);
        pendingRegistration.setValid(checkedValid);
        pendingRegistration.setValidUntil(checkedValidUntil);

        return pendingRegistration;
    }
}