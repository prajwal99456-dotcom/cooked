<?php
/**
 * LuminaAI Builder - Test Connection API
 * 
 * Tests the API connection with current settings.
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/AIAdapter.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed', 405);
}

$data = getRequestBody();
$settings = loadSettings();

// Allow overriding settings from request (for testing before save)
if (!empty($data['api_key'])) {
    $settings['api_key'] = $data['api_key'];
}
if (!empty($data['model'])) {
    $settings['model'] = $data['model'];
}
if (!empty($data['endpoint'])) {
    $settings['endpoint'] = $data['endpoint'];
}
if (isset($data['provider'])) {
    $settings['provider'] = $data['provider'];
}

// Check if API key is set
if (empty($settings['api_key'])) {
    errorResponse('API key is required');
}

// Create adapter and test connection
$adapter = new AIAdapter($settings);
$result = $adapter->testConnection();

if ($result['success']) {
    jsonResponse([
        'success' => true,
        'message' => $result['message'],
        'model' => $result['model'],
        'endpoint' => $result['endpoint']
    ]);
} else {
    errorResponse($result['error']);
}
