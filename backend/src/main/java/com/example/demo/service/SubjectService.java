package com.example.demo.service;

import com.example.demo.dto.response.SubjectResponse;
import com.example.demo.entity.Subject;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public List<SubjectResponse> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SubjectResponse getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        return mapToResponse(subject);
    }

    public SubjectResponse createSubject(String name, String description) {
        if (subjectRepository.existsByName(name)) {
            throw new BadRequestException("Subject already exists");
        }
        Subject subject = Subject.builder().name(name).description(description).build();
        return mapToResponse(subjectRepository.save(subject));
    }

    public SubjectResponse mapToResponse(Subject subject) {
        return SubjectResponse.builder()
                .id(subject.getId())
                .name(subject.getName())
                .description(subject.getDescription())
                .build();
    }
}
