package com.example.demo.repository;

import com.example.demo.entity.StudyGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {
    Page<StudyGroup> findBySubjectId(Long subjectId, Pageable pageable);

    @Query("SELECT g FROM StudyGroup g WHERE LOWER(g.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<StudyGroup> searchByName(@Param("keyword") String keyword, Pageable pageable);
}
