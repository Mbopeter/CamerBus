<?php
declare(strict_types=1);

class CityController
{
    public static function index(): void
    {
        $cities = Database::query(
            'SELECT * FROM cities ORDER BY is_major DESC, name ASC'
        )->fetchAll();
        Response::success($cities);
    }
}


