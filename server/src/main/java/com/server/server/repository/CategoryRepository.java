package com.server.server.repository;

import com.server.server.domain.Category;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByName(String name);

    @Query("SELECT c, COUNT(p) FROM Category c LEFT JOIN Post p ON p.category = c AND p.status = 'PUBLISHED' GROUP BY c ORDER BY COUNT(p) DESC")
    List<Object[]> findTopCategoriesByPostCount(Pageable pageable);
}
