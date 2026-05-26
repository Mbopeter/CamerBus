<?php
declare(strict_types=1);

class ImageUpload
{
    private static array $allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    private static int   $maxSize      = 5242880; // 5MB

    public static function upload(array $file, string $folder = 'receipts'): string
    {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new RuntimeException('File upload error: ' . $file['error']);
        }
        if ($file['size'] > self::$maxSize) {
            throw new RuntimeException('File too large. Maximum 5MB allowed.');
        }
        $mime = mime_content_type($file['tmp_name']);
        if (!in_array($mime, self::$allowedMimes, true)) {
            throw new RuntimeException('Invalid file type. Only JPEG, PNG, WebP allowed.');
        }

        $ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = bin2hex(random_bytes(16)) . '.' . strtolower($ext);
        $dir      = ROOT_PATH . '/uploads/' . $folder . '/';

        if (!is_dir($dir)) mkdir($dir, 0755, true);

        $dest = $dir . $filename;
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            throw new RuntimeException('Failed to save file.');
        }

        return 'uploads/' . $folder . '/' . $filename;
    }

    public static function delete(string $path): void
    {
        $full = ROOT_PATH . '/' . $path;
        if (file_exists($full)) unlink($full);
    }
}
