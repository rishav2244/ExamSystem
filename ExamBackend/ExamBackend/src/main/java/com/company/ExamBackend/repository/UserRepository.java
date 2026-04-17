package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Users,String>
{
    Optional<Users> findByEmail(String email);
    List<Users> findAllByEmailIn(List<String> emails);
    Page<Users> findAllByRole(String role, Pageable pageable);

//    Page<Users> findByRoleAndEmailContainingIgnoreCaseOrNameContainingIgnoreCase(
//            String role, String email, String name, Pageable pageable);

    @Query("SELECT u " +
            "FROM Users u " +
            "WHERE u.name ILIKE %:query% " +
            "OR u.role ILIKE %:query% " +
            "OR u.email ILIKE %:query%"
    )
    Page<Users> findUserByQuery(
        String query, Pageable pageable);

    @Query("SELECT u " +
            "FROM Users u " +
            "WHERE (u.name ILIKE %:query% " +
            "OR u.email ILIKE %:query%) " +
            "AND u.role = 'CANDIDATE'"
    )
    Page<Users> findCandidateByQuery(
            String query, Pageable pageable);
}
