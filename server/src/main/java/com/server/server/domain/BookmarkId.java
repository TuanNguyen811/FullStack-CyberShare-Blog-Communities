package com.server.server.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookmarkId implements Serializable {
    private Long user;
    private Long post;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BookmarkId that = (BookmarkId) o;
        return Objects.equals(user, that.user) && Objects.equals(post, that.post);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user, post);
    }
}
