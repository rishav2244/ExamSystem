package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.PasswordResetToken;
import com.company.ExamBackend.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByEmail(String email);
    void deleteByEmail(String email);
}