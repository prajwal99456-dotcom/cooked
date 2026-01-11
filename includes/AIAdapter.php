<?php
/**
 * LuminaAI Builder - AI Adapter
 * 
 * Multi-provider AI adapter supporting:
 * - Google Gemini (v1beta/chat/completions)
 * - OpenRouter (v1/chat/completions)
 * - Any OpenAI-compatible API (v1/chat/completions)
 */

class AIAdapter
{
    private $provider;
    private $apiKey;
    private $model;
    private $endpoint;
    private $autoDetect;

    public function __construct($settings)
    {
        $this->provider = $settings['provider'] ?? 'google';
        $this->apiKey = $settings['api_key'] ?? '';
        $this->model = $settings['model'] ?? 'gemini-2.5-flash-preview-05-20';
        $this->endpoint = $settings['endpoint'] ?? 'https://generativelanguage.googleapis.com';
        $this->autoDetect = $settings['auto_detect_endpoint'] ?? true;
    }

    /**
     * Get the normalized API endpoint
     */
    public function getEndpoint()
    {
        $endpoint = rtrim($this->endpoint, '/');

        // If already ends with /chat/completions, use as-is
        if (preg_match('#/chat/completions$#', $endpoint)) {
            return $endpoint;
        }

        // Auto-detect based on provider or URL
        if ($this->autoDetect) {
            if (
                $this->provider === 'google' ||
                strpos($endpoint, 'generativelanguage.googleapis.com') !== false
            ) {
                // Google uses v1beta
                if (!preg_match('#/v1beta/?$#', $endpoint)) {
                    $endpoint .= '/v1beta';
                }
                return rtrim($endpoint, '/') . '/chat/completions';
            }
        }

        // Default to OpenAI-compatible v1
        if (!preg_match('#/v1/?$#', $endpoint)) {
            $endpoint .= '/v1';
        }
        return rtrim($endpoint, '/') . '/chat/completions';
    }

    /**
     * Build the request headers
     */
    private function getHeaders()
    {
        $headers = [
            'Content-Type: application/json',
        ];

        // Google uses different auth header format
        if (
            $this->provider === 'google' ||
            strpos($this->endpoint, 'generativelanguage.googleapis.com') !== false
        ) {
            // Google accepts both Bearer and x-goog-api-key
            $headers[] = 'Authorization: Bearer ' . $this->apiKey;
        } else {
            $headers[] = 'Authorization: Bearer ' . $this->apiKey;
        }

        // OpenRouter specific headers
        if (strpos($this->endpoint, 'openrouter.ai') !== false) {
            $headers[] = 'HTTP-Referer: http://localhost';
            $headers[] = 'X-Title: LuminaAI Builder';
        }

        return $headers;
    }

    /**
     * Format messages for the API request
     */
    private function formatMessages($messages, $systemPrompt)
    {
        $formatted = [];

        // Add system message
        if (!empty($systemPrompt)) {
            $formatted[] = [
                'role' => 'system',
                'content' => $systemPrompt
            ];
        }

        // Add conversation messages
        foreach ($messages as $msg) {
            $formatted[] = [
                'role' => $msg['role'],
                'content' => $msg['content']
            ];
        }

        return $formatted;
    }

    /**
     * Test the API connection
     */
    public function testConnection()
    {
        $endpoint = $this->getEndpoint();

        $payload = [
            'model' => $this->model,
            'messages' => [
                ['role' => 'user', 'content' => 'Say "Connection successful!" and nothing else.']
            ],
            'max_tokens' => 50
        ];

        $ch = curl_init($endpoint);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => $this->getHeaders(),
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return ['success' => false, 'error' => 'cURL error: ' . $error];
        }

        if ($httpCode !== 200) {
            $data = json_decode($response, true);
            $errorMsg = $data['error']['message'] ?? $response;
            return ['success' => false, 'error' => "HTTP $httpCode: $errorMsg"];
        }

        $data = json_decode($response, true);
        $content = $data['choices'][0]['message']['content'] ?? 'Unknown response';

        return [
            'success' => true,
            'message' => $content,
            'model' => $this->model,
            'endpoint' => $endpoint
        ];
    }

    /**
     * Send a streaming chat request
     */
    public function streamChat($messages, $systemPrompt, $callback)
    {
        $endpoint = $this->getEndpoint();

        $payload = [
            'model' => $this->model,
            'messages' => $this->formatMessages($messages, $systemPrompt),
            'stream' => true,
            'max_tokens' => 16384
        ];

        $ch = curl_init($endpoint);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => $this->getHeaders(),
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_TIMEOUT => 300,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_WRITEFUNCTION => function ($ch, $data) use ($callback) {
                $callback($data);
                return strlen($data);
            }
        ]);

        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return ['success' => false, 'error' => 'cURL error: ' . $error];
        }

        if ($httpCode !== 200) {
            return ['success' => false, 'error' => "HTTP $httpCode"];
        }

        return ['success' => true];
    }

    /**
     * Send a non-streaming chat request
     */
    public function chat($messages, $systemPrompt)
    {
        $endpoint = $this->getEndpoint();

        $payload = [
            'model' => $this->model,
            'messages' => $this->formatMessages($messages, $systemPrompt),
            'max_tokens' => 16384
        ];

        $ch = curl_init($endpoint);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => $this->getHeaders(),
            CURLOPT_TIMEOUT => 300,
            CURLOPT_SSL_VERIFYPEER => true
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return ['success' => false, 'error' => 'cURL error: ' . $error];
        }

        if ($httpCode !== 200) {
            $data = json_decode($response, true);
            $errorMsg = $data['error']['message'] ?? $response;
            return ['success' => false, 'error' => "HTTP $httpCode: $errorMsg"];
        }

        $data = json_decode($response, true);
        $content = $data['choices'][0]['message']['content'] ?? '';

        return [
            'success' => true,
            'content' => $content,
            'usage' => $data['usage'] ?? null
        ];
    }
}
