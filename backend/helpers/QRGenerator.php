<?php
declare(strict_types=1);

class QRGenerator
{
    /**
     * Generate a QR code as a base64 PNG data URI using Google Charts API.
     * For production, replace with endroid/qr-code or chillerlan/php-qrcode.
     */
    public static function generate(string $data): string
    {
        $encoded = urlencode($data);
        // Returns a URL that the mobile app can render as an image
        return "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={$encoded}&format=png&margin=10";
    }

    /**
     * Generate QR payload JWT for a ticket
     */
    public static function generateTicketPayload(array $ticketData): string
    {
        return JWT::encodeTicket($ticketData);
    }

    /**
     * Generate a unique ticket code
     */
    public static function generateTicketCode(): string
    {
        $year   = date('Y');
        $random = strtoupper(bin2hex(random_bytes(4)));
        return "CB-{$year}-{$random}";
    }

    /**
     * Generate a unique booking reference
     */
    public static function generateBookingRef(): string
    {
        $date   = date('Ymd');
        $random = strtoupper(bin2hex(random_bytes(3)));
        return "BK-{$date}-{$random}";
    }

    /**
     * Generate a unique parcel tracking number
     */
    public static function generateTrackingNumber(): string
    {
        $prefix = 'PKG';
        $date   = date('ymd');
        $random = strtoupper(bin2hex(random_bytes(3)));
        return "{$prefix}{$date}{$random}";
    }
}
