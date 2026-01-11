<?php
/**
 * LuminaAI Builder - Settings API
 * 
 * GET: Retrieve current settings (with API key masked)
 * POST: Update settings
 */

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $settings = loadSettings();

        // Create a copy for the response
        $response = [
            'provider' => $settings['provider'] ?? 'google',
            'model' => $settings['model'] ?? '',
            'endpoint' => $settings['endpoint'] ?? '',
            'auto_detect_endpoint' => $settings['auto_detect_endpoint'] ?? true,
            'system_instructions' => $settings['system_instructions'] ?? '',
            'theme' => $settings['theme'] ?? 'dark'
        ];

        // Mask the API key for security but indicate if one exists
        if (!empty($settings['api_key'])) {
            $key = $settings['api_key'];
            $response['api_key_masked'] = substr($key, 0, 8) . '...' . substr($key, -4);
            $response['has_api_key'] = true;
        } else {
            $response['api_key_masked'] = '';
            $response['has_api_key'] = false;
        }

        jsonResponse(['success' => true, 'settings' => $response]);
        break;

    case 'POST':
        $data = getRequestBody();

        if (empty($data)) {
            errorResponse('No data provided');
        }

        // Load current settings to preserve API key if not changed
        $current = loadSettings();

        // Update only provided fields
        $allowedFields = ['provider', 'model', 'api_key', 'endpoint', 'system_instructions', 'auto_detect_endpoint', 'theme'];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                // Only update API key if a new (non-empty) one is provided
                if ($field === 'api_key') {
                    if (!empty($data[$field])) {
                        $current[$field] = $data[$field];
                    }
                    // If empty, keep the existing key
                } else {
                    $current[$field] = $data[$field];
                }
            }
        }

        // Save settings
        $result = saveSettings($current);

        if ($result === false) {
            errorResponse('Failed to save settings', 500);
        }

        jsonResponse([
            'success' => true,
            'message' => 'Settings saved successfully'
        ]);
        break;

    default:
        errorResponse('Method not allowed', 405);
}
