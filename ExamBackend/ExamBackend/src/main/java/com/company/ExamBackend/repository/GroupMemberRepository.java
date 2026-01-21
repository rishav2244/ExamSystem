package com.company.ExamBackend.repository;

import com.company.ExamBackend.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember,String> {
    List<GroupMember> findByGroupId(String groupId);
}
