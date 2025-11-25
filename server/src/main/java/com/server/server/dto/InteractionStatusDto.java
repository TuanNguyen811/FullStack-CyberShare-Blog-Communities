package com.server.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InteractionStatusDto {
    private boolean liked;
    private boolean bookmarked;
    private int likesCount;
    private int bookmarksCount;
    private int commentsCount;
}
