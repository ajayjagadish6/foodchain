package com.foodchain.config;

import java.nio.file.Paths;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Serves uploaded food-photo files under /uploads/** from the local filesystem.
 * The directory is created at startup by FileStorageService.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${foodchain.uploads.dir:uploads}")
    private String uploadsDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = Paths.get(uploadsDir).toAbsolutePath().normalize().toUri().toString();
        // Ensure trailing slash
        if (!absolutePath.endsWith("/")) absolutePath += "/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(absolutePath);
    }
}
