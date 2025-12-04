package com.server.server.service;

import com.server.server.domain.Category;
import com.server.server.dto.category.CategoryDto;
import com.server.server.repository.CategoryRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<CategoryDto> getTopCategories(int limit) {
        return categoryRepository.findTopCategoriesByPostCount(PageRequest.of(0, limit)).stream()
                .map(result -> {
                    Category category = (Category) result[0];
                    Long postCount = (Long) result[1];
                    return mapToDtoWithCount(category, postCount);
                })
                .collect(Collectors.toList());
    }

    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        return mapToDto(category);
    }

    public CategoryDto getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Category not found with slug: " + slug));
        return mapToDto(category);
    }

    @Transactional
    public CategoryDto createCategory(com.server.server.dto.category.CreateCategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Category with this name already exists");
        }

        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setSlug(generateSlug(request.getName()));
        category.setCoverImageUrl(request.getCoverImageUrl());

        category = categoryRepository.save(category);
        return mapToDto(category);
    }

    @Transactional
    public CategoryDto updateCategory(Long id, com.server.server.dto.category.UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        if (request.getName() != null && !request.getName().equals(category.getName())) {
            if (categoryRepository.existsByName(request.getName())) {
                throw new RuntimeException("Category with this name already exists");
            }
            category.setName(request.getName());
            category.setSlug(generateSlug(request.getName()));
        }

        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        
        if (request.getCoverImageUrl() != null) {
            category.setCoverImageUrl(request.getCoverImageUrl());
        }

        category = categoryRepository.save(category);
        return mapToDto(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }

    private CategoryDto mapToDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setSlug(category.getSlug());
        dto.setDescription(category.getDescription());
        dto.setCoverImageUrl(category.getCoverImageUrl());
        return dto;
    }

    private CategoryDto mapToDtoWithCount(Category category, Long postCount) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setSlug(category.getSlug());
        dto.setDescription(category.getDescription());
        dto.setCoverImageUrl(category.getCoverImageUrl());
        dto.setPostCount(postCount);
        return dto;
    }

    private String generateSlug(String input) {
        String nowhitespace = java.util.regex.Pattern.compile("[\\s]").matcher(input).replaceAll("-");
        String normalized = java.text.Normalizer.normalize(nowhitespace, java.text.Normalizer.Form.NFD);
        String slug = java.util.regex.Pattern.compile("[^\\w-]").matcher(normalized).replaceAll("");
        return slug.toLowerCase(java.util.Locale.ENGLISH);
    }
}
