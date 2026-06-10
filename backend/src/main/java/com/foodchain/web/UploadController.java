package com.foodchain.web;

import com.foodchain.service.FileStorageService;
import java.io.IOException;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final FileStorageService storage;

    public UploadController(FileStorageService storage) {
        this.storage = storage;
    }

    @PostMapping(value = "/donation-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadDonationPhoto(@RequestParam("file") MultipartFile file) throws IOException {
        String url = storage.store(file);
        return Map.of("url", url);
    }
}
