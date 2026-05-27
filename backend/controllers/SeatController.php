<?php
declare(strict_types=1);

class SeatController
{
    public static function bySchedule(int $scheduleId): void
    {
        // Get schedule + bus info
        $schedule = Database::query(
            'SELECT s.id, s.bus_id, b.total_seats, b.bus_type
             FROM schedules s JOIN buses b ON s.bus_id = b.id
             WHERE s.id = ?', [$scheduleId]
        )->fetch();

        if (!$schedule) Response::error('Schedule not found', 404);

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

        // If no seats configured yet, generate default layout
        if (empty($seats)) {
            $seats = self::generateDefaultLayout($schedule['bus_id'], $schedule['total_seats']);
        }

        Response::success([
            'schedule_id' => $scheduleId,
            'bus_id'      => $schedule['bus_id'],
            'bus_type'    => $schedule['bus_type'],
            'total_seats' => $schedule['total_seats'],
            'seats'       => $seats,
        ]);
    }

    private static function generateDefaultLayout(int $busId, int $totalSeats): array
    {
        // Auto-generate and persist seat layout numbered 1 to 70
        $layout = [
            0  => 2,  // Driver row: 2 passenger seats on right
            1  => 5,
            2  => 5,
            3  => 5,
            4  => 3,  // Door row: 3 left seats, DOOR on right
            5  => 5,
            6  => 5,
            7  => 5,
            8  => 5,
            9  => 5,
            10 => 5,
            11 => 5,
            12 => 3,  // Door row: 3 left seats, DOOR on right
            13 => 5,
            14 => 7,  // Back row: 7 seats
        ];

        $seats   = [];
        $seatNum = 1;

        foreach ($layout as $row => $count) {
            for ($i = 1; $i <= $count; $i++) {
                if ($seatNum > $totalSeats) break 2;

                $seatType = ($row <= 3 && $row > 0) ? 'vip' : 'standard';

                $existing = Database::query(
                    'SELECT id FROM seats WHERE bus_id = ? AND seat_number = ?', [$busId, (string)$seatNum]
                )->fetch();

                if (!$existing) {
                    Database::query(
                        'INSERT INTO seats (bus_id, seat_number, row_number, seat_position, seat_type) VALUES (?,?,?,?,?)',
                        [$busId, (string)$seatNum, $row, 'standard', $seatType]
                    );
                    $id = (int) Database::lastInsertId();
                } else {
                    $id = $existing['id'];
                }

                $seats[] = [
                    'id'            => $id,
                    'bus_id'        => $busId,
                    'seat_number'   => (string)$seatNum,
                    'row_number'    => $row,
                    'seat_position' => 'standard',
                    'seat_type'     => $seatType,
                    'is_booked'     => 0,
                    'is_held'       => 0,
                ];

                $seatNum++;
            }
        }
        return $seats;
    }
}
