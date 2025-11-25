package com.server.server.controller;

import com.server.server.dto.TagDto;
import com.server.server.service.TagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@Tag(name = "Tags", description = "Tag management endpoints")
public class TagController {

    private final TagService tagService;

    @GetMapping
    @Operation(summary = "Search tags", description = "Search tags by name (autocomplete). Returns all tags if query is empty.")
    public ResponseEntity<List<TagDto>> searchTags(
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(tagService.searchTags(query));
    }

    @GetMapping("/top")
    @Operation(summary = "Get top tags", description = "Get top tags sorted by post count")
    public ResponseEntity<List<TagDto>> getTopTags(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(tagService.getTopTags(limit));
    }

    @PostMapping
    @Operation(summary = "Create tag", description = "Create a new tag (Admin only)")
    public ResponseEntity<TagDto> createTag(
            @jakarta.validation.Valid @RequestBody com.server.server.dto.CreateTagRequest request) {
        return ResponseEntity.ok(tagService.createTag(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update tag", description = "Update an existing tag (Admin only)")
    public ResponseEntity<TagDto> updateTag(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody com.server.server.dto.UpdateTagRequest request) {
        return ResponseEntity.ok(tagService.updateTag(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete tag", description = "Delete a tag (Admin only)")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }
}
