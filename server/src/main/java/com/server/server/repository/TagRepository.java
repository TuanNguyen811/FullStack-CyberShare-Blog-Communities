package com.server.server.repository;

import com.server.server.domain.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    
    Optional<Tag> findBySlug(String slug);
    
    Optional<Tag> findByName(String name);
    
    boolean existsByName(String name);
    
    boolean existsBySlug(String slug);
    
    @Query("SELECT t FROM Tag t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY t.name")
    List<Tag> searchByName(@Param("query") String query);

    @Query("SELECT t, COUNT(p) FROM Tag t LEFT JOIN t.posts p ON p.status = 'PUBLISHED' GROUP BY t ORDER BY COUNT(p) DESC")
    List<Object[]> findTopTagsByPostCount(org.springframework.data.domain.Pageable pageable);
}
