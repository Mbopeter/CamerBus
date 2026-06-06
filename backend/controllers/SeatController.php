<?php
declare(strict_types=1);

class SeatController
{
    public static function bySchedule(int $scheduleId): void
    {
        // Get schedule + bus info (including company_class for pricing context)
        $schedule = Database::query(
            'SELECT s.id, s.bus_id, b.total_seats, b.bus_type,
                    r.price_standard, r.price_vip, r.price_luxury,
                    c.company_class
             FROM schedules s
             JOIN buses b     ON s.bus_id   = b.id
             JOIN routes r    ON s.route_id = r.id
             JOIN companies c ON r.company_id = c.id
             WHERE s.id = ?', [$scheduleId]
        )->fetch();

        if (!$schedule) Response::error('Schedule not found', 404);

        // Resolve the single flat price for this bus based on its type.
        // A bus has ONE price — no seat-level price mixing.
        $flatPrice = PriceCalculator::resolvePrice(
            $schedule['bus_type'],
            (float) $schedule['price_standard'],
            (float) $schedule['price_vip'],
            (float) ($schedule['price_luxury'] ?? $schedule['price_vip'])
        );

        // Get all seats for this bus
        $seats = Database::query(
            'SELECT se.*,
                CASE WHEN bs.id IS NOT NULL THEN 1 ELSE 0 END AS is_booked,
                CASE WHEN bs.is_held = 1 AND bs.held_until > NOW() THEN 1 ELSE 0 END AS is_held
             FROM seats se
             LEFT JOIN booking_seats bs ON bs.seat_id = se.id
                AND bs.schedule_id = ?
                AND bs.booking_id IN (
                    SELECT id FROM bookings WHERE status NOT IN (\'cancelled\')
                )
             WHERE se.bus_id = ?
             ORDER BY se.row_number ASC, se.seat_number ASC',
            [$scheduleId, $schedule['bus_id']]
        )->fetchAll();

        // If no seats configured yet, generate uniform layout based on bus_type
        if (empty($seats)) {
            $seats = self::generateDefaultLayout(
                $schedule['bus_id'],
                $schedule['total_seats'],
                $schedule['bus_type']
            );
        } else {
            // Ensure any previously-generated seats have the correct type
            // (fixes legacy rows with mixed vip/standard on one bus)
            $correctType = self::seatTypeForBus($schedule['bus_type']);
            foreach ($seats as &$seat) {
                if ($seat['seat_type'] !== 'driver') {
                    $seat['seat_type'] = $correctType;
                }
            }
            unset($seat);
        }

        Response::success([
            'schedule_id'   => $scheduleId,
            'bus_id'        => $schedule['bus_id'],
            'bus_type'      => $schedule['bus_type'],
            'company_class' => $schedule['company_class'],
            'total_seats'   => $schedule['total_seats'],
            // Single flat price — the same for every seat on this bus
            'flat_price'    => $flatPrice,
            'seats'         => $seats,
        ]);
    }

    /**
     * Returns the correct seat_type string for a given bus_type.
     * VIP/Luxury buses → 'vip'
     * Standard/Coaster/Minibus → 'standard'
     */
    private static function seatTypeForBus(string $busType): string
    {
        return in_array($busType, ['VIP', 'Luxury'], true) ? 'vip' : 'standard';
    }

    private static function generateDefaultLayout(int $busId, int $totalSeats, string $busType): array
    {
        // ALL seats on this bus share the same type — driven by bus_type only.
        // No row-based mixing. A Standard bus never has VIP seats.
        $uniformSeatType = self::seatTypeForBus($busType);

        $layout = [];

        if (in_array($busType, ['VIP', 'Luxury'], true)) {
            // VIP/Luxury: 5 seats per row (3 left, aisle, 2 right) — same physical
            // arrangement as Standard but with premium styling on the frontend.
            $layout[0] = 2; // driver row passengers
            $sum = 2;
            for ($r = 1; $r <= 30; $r++) {
                if ($sum + 7 >= $totalSeats) {
                    $layout[$r] = $totalSeats - $sum;
                    break;
                }
                if ($r === 4 || $r === 12) {
                    $layout[$r] = 3; // door row
                } else {
                    $layout[$r] = 5;
                }
                $sum += $layout[$r];
            }
        } elseif (in_array($busType, ['Coaster', 'Minibus'], true)) {
            // Coaster/Minibus: 4 seats per row (2 left, aisle, 2 right)
            $layout[0] = 2; // driver row passengers
            for ($r = 1; $r <= 30; $r++) {
                if ($r === 4 || $r === 12) $layout[$r] = 2; // door row
                else $layout[$r] = 4;
            }
        } else {
            // Standard: 5 seats per row (3 left, aisle, 2 right), up to 7 in the back row
            $layout[0] = 2; // driver row passengers
            $sum = 2;
            for ($r = 1; $r <= 30; $r++) {
                if ($sum + 7 >= $totalSeats) {
                    $layout[$r] = $totalSeats - $sum;
                    break;
                }
                if ($r === 4 || $r === 12) {
                    $layout[$r] = 3; // door row
                } else {
                    $layout[$r] = 5;
                }
                $sum += $layout[$r];
            }
        }

        $seats   = [];
        $seatNum = 1;

        foreach ($layout as $row => $count) {
            for ($i = 1; $i <= $count; $i++) {
                if ($seatNum > $totalSeats) break 2;

                $existing = Database::query(
                    'SELECT id FROM seats WHERE bus_id = ? AND seat_number = ?',
                    [$busId, (string)$seatNum]
                )->fetch();

                if (!$existing) {
                    Database::query(
                        'INSERT INTO seats (bus_id, seat_number, row_number, seat_position, seat_type)
                         VALUES (?,?,?,?,?)',
                        [$busId, (string)$seatNum, $row, 'window_left', $uniformSeatType]
                    );
                    $id = (int) Database::lastInsertId();
                } else {
                    $id = $existing['id'];
                    // Correct any legacy wrong seat_type in the DB
                    Database::query(
                        'UPDATE seats SET seat_type = ? WHERE id = ? AND seat_type != ?',
                        [$uniformSeatType, $id, $uniformSeatType]
                    );
                }

                $seats[] = [
                    'id'            => $id,
                    'bus_id'        => $busId,
                    'seat_number'   => (string)$seatNum,
                    'row_number'    => $row,
                    'seat_position' => 'window_left',
                    'seat_type'     => $uniformSeatType,
                    'is_booked'     => 0,
                    'is_held'       => 0,
                ];

                $seatNum++;
            }
        }
        return $seats;
    }
}
