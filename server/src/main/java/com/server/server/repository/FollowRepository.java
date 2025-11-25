package com.server.server.repository;

import com.server.server.domain.Follow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

    Page<Follow> findByFollowerId(Long followerId, Pageable pageable);

    Page<Follow> findByFollowingId(Long followingId, Pageable pageable);

    long countByFollowerId(Long followerId);

    long countByFollowingId(Long followingId);
}
