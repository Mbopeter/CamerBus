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
        // Auto-generate and persist seat layout
        $seats = [];
        $rows  = (int) ceil($totalSeats / 4);

        for ($row = 1; $row <= $rows; $row++) {
            $positions = ['A', 'B', 'C', 'D'];
            foreach ($positions as $pos) {
                $seatNum = $row . $pos;
                $seatType = ($row <= 3 && in_array($pos, ['A', 'D'])) ? 'vip' : 'standard';
                $position = match($pos) {
                    'A' => 'window_left',
                    'B' => 'aisle_left',
                    'C' => 'aisle_right',
                    'D' => 'window_right',
                    default => 'standard',
                };

                // Insert if not exists
                $existing = Database::query(
                    'SELECT id FROM seats WHERE bus_id = ? AND seat_number = ?', [$busId, $seatNum]
                )->fetch();

                if (!$existing) {
                    Database::query(
                        'INSERT INTO seats (bus_id, seat_number, row_number, seat_position, seat_type) VALUES (?,?,?,?,?)',
                        [$busId, $seatNum, $row, $position, $seatType]
                    );
                    $id = (int) Database::lastInsertId();
                } else {
                    $id = $existing['id'];
                }

                $seats[] = [
                    'id'            => $id,
                    'bus_id'        => $busId,
                    'seat_number'   => $seatNum,
                    'row_number'    => $row,
                    'seat_position' => $position,
                    'seat_type'     => $seatType,
                    'is_booked'     => 0,
                    'is_held'       => 0,
                ];

                if (count($seats) >= $totalSeats) break 2;
            }
        }
        return $seats;
    }
}
