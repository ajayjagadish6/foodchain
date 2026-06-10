package com.foodchain.service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );
    private static final long MAX_BYTES = 8 * 1024 * 1024; // 8 MB

    @Value("${foodchain.uploads.dir:uploads}")
    private String uploadsDir;

    @Value("${foodchain.uploads.urlPrefix:/uploads}")
    private String urlPrefix;

    private Path uploadPath;

    @PostConstruct
    public void init() throws IOException {
        uploadPath = Paths.get(uploadsDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);
    }

    /**
     * Stores the uploaded file and returns its public URL path (e.g. /uploads/abc123.jpg).
     */
    public String store(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Only image files are allowed (jpeg, png, gif, webp).");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("File is too large. Maximum size is 8 MB.");
        }

        String extension = extensionFor(contentType);
        String filename = UUID.randomUUID() + extension;
        Path target = uploadPath.resolve(filename);

        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }

        return urlPrefix + "/" + filename;
    }

    private String extensionFor(String contentType) {
        return switch (contentType.toLowerCase()) {
            case "image/png"  -> ".png";
            case "image/gif"  -> ".gif";
            case "image/webp" -> ".webp";
            default           -> ".jpg";
        };
    }
}
