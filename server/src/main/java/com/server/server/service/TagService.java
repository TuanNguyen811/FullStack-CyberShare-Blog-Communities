package com.server.server.service;

import com.server.server.domain.Tag;
import com.server.server.dto.TagDto;
import com.server.server.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TagService {

    private final TagRepository tagRepository;

    public List<TagDto> searchTags(String query) {
        if (query == null || query.trim().isEmpty()) {
            return tagRepository.findAll().stream()
                    .limit(20)
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }

        return tagRepository.searchByName(query).stream()
                .limit(20)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<TagDto> getAllTags() {
        return tagRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<TagDto> getTopTags(int limit) {
        return tagRepository.findTopTagsByPostCount(PageRequest.of(0, limit)).stream()
                .map(result -> {
                    Tag tag = (Tag) result[0];
                    Long postCount = (Long) result[1];
                    return mapToDtoWithCount(tag, postCount);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public TagDto createTag(com.server.server.dto.CreateTagRequest request) {
        if (tagRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tag with this name already exists");
        }

        Tag tag = new Tag();
        tag.setName(request.getName());
        tag.setDescription(request.getDescription());
        tag.setSlug(generateSlug(request.getName()));

        tag = tagRepository.save(tag);
        return mapToDto(tag);
    }

    @Transactional
    public TagDto updateTag(Long id, com.server.server.dto.UpdateTagRequest request) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found with id: " + id));

        if (request.getName() != null && !request.getName().equals(tag.getName())) {
            if (tagRepository.existsByName(request.getName())) {
                throw new RuntimeException("Tag with this name already exists");
            }
            tag.setName(request.getName());
            tag.setSlug(generateSlug(request.getName()));
        }

        if (request.getDescription() != null) {
            tag.setDescription(request.getDescription());
        }

        tag = tagRepository.save(tag);
        return mapToDto(tag);
    }

    @Transactional
    public void deleteTag(Long id) {
        if (!tagRepository.existsById(id)) {
            throw new RuntimeException("Tag not found with id: " + id);
        }
        tagRepository.deleteById(id);
    }

    private TagDto mapToDto(Tag tag) {
        TagDto dto = new TagDto();
        dto.setId(tag.getId());
        dto.setName(tag.getName());
        dto.setSlug(tag.getSlug());
        dto.setDescription(tag.getDescription());
        return dto;
    }

    private TagDto mapToDtoWithCount(Tag tag, Long postCount) {
        TagDto dto = new TagDto();
        dto.setId(tag.getId());
        dto.setName(tag.getName());
        dto.setSlug(tag.getSlug());
        dto.setDescription(tag.getDescription());
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
