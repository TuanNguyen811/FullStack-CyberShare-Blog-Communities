package com.server.server.repository;

import com.server.server.domain.PostView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostViewRepository extends JpaRepository<PostView, Long> {
    boolean existsByPostIdAndUserId(Long postId, Long userId);

    boolean existsByPostIdAndIpAddress(Long postId, String ipAddress);
}
