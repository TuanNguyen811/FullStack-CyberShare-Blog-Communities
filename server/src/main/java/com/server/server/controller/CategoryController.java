package com.server.server.controller;

import com.server.server.dto.category.CategoryDto;
import com.server.server.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Category", description = "Category management endpoints")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @Operation(summary = "Get all categories", description = "Get list of all available categories")
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/top")
    @Operation(summary = "Get top categories", description = "Get top categories sorted by post count")
    public ResponseEntity<List<CategoryDto>> getTopCategories(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(categoryService.getTopCategories(limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID", description = "Get category details by ID")
    public ResponseEntity<CategoryDto> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get category by slug", description = "Get category details by slug")
    public ResponseEntity<CategoryDto> getCategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(categoryService.getCategoryBySlug(slug));
    }

    @PostMapping
    @Operation(summary = "Create category", description = "Create a new category (Admin only)")
    public ResponseEntity<CategoryDto> createCategory(
            @jakarta.validation.Valid @RequestBody com.server.server.dto.category.CreateCategoryRequest request) {
        return ResponseEntity.ok(categoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update category", description = "Update an existing category (Admin only)")
    public ResponseEntity<CategoryDto> updateCategory(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody com.server.server.dto.category.UpdateCategoryRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category", description = "Delete a category (Admin only)")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
