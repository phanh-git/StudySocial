package com.example.demo.repository;

import com.example.demo.entity.Post;
import com.example.demo.entity.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findBySubjectId(Long subjectId, Pageable pageable);
    Page<Post> findByGroupId(Long groupId, Pageable pageable);
    Page<Post> findByAuthorId(Long authorId, Pageable pageable);
    Page<Post> findByType(PostType type, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Post> searchByContent(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) AND p.subject.id = :subjectId")
    Page<Post> searchByContentAndSubject(@Param("keyword") String keyword, @Param("subjectId") Long subjectId, Pageable pageable);
}
