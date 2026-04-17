package com.company.ExamBackend.controller;

import com.company.ExamBackend.dto.SnapshotRequestDTO;
import com.company.ExamBackend.dto.SnapshotResponseDTO;
import com.company.ExamBackend.service.SnapshotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/snapshots")
@RequiredArgsConstructor
@Tag(
        name = "Snapshots Management",
        description = "Endpoints for sending and getting snapshots."
)
public class SnapshotController {

    private final SnapshotService snapshotService;

    @Operation(
            summary = "Send snapshot from exam session (Candidate side)",
            description = "Used to send snapshots from candidate's device to exam server."
    )
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<SnapshotResponseDTO> takeSnapshot(@ModelAttribute SnapshotRequestDTO requestDTO) {
        SnapshotResponseDTO response = snapshotService.createSnapshot(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Get screenshots for an exam of a candidate(Admin side)",
            description = "Used by admin to get screenshots for an exam of a candidate." +
                    "Contains both webcam snapshots and screenshots, along with relevant details."
    )
    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<List<SnapshotResponseDTO>> getSnapshots(@PathVariable String submissionId) {
        List<SnapshotResponseDTO> snapshots = snapshotService.getSnapshotsBySubmission(submissionId);
        return ResponseEntity.ok(snapshots);
    }

    @Operation(
            summary = "Deletes specific snapshots of a submission",
            description = "Used by admin to delete snapshots of a submission. Probably placeholder for now. " +
                    "May be removed later for policy control and consistency with api/exams/delete/{examId} " +
                    "which already does cascade deletion of all things belonging to an exam."
    )
    @Deprecated(forRemoval = true)
    @DeleteMapping("/submission/{submissionId}")
    public ResponseEntity<Void> deleteSnapshots(@PathVariable String submissionId) {
        snapshotService.deleteSnapshotsForSubmission(submissionId);
        return ResponseEntity.noContent().build();
    }
}