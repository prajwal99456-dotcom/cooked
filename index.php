<?php
/**
 * LuminaAI Builder - Main Entry Point & Router
 * 
 * Simple router that handles all requests for the AI code builder.
 */

require_once __DIR__ . '/config.php';

// Get the request path
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Remove base path if needed (for subdirectory installations)
$basePath = dirname($_SERVER['SCRIPT_NAME']);
if ($basePath !== '/') {
    $path = substr($path, strlen($basePath));
}
$path = $path ?: '/';

// Route the request
switch (true) {
    // API Routes
    case preg_match('#^/api/chat\.php#', $path):
    case preg_match('#^/api/chat#', $path):
        require_once ROOT_PATH . '/api/chat.php';
        break;

    case preg_match('#^/api/settings\.php#', $path):
    case preg_match('#^/api/settings#', $path):
        require_once ROOT_PATH . '/api/settings.php';
        break;

    case preg_match('#^/api/projects\.php#', $path):
    case preg_match('#^/api/projects#', $path):
        require_once ROOT_PATH . '/api/projects.php';
        break;

    case preg_match('#^/api/test-connection\.php#', $path):
    case preg_match('#^/api/test-connection#', $path):
        require_once ROOT_PATH . '/api/test-connection.php';
        break;

    // Static assets - let PHP serve them or fall through
    case preg_match('#^/assets/#', $path):
        // For PHP built-in server, return false to let it serve static files
        if (php_sapi_name() === 'cli-server') {
            return false;
        }
        // For Apache/Nginx, files should be served directly
        break;

    // Main builder interface (default)
    case $path === '/':
    case $path === '/builder':
    case $path === '/builder.php':
    default:
        require_once ROOT_PATH . '/pages/builder.php';
        break;
}
