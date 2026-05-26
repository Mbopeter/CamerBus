<?php
declare(strict_types=1);

class PriceCalculator
{
    // Known base prices in XAF (Standard class)
    private static array $knownRoutes = [
        '3-2' => 6000, '2-3' => 6000,
        '3-1' => 6500, '1-3' => 6500,
        '3-5' => 6500, '5-3' => 6500,
        '3-6' => 6500, '6-3' => 6500,
        '1-2' => 4000, '2-1' => 4000,
        '1-5' => 6000, '5-1' => 6000,
        '1-6' => 6000, '6-1' => 6000,
        '2-5' => 2000, '5-2' => 2000,
        '2-6' => 2000, '6-2' => 2000,
        '4-1' => 4500, '1-4' => 4500,
        '4-2' => 5000, '2-4' => 5000,
        '4-3' => 3000, '3-4' => 3000,
        '1-7' => 9000, '7-1' => 9000,
        '2-7' => 8000, '7-2' => 8000,
        '1-8' => 11000,'8-1' => 11000,
        '2-10'=> 2500, '10-2'=> 2500,
        '10-5'=> 1500, '5-10'=> 1500,
    ];

    // Approximate distances in km between major cities
    private static array $distances = [
        '3-2' => 360, '2-3' => 360,
        '3-1' => 400, '1-3' => 400,
        '1-2' => 240, '2-1' => 240,
        '3-5' => 420, '5-3' => 420,
        '3-6' => 430, '6-3' => 430,
        '1-5' => 340, '5-1' => 340,
        '1-6' => 350, '6-1' => 350,
        '2-5' => 80,  '5-2' => 80,
        '2-6' => 70,  '6-2' => 70,
        '4-1' => 270, '1-4' => 270,
        '4-2' => 300, '2-4' => 300,
        '4-3' => 120, '3-4' => 120,
        '1-7' => 550, '7-1' => 550,
        '2-7' => 700, '7-2' => 700,
        '2-10'=> 120, '10-2'=> 120,
        '10-5'=> 60,  '5-10'=> 60,
    ];

    public static function calculate(int $originCityId, int $destCityId, string $busType = 'Standard'): array
    {
        $key = "$originCityId-$destCityId";
        $basePrice = self::$knownRoutes[$key] ?? self::estimate($originCityId, $destCityId);

        $vipMultiplier     = 1.30;
        $luxuryMultiplier  = 1.60;
        $coasterMultiplier = 0.85;

        $prices = [
            'Standard' => $basePrice,
            'VIP'      => self::roundTo500((int)($basePrice * $vipMultiplier)),
            'Luxury'   => self::roundTo500((int)($basePrice * $luxuryMultiplier)),
            'Coaster'  => self::roundTo500((int)($basePrice * $coasterMultiplier)),
            'Minibus'  => self::roundTo500((int)($basePrice * $coasterMultiplier)),
        ];

        return [
            'standard' => $prices['Standard'],
            'vip'      => $prices['VIP'],
            'luxury'   => $prices['Luxury'],
            'price'    => $prices[$busType] ?? $prices['Standard'],
        ];
    }

    private static function estimate(int $from, int $to): int
    {
        $key = "$from-$to";
        $dist = self::$distances[$key] ?? 200;
        // XAF 15/km + road condition factor (assume 1.1 for unlisted)
        $raw = (int)($dist * 15 * 1.1);
        return self::roundTo500($raw);
    }

    private static function roundTo500(int $value): int
    {
        return (int)(round($value / 500) * 500);
    }
}
