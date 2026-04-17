package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.LoginResponseDTO;
import com.company.ExamBackend.dto.TokenResponseDTO;
import com.company.ExamBackend.dto.UserHeavyDTO;
import com.company.ExamBackend.dto.UserResponseDTO;
import com.company.ExamBackend.model.PendingRegistration;
import com.company.ExamBackend.model.Users;
import org.springframework.stereotype.Component;

@Component
public class UserMapper
{
    public UserResponseDTO toUserResponse(Users user)
    {
        UserResponseDTO userResponseDTO = new UserResponseDTO();
        userResponseDTO.setEmail(user.getEmail());
        userResponseDTO.setRole(user.getRole());
        userResponseDTO.setName(user.getName());
        return userResponseDTO;
    }

    public UserHeavyDTO toUserHeavy(Users user)
    {
        UserHeavyDTO userHeavyDTO = new UserHeavyDTO();
        userHeavyDTO.setId(user.getId());
        userHeavyDTO.setEmail(user.getEmail());
        userHeavyDTO.setRole(user.getRole());
        userHeavyDTO.setName(user.getName());
        return userHeavyDTO;
    }

    public Users pendingToUser(PendingRegistration pending) {
        Users user = new Users();
        user.setEmail(pending.getEmail());
        user.setName(pending.getName());
        user.setPassword(pending.getPassword());
        user.setRole("CANDIDATE");
        return user;
    }

    public LoginResponseDTO toLoginResponse(Users user, TokenResponseDTO tokens) {
        return LoginResponseDTO.builder()
                .user(toUserResponse(user))
                .tokens(tokens)
                .build();
    }
}
