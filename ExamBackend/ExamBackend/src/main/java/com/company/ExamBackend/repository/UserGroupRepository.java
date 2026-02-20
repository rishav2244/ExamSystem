package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.UserGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserGroupRepository extends JpaRepository<UserGroup, String > {

    //Used to see if group name is already taken.
    boolean existsByName(String name);

    // Gets all relevant info since we require some user info as well.
    @Query("SELECT ug FROM UserGroup ug JOIN FETCH ug.createdBy")
    List<UserGroup> findAllWithCreator();
}
