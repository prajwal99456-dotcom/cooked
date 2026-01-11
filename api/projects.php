<?php
/**
 * LuminaAI Builder - Projects API
 * 
 * CRUD operations for projects.
 * Projects are stored as JSON files in the data/projects directory.
 */

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];
$projectId = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($projectId) {
            // Get single project
            $projectFile = PROJECTS_PATH . '/' . $projectId . '.json';
            if (!file_exists($projectFile)) {
                errorResponse('Project not found', 404);
            }
            $project = json_decode(file_get_contents($projectFile), true);
            jsonResponse(['success' => true, 'project' => $project]);
        } else {
            // List all projects
            $projects = [];
            $files = glob(PROJECTS_PATH . '/*.json');
            foreach ($files as $file) {
                $project = json_decode(file_get_contents($file), true);
                if ($project) {
                    $projects[] = [
                        'id' => $project['id'],
                        'name' => $project['name'],
                        'description' => $project['description'] ?? '',
                        'created_at' => $project['created_at'],
                        'updated_at' => $project['updated_at']
                    ];
                }
            }
            // Sort by updated_at descending
            usort($projects, fn($a, $b) => strtotime($b['updated_at']) - strtotime($a['updated_at']));
            jsonResponse(['success' => true, 'projects' => $projects]);
        }
        break;

    case 'POST':
        $data = getRequestBody();

        // Create new project
        $id = generateUUID();
        $now = date('c');

        $project = [
            'id' => $id,
            'name' => $data['name'] ?? 'Untitled Project',
            'description' => $data['description'] ?? '',
            'files' => $data['files'] ?? getDefaultFiles(),
            'chat_history' => [],
            'settings' => $data['settings'] ?? [],
            'created_at' => $now,
            'updated_at' => $now
        ];

        $projectFile = PROJECTS_PATH . '/' . $id . '.json';
        file_put_contents($projectFile, json_encode($project, JSON_PRETTY_PRINT));

        jsonResponse(['success' => true, 'project' => $project], 201);
        break;

    case 'PUT':
        if (!$projectId) {
            errorResponse('Project ID required');
        }

        $projectFile = PROJECTS_PATH . '/' . $projectId . '.json';
        if (!file_exists($projectFile)) {
            errorResponse('Project not found', 404);
        }

        $project = json_decode(file_get_contents($projectFile), true);
        $data = getRequestBody();

        // Update allowed fields
        $allowedFields = ['name', 'description', 'files', 'chat_history', 'settings'];
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $project[$field] = $data[$field];
            }
        }

        $project['updated_at'] = date('c');
        file_put_contents($projectFile, json_encode($project, JSON_PRETTY_PRINT));

        jsonResponse(['success' => true, 'project' => $project]);
        break;

    case 'DELETE':
        if (!$projectId) {
            errorResponse('Project ID required');
        }

        $projectFile = PROJECTS_PATH . '/' . $projectId . '.json';
        if (!file_exists($projectFile)) {
            errorResponse('Project not found', 404);
        }

        unlink($projectFile);
        jsonResponse(['success' => true, 'message' => 'Project deleted']);
        break;

    default:
        errorResponse('Method not allowed', 405);
}

/**
 * Get default files for a new project
 */
function getDefaultFiles()
{
    return [
        'index.html' => [
            'content' => '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LuminaAI App</title>
    <script type="importmap">
    {
        "imports": {
            "react": "https://esm.sh/react@18",
            "react-dom": "https://esm.sh/react-dom@18",
            "react-dom/client": "https://esm.sh/react-dom@18/client",
            "react/jsx-runtime": "https://esm.sh/react@18/jsx-runtime"
        }
    }
    </script>
    <link rel="stylesheet" href="./styles.css">
</head>
<body>
    <div id="root"></div>
    <script type="module" src="./src/index.tsx"></script>
</body>
</html>',
            'type' => 'html'
        ],
        'src/index.tsx' => [
            'content' => 'import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);',
            'type' => 'tsx'
        ],
        'src/App.tsx' => [
            'content' => 'import React from "react";

export default function App() {
    return (
        <div className="app">
            <h1>Welcome to LuminaAI</h1>
            <p>Start building your application by chatting with the AI.</p>
        </div>
    );
}',
            'type' => 'tsx'
        ],
        'styles.css' => [
            'content' => '* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: system-ui, -apple-system, sans-serif;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    min-height: 100vh;
    color: #fff;
}

.app {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    text-align: center;
    padding: 2rem;
}

h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    background: linear-gradient(90deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

p {
    color: #a0aec0;
    font-size: 1.2rem;
}',
            'type' => 'css'
        ],
        'metadata.json' => [
            'content' => json_encode([
                'name' => 'LuminaAI App',
                'version' => '1.0.0',
                'dependencies' => [
                    'react' => '18',
                    'react-dom' => '18'
                ]
            ], JSON_PRETTY_PRINT),
            'type' => 'json'
        ]
    ];
}
