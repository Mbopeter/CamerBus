<?php
declare(strict_types=1);

/**
 * CamerBus — API Route Dispatcher
 */

require_once ROOT_PATH . '/middleware/AuthMiddleware.php';
require_once ROOT_PATH . '/middleware/RoleMiddleware.php';
require_once ROOT_PATH . '/helpers/ImageUpload.php';
require_once ROOT_PATH . '/helpers/QRGenerator.php';
require_once ROOT_PATH . '/helpers/PriceCalculator.php';

// Load all controllers
$controllers = [
    'AuthController', 'CompanyController', 'BranchController',
    'RouteController', 'ScheduleController', 'SeatController',
    'BookingController', 'PaymentController', 'TicketController',
    'ParcelController', 'AdminController', 'NotificationController', 'CityController',
];
foreach ($controllers as $ctrl) {
    require_once ROOT_PATH . "/controllers/{$ctrl}.php";
}

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Strip base path
$basePath = '/camerbus-api';
if (str_starts_with($uri, $basePath)) {
    $uri = substr($uri, strlen($basePath));
}
$uri = trim($uri, '/');

// Parse path segments
$segments = explode('/', $uri);
$seg0 = $segments[0] ?? ''; // 'api'
$seg1 = $segments[1] ?? ''; // resource
$seg2 = $segments[2] ?? ''; // id or sub-resource
$seg3 = $segments[3] ?? ''; // action

if ($seg0 !== 'api') {
    Response::error('Not found', 404);
}

// Read body
$body = json_decode(file_get_contents('php://input'), true) ?? [];

