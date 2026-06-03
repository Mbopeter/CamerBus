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

$router = new Router();

// AUTH
$router->post('/api/auth/register', 'AuthController::register');
$router->post('/api/auth/login', 'AuthController::login');
$router->post('/api/auth/refresh', 'AuthController::refresh');
$router->post('/api/auth/logout', 'AuthController::logout');
$router->post('/api/auth/admin-login', 'AuthController::adminLogin');

// CITIES
$router->get('/api/cities', 'CityController::index');

// COMPANIES
$router->get('/api/companies', 'CompanyController::index');
$router->post('/api/companies', 'CompanyController::store');
$router->get('/api/companies/{id}', 'CompanyController::show');
$router->get('/api/companies/{companyId}/routes', 'RouteController::byCompany');
$router->get('/api/companies/{companyId}/branches', 'BranchController::byCompany');

// BRANCHES
$router->get('/api/branches', 'BranchController::index');
$router->get('/api/branches/{id}', 'BranchController::show');

// ROUTES
$router->get('/api/routes/search', 'RouteController::search');

// SCHEDULES
$router->post('/api/schedules', 'ScheduleController::store');
$router->get('/api/schedules/{id}', 'ScheduleController::show');
$router->get('/api/schedules/{scheduleId}/seats', 'SeatController::bySchedule');
$router->put('/api/schedules/{id}/depart', 'ScheduleController::markDeparted');

// BOOKINGS
$router->post('/api/bookings', 'BookingController::store');
$router->get('/api/bookings/{ref}', 'BookingController::show');
$router->delete('/api/bookings/{ref}', 'BookingController::cancel');
$router->get('/api/bookings/user/{userId}', 'BookingController::byUser');
$router->put('/api/bookings/{ref}/passenger-info', 'BookingController::updatePassengerInfo');

// PAYMENTS
$router->post('/api/payments', 'PaymentController::store');
$router->get('/api/payments/{id}', 'PaymentController::show');
$router->post('/api/payments/{id}/upload-proof', 'PaymentController::uploadProof');
$router->put('/api/payments/{id}/approve', 'PaymentController::approve');
$router->put('/api/payments/{id}/reject', 'PaymentController::reject');

// TICKETS
$router->get('/api/tickets/{code}', 'TicketController::show');
$router->post('/api/tickets/{code}/validate', 'TicketController::validate');

// PARCELS
$router->post('/api/parcels', 'ParcelController::store');
$router->get('/api/parcels/{trackingOrId}', 'ParcelController::show');
$router->get('/api/parcels/user/{userId}', 'ParcelController::byUser');
$router->put('/api/parcels/{id}/status', 'ParcelController::updateStatus');

// NOTIFICATIONS
$router->get('/api/notifications', 'NotificationController::index');
$router->put('/api/notifications/{id}/read', 'NotificationController::markRead');
$router->put('/api/notifications/read-all', 'NotificationController::markAllRead');

// ADMIN
$router->get('/api/admin/dashboard', 'AdminController::dashboard');
$router->get('/api/admin/payments', 'AdminController::pendingPayments');
$router->put('/api/admin/payments/{id}/approve', 'PaymentController::approve');
$router->put('/api/admin/payments/{id}/reject', 'PaymentController::reject');
$router->get('/api/admin/bookings', 'AdminController::allBookings');
$router->post('/api/admin/companies', 'AdminController::createCompany');
$router->delete('/api/admin/companies/{id}', 'AdminController::deleteCompany');
$router->post('/api/admin/routes', 'AdminController::createRoute');
$router->delete('/api/admin/routes/{id}', 'AdminController::deleteRoute');
$router->get('/api/admin/buses', 'AdminController::listBuses');
$router->post('/api/admin/buses', 'AdminController::createBus');
$router->put('/api/admin/buses/{busId}/faulty', 'AdminController::markBusFaulty');
$router->put('/api/admin/buses/{busId}/operational', 'AdminController::markBusOperational');
$router->post('/api/admin/admins', 'AdminController::createAdmin');
$router->get('/api/admin/admins', 'AdminController::listAdmins');
$router->delete('/api/admin/admins/{id}', 'AdminController::deleteAdmin');
$router->get('/api/admin/parcels', 'AdminController::allParcels');

// HEALTH CHECK
$router->get('/api/health', function() {
    Response::success(['status' => 'ok', 'app' => 'CamerBus API', 'version' => '1.0.0']);
});

$router->dispatch($_SERVER['REQUEST_METHOD'], parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));