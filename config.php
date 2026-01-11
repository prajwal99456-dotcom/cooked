<?php
/**
 * LuminaAI Builder - Configuration
 * 
 * Core configuration file for the AI code builder platform.
 * Uses JSON file storage for simplicity (single-user setup).
 */

// Error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Session configuration
session_start();

// Base paths
define('ROOT_PATH', __DIR__);
define('DATA_PATH', ROOT_PATH . '/data');
define('PROJECTS_PATH', DATA_PATH . '/projects');
define('SETTINGS_FILE', DATA_PATH . '/settings.json');

// Create data directories if they don't exist
if (!is_dir(DATA_PATH)) {
    mkdir(DATA_PATH, 0755, true);
}
if (!is_dir(PROJECTS_PATH)) {
    mkdir(PROJECTS_PATH, 0755, true);
}

// Default settings
$defaultSettings = [
    'provider' => 'google',
    'model' => 'gemini-2.5-flash-preview-05-20',
    'api_key' => '',
    'endpoint' => 'https://generativelanguage.googleapis.com',
    'system_instructions' => '',
    'auto_detect_endpoint' => true
];

/**
 * Load settings from JSON file
 */
function loadSettings() {
    global $defaultSettings;
    
    if (!file_exists(SETTINGS_FILE)) {
        return $defaultSettings;
    }
    
    $data = json_decode(file_get_contents(SETTINGS_FILE), true);
    return array_merge($defaultSettings, $data ?? []);
}

/**
 * Save settings to JSON file
 */
function saveSettings($settings) {
    global $defaultSettings;
    $merged = array_merge($defaultSettings, $settings);
    return file_put_contents(SETTINGS_FILE, json_encode($merged, JSON_PRETTY_PRINT));
}

/**
 * Get a specific setting value
 */
function getSetting($key, $default = null) {
    $settings = loadSettings();
    return $settings[$key] ?? $default;
}

/**
 * Generate a UUID v4
 */
function generateUUID() {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

/**
 * Send JSON response
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/**
 * Send error response
 */
function errorResponse($message, $statusCode = 400) {
    jsonResponse(['error' => true, 'message' => $message], $statusCode);
}

/**
 * Get request body as JSON
 */
function getRequestBody() {
    $body = file_get_contents('php://input');
    return json_decode($body, true) ?? [];
}
