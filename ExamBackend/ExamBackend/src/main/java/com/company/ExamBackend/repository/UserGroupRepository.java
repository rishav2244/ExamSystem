package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.UserGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserGroupRepository extends JpaRepository<UserGroup, String > {

    // Scopes the name check to the specific admin
    boolean existsByNameAndCreatedBy_Email(String name, String email);

    // Only fetches groups belonging to the parent admin
    @Query("SELECT ug FROM UserGroup ug JOIN FETCH ug.createdBy WHERE ug.createdBy.email = :email")
    List<UserGroup> findByCreatedBy_Email(String email);
}
