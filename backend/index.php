<?php
/**
 * CamerBus API — Entry Point
 */
declare(strict_types=1);

define('ROOT_PATH', __DIR__);
define('APP_START', microtime(true));

// Load environment variables
require_once ROOT_PATH . '/config/env.php';
loadEnv(ROOT_PATH . '/.env');

// CORS middleware (must run first)
require_once ROOT_PATH . '/middleware/CorsMiddleware.php';
CorsMiddleware::handle();

// Autoload helpers
require_once ROOT_PATH . '/helpers/Response.php';
require_once ROOT_PATH . '/helpers/Validator.php';
require_once ROOT_PATH . '/helpers/Router.php';
require_once ROOT_PATH . '/config/database.php';
require_once ROOT_PATH . '/config/jwt.php';

// Route dispatcher
require_once ROOT_PATH . '/routes/api.php';