// ─────────────────────────────────────────────
// ROUTE TABLE
// ─────────────────────────────────────────────
match (true) {

    // AUTH
    $seg1 === 'auth' && $seg2 === 'register'    && $method === 'POST' => AuthController::register($body),
    $seg1 === 'auth' && $seg2 === 'login'       && $method === 'POST' => AuthController::login($body),
    $seg1 === 'auth' && $seg2 === 'refresh'     && $method === 'POST' => AuthController::refresh($body),
    $seg1 === 'auth' && $seg2 === 'logout'      && $method === 'POST' => AuthController::logout($body),
    $seg1 === 'auth' && $seg2 === 'admin-login' && $method === 'POST' => AuthController::adminLogin($body),

    // CITIES
    $seg1 === 'cities' && $method === 'GET' => CityController::index(),

    // COMPANIES
    $seg1 === 'companies' && $seg2 === ''     && $method === 'GET'  => CompanyController::index(),
    $seg1 === 'companies' && $seg2 === ''     && $method === 'POST' => CompanyController::store($body),
    $seg1 === 'companies' && $seg3 === ''     && $method === 'GET'  => CompanyController::show((int)$seg2),
    $seg1 === 'companies' && $seg3 === 'routes'  && $method === 'GET' => RouteController::byCompany((int)$seg2),
    $seg1 === 'companies' && $seg3 === 'branches' && $method === 'GET' => BranchController::byCompany((int)$seg2),

    // BRANCHES
    $seg1 === 'branches' && $seg2 === '' && $method === 'GET' => BranchController::index(),
    $seg1 === 'branches' && $seg2 !== '' && $seg3 === '' && $method === 'GET' => BranchController::show((int)$seg2),

    // ROUTES
    $seg1 === 'routes' && $seg2 === 'search' && $method === 'GET' => RouteController::search(),

    // SCHEDULES
    $seg1 === 'schedules' && $seg2 !== '' && $seg3 === '' && $method === 'GET'      => ScheduleController::show((int)$seg2),
    $seg1 === 'schedules' && $seg3 === 'seats' && $method === 'GET'                 => SeatController::bySchedule((int)$seg2),
    $seg1 === 'schedules' && $seg2 === '' && $method === 'POST'                     => ScheduleController::store($body),
    $seg1 === 'schedules' && $seg3 === 'depart' && $method === 'PUT'                => ScheduleController::markDeparted((int)$seg2),

    // BOOKINGS
    $seg1 === 'bookings' && $seg2 === ''     && $method === 'POST' => BookingController::store($body),
    $seg1 === 'bookings' && $seg3 === ''     && $method === 'GET'  => BookingController::show($seg2),
    $seg1 === 'bookings' && $seg3 === ''     && $method === 'DELETE' => BookingController::cancel($seg2),
    $seg1 === 'bookings' && $seg2 === 'user' && $method === 'GET' => BookingController::byUser((int)$seg3),
    $seg1 === 'bookings' && $seg3 === 'passenger-info' && $method === 'PUT' => BookingController::updatePassengerInfo($seg2, $body),

    // PAYMENTS
    $seg1 === 'payments' && $seg2 === '' && $method === 'POST'                       => PaymentController::store($body),
    $seg1 === 'payments' && $seg3 === '' && $method === 'GET'                        => PaymentController::show((int)$seg2),
    $seg1 === 'payments' && $seg3 === 'upload-proof' && $method === 'POST'           => PaymentController::uploadProof((int)$seg2),
    $seg1 === 'payments' && $seg3 === 'approve' && $method === 'PUT'                 => PaymentController::approve((int)$seg2, $body),
    $seg1 === 'payments' && $seg3 === 'reject'  && $method === 'PUT'                 => PaymentController::reject((int)$seg2, $body),

    // TICKETS
    $seg1 === 'tickets' && $seg2 !== '' && $seg3 === '' && $method === 'GET'         => TicketController::show($seg2),
    $seg1 === 'tickets' && $seg3 === 'validate' && $method === 'POST'                => TicketController::validate($seg2, $body),

    // PARCELS
    $seg1 === 'parcels' && $seg2 === '' && $method === 'POST'                        => ParcelController::store($body),
    $seg1 === 'parcels' && $seg2 !== '' && $seg3 === '' && $method === 'GET'         => ParcelController::show($seg2),
    $seg1 === 'parcels' && $seg2 === 'user' && $method === 'GET'                     => ParcelController::byUser((int)$seg3),
    $seg1 === 'parcels' && $seg3 === 'status' && $method === 'PUT'                   => ParcelController::updateStatus((int)$seg2, $body),

    // NOTIFICATIONS
    $seg1 === 'notifications' && $method === 'GET'                                   => NotificationController::index(),
    $seg1 === 'notifications' && $seg3 === 'read' && $method === 'PUT'               => NotificationController::markRead((int)$seg2),
    $seg1 === 'notifications' && $seg2 === 'read-all' && $method === 'PUT'           => NotificationController::markAllRead(),

    // ADMIN
    $seg1 === 'admin' && $seg2 === 'dashboard'        && $method === 'GET'           => AdminController::dashboard(),
    $seg1 === 'admin' && $seg2 === 'payments'         && $method === 'GET'           => AdminController::pendingPayments(),
    $seg1 === 'admin' && $seg2 === 'bookings'         && $method === 'GET'           => AdminController::allBookings(),
    $seg1 === 'admin' && $seg2 === 'companies'        && $method === 'POST'          => AdminController::createCompany($body),
    $seg1 === 'admin' && $seg2 === 'companies' && $seg3 !== '' && $method === 'DELETE' => AdminController::deleteCompany((int)$seg3),
    $seg1 === 'admin' && $seg2 === 'routes'           && $method === 'POST'          => AdminController::createRoute($body),
    $seg1 === 'admin' && $seg2 === 'routes' && $seg3 !== '' && $method === 'DELETE'  => AdminController::deleteRoute((int)$seg3),
    $seg1 === 'admin' && $seg2 === 'buses'            && $method === 'GET'           => AdminController::listBuses(),
    $seg1 === 'admin' && $seg2 === 'buses'            && $method === 'POST'          => AdminController::createBus($body),
    $seg1 === 'admin' && $seg2 === 'buses' && $seg3 !== '' && $segments[4] === 'faulty'      && $method === 'PUT' => AdminController::markBusFaulty((int)$seg3),
    $seg1 === 'admin' && $seg2 === 'buses' && $seg3 !== '' && $segments[4] === 'operational' && $method === 'PUT' => AdminController::markBusOperational((int)$seg3),
    $seg1 === 'admin' && $seg2 === 'admins'           && $method === 'POST'          => AdminController::createAdmin($body),
    $seg1 === 'admin' && $seg2 === 'admins'           && $method === 'GET'           => AdminController::listAdmins(),
    $seg1 === 'admin' && $seg2 === 'parcels'          && $method === 'GET'           => AdminController::allParcels(),

    // HEALTH CHECK
    $seg1 === 'health' => Response::success(['status' => 'ok', 'app' => 'CamerBus API', 'version' => '1.0.0']),

    default => Response::error('Endpoint not found', 404),
};