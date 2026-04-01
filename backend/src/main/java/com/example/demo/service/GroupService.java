package com.example.demo.service;

import com.example.demo.dto.request.GroupRequest;
import com.example.demo.dto.response.GroupResponse;
import com.example.demo.dto.response.SubjectResponse;
import com.example.demo.entity.Subject;
import com.example.demo.entity.StudyGroup;
import com.example.demo.entity.User;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.StudyGroupRepository;
import com.example.demo.repository.SubjectRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final StudyGroupRepository groupRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final AuthService authService;

    public Page<GroupResponse> getAllGroups(Long subjectId, String keyword, String currentUsername, Pageable pageable) {
        Page<StudyGroup> groups;
        if (keyword != null && !keyword.isBlank()) {
            groups = groupRepository.searchByName(keyword, pageable);
        } else if (subjectId != null) {
            groups = groupRepository.findBySubjectId(subjectId, pageable);
        } else {
            groups = groupRepository.findAll(pageable);
        }
        User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null) : null;
        return groups.map(g -> mapToResponse(g, currentUser));
    }

    public GroupResponse getGroupById(Long id, String currentUsername) {
        StudyGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null) : null;
        return mapToResponse(group, currentUser);
    }

    @Transactional
    public GroupResponse createGroup(GroupRequest request, String username) {
        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Subject subject = null;
        if (request.getSubjectId() != null) {
            subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        }
        StudyGroup group = StudyGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .subject(subject)
                .creator(creator)
                .build();
        group.getMembers().add(creator);
        creator.getGroups().add(group);
        StudyGroup saved = groupRepository.save(group);
        return mapToResponse(saved, creator);
    }

    @Transactional
    public GroupResponse joinGroup(Long groupId, String username) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getGroups().contains(group)) {
            throw new BadRequestException("Already a member of this group");
        }
        user.getGroups().add(group);
        group.getMembers().add(user);
        userRepository.save(user);
        return mapToResponse(group, user);
    }

    @Transactional
    public void leaveGroup(Long groupId, String username) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.getGroups().remove(group);
        group.getMembers().remove(user);
        userRepository.save(user);
    }

    public GroupResponse mapToResponse(StudyGroup group, User currentUser) {
        boolean isMember = currentUser != null && currentUser.getGroups().stream()
                .anyMatch(g -> g.getId().equals(group.getId()));
        SubjectResponse subjectResponse = null;
        if (group.getSubject() != null) {
            subjectResponse = SubjectResponse.builder()
                    .id(group.getSubject().getId())
                    .name(group.getSubject().getName())
                    .description(group.getSubject().getDescription())
                    .build();
        }
        return GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .subject(subjectResponse)
                .creator(authService.mapToUserResponse(group.getCreator()))
                .memberCount(group.getMembers().size())
                .createdAt(group.getCreatedAt())
                .isMember(isMember)
                .build();
    }
}
