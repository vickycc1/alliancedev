package com.techcommunity.util;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

public class FileUtils {

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    private static final List<String> ALLOWED_DOC_TYPES = Arrays.asList(
            "application/pdf", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    private static final long MAX_DOC_SIZE = 20 * 1024 * 1024;

    public static String generateFileName(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        return UUID.randomUUID().toString().replace("-", "") + extension;
    }

    public static String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDot = filename.lastIndexOf(".");
        if (lastDot == -1) {
            return "";
        }
        return filename.substring(lastDot);
    }

    public static boolean isImage(MultipartFile file) {
        return file != null && ALLOWED_IMAGE_TYPES.contains(file.getContentType());
    }

    public static boolean isDocument(MultipartFile file) {
        return file != null && ALLOWED_DOC_TYPES.contains(file.getContentType());
    }

    public static boolean isValidImageSize(MultipartFile file) {
        return file != null && file.getSize() <= MAX_IMAGE_SIZE;
    }

    public static boolean isValidDocSize(MultipartFile file) {
        return file != null && file.getSize() <= MAX_DOC_SIZE;
    }

    public static String saveFile(MultipartFile file, String uploadPath) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        Path uploadDir = Paths.get(uploadPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        String newFilename = generateFileName(file.getOriginalFilename());
        Path filePath = uploadDir.resolve(newFilename);

        Files.copy(file.getInputStream(), filePath);

        return newFilename;
    }

    public static void deleteFile(String filePath) throws IOException {
        if (filePath != null && !filePath.isEmpty()) {
            Path path = Paths.get(filePath);
            if (Files.exists(path)) {
                Files.delete(path);
            }
        }
    }

    public static String getContentType(String filename) {
        String extension = getFileExtension(filename).toLowerCase();
        return switch (extension) {
            case ".jpg", ".jpeg" -> "image/jpeg";
            case ".png" -> "image/png";
            case ".gif" -> "image/gif";
            case ".webp" -> "image/webp";
            case ".pdf" -> "application/pdf";
            case ".doc" -> "application/msword";
            case ".docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            default -> "application/octet-stream";
        };
    }
}
