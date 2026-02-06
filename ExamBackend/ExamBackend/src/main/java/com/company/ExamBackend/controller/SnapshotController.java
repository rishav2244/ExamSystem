package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.SnapshotRequestDTO;
import com.company.ExamBackend.dto.SnapshotResponseDTO;
import com.company.ExamBackend.service.SnapshotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/snapshots")
@RequiredArgsConstructor
public class SnapshotController {

    private final SnapshotService snapshotService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<SnapshotResponseDTO> takeSnapshot(@ModelAttribute SnapshotRequestDTO requestDTO) {
        SnapshotResponseDTO response = snapshotService.createSnapshot(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<List<SnapshotResponseDTO>> getSnapshots(@PathVariable String submissionId) {
        List<SnapshotResponseDTO> snapshots = snapshotService.getSnapshotsBySubmission(submissionId);
        return ResponseEntity.ok(snapshots);
    }

    @DeleteMapping("/submission/{submissionId}")
    public ResponseEntity<Void> deleteSnapshots(@PathVariable String submissionId) {
        snapshotService.deleteSnapshotsForSubmission(submissionId);
        return ResponseEntity.noContent().build();
    }
}