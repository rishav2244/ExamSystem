package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.GroupMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember,String> {

    //Remember to use Count queries since Group members are lazy fetched.

    @Query(value = "SELECT gm " +
            "FROM GroupMember gm " +
            "JOIN FETCH gm.user " +
            "WHERE gm.group.createdBy.email = :adminEmail " +
            "AND gm.group.id = :groupId",
            countQuery = "SELECT COUNT(gm) " +
                    "FROM GroupMember gm " +
                    "WHERE gm.group.createdBy.email = :adminEmail " +
                    "AND gm.group.id = :groupId"
    )
    Page<GroupMember> findByGroupId(String groupId, String adminEmail, Pageable pageable);

    @Modifying
    @Query("DELETE FROM GroupMember gm WHERE gm.group.id = :groupId")
    void deleteByGroupId(@Param("groupId") String groupId);

    @Query(value= "SELECT gm " +
            "FROM GroupMember gm " +
            "JOIN FETCH gm.user " +
            "WHERE gm.group.createdBy.email = :adminEmail " +
            "AND (gm.user.name ILIKE %:query% " +
            "OR gm.user.email ILIKE %:query%) " +
            "AND gm.group.id = :groupId",
            countQuery = "SELECT COUNT(gm) " +
                    "FROM GroupMember gm " +
                    "WHERE gm.group.createdBy.email = :adminEmail " +
                    "AND (gm.user.name ILIKE %:query% " +
                    "OR gm.user.email ILIKE %:query%) " +
                    "AND gm.group.id = :groupId"
    )
    Page<GroupMember> searchByQueryAndGroupId(String query, String groupId, String adminEmail, Pageable pageable);
}
