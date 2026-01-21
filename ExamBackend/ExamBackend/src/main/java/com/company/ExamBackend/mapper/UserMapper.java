package com.company.ExamBackend.mapper;

import com.company.ExamBackend.dto.RegisterRequestDTO;
import com.company.ExamBackend.dto.UserHeavyDTO;
import com.company.ExamBackend.dto.UserResponseDTO;
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

    public Users toUser(RegisterRequestDTO registerRequestDTO)
    {
        Users user = new Users();
        user.setEmail(registerRequestDTO.getEmail());
        user.setPassword(registerRequestDTO.getPassword());
        user.setRole(registerRequestDTO.getRole());
        user.setName(registerRequestDTO.getName());
        return user;
    }
}
