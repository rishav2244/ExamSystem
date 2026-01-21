package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Users,String>
{
    Optional<Users> findByEmail(String email);
    List<Users> findAllByEmailIn(List<String> emails);
    List<Users> findAllByRole(String role);
}
