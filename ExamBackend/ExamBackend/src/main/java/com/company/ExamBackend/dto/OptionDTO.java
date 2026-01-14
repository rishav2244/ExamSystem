package com.company.ExamBackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OptionDTO {
    private String index;
    private String text;
    private boolean correct;
}