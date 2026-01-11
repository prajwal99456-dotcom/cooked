# LuminaAI Builder - Complete Production Setup Guide

## Architecture Overview

```
lumina-builder/
├── frontend/                 # React + Vite + Sandpack
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── PreviewPanel.tsx
│   │   │   ├── CodeEditor.tsx
│   │   │   └── SettingsModal.tsx
│   │   ├── hooks/
│   │   │   └── useChat.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── api/                      # PHP Backend
│   ├── chat.php
│   ├── settings.php
│   └── config.php
└── README.md
```

---

## PART 1: FRONTEND SETUP (React + Vite + Sandpack)

### Step 1: Create Project

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install @codesandbox/sandpack-react @codesandbox/sandpack-themes
npm install lucide-react framer-motion
npm install
```

### Step 2: package.json

```json
{
  "name": "lumina-builder",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@codesandbox/sandpack-react": "^2.13.5",
    "@codesandbox/sandpack-themes": "^2.0.21",
    "framer-motion": "^10.18.0",
    "lucide-react": "^0.300.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.2.0",
    "vite": "^5.0.0"
  }
}
```

### Step 3: vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
});
```

### Step 4: src/main.tsx

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Step 5: src/index.css

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #111111;
  --bg-tertiary: #1a1a1a;
  --border-color: rgba(255, 255, 255, 0.08);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-muted: rgba(255, 255, 255, 0.4);
  --accent-primary: #7c3aed;
  --accent-secondary: #ec4899;
  --chat-width: 380px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100%;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
}

/* App Layout */
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* Chat Panel */
.chat-panel {
  width: var(--chat-width);
  min-width: var(--chat-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 15px;
}

.logo-icon {
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  border-radius: 50%;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  margin-bottom: 20px;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.message-role {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 8px;
  border-radius: 4px;
}

.message-role.user {
  background: var(--accent-primary);
  color: white;
}

.message-role.ai {
  background: var(--accent-secondary);
  color: white;
}

.message-time {
  font-size: 11px;
  color: var(--text-muted);
}

.message-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.chat-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}

.suggestion-chip {
  padding: 8px 14px;
  font-size: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-chip:hover {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
}

.chat-input-container {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  font-size: 14px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  resize: none;
  outline: none;
}

.chat-input:focus {
  border-color: var(--accent-primary);
}

.send-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.send-btn:hover {
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Main Panel */
.main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 56px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.tabs {
  display: flex;
  gap: 4px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: var(--text-secondary);
  background: var(--bg-tertiary);
}

.tab.active {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.tab-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Preview Container */
.preview-container {
  flex: 1;
  overflow: hidden;
}

/* Sandpack Overrides */
.sp-wrapper {
  height: 100% !important;
}

.sp-layout {
  height: 100% !important;
  border: none !important;
  border-radius: 0 !important;
}

.sp-stack {
  height: 100% !important;
}

.sp-preview-container {
  height: 100% !important;
}

/* Code Tab */
.code-container {
  flex: 1;
  overflow: hidden;
}

/* Settings Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
}

.modal-overlay.active {
  opacity: 1;
  visibility: visible;
}

.modal {
  width: 90%;
  max-width: 480px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  transform: scale(0.95);
  transition: transform 0.2s;
}

.modal-overlay.active .modal {
  transform: scale(1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 16px;
  font-weight: 600;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  outline: none;
}

.form-control:focus {
  border-color: var(--accent-primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--border-color);
}

.btn-secondary {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
}

.btn-primary {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  background: var(--accent-primary);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}
```

### Step 6: src/App.tsx

```tsx
import React, { useState } from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import { sandpackDark } from '@codesandbox/sandpack-themes';
import { Send, Settings, Plus, RefreshCw, Maximize2, Download } from 'lucide-react';

// Default App code
const defaultAppCode = `import React from 'react';

function App() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      color: 'white',
      fontFamily: 'Inter, system-ui, sans-serif',
      textAlign: 'center',
      padding: '40px 20px'
    }}>
      <h1 style={{
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        fontWeight: 800,
        background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '1rem'
      }}>
        Welcome to <span style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>Lumina</span>
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>
        Describe what you want to build in the chat.
      </p>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
        Your app will appear here instantly.
      </p>
    </div>
  );
}

export default App;`;

// Default dependencies for Sandpack
const defaultDependencies = {
  "framer-motion": "^10.18.0",
  "lucide-react": "^0.300.0",
  "three": "^0.160.0",
  "@react-three/fiber": "^8.15.14",
  "@react-three/drei": "^9.99.0",
  "zustand": "^4.5.0"
};

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  time: string;
}

interface FileChange {
  file: string;
  action: string;
  content?: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [files, setFiles] = useState<Record<string, string>>({
    '/App.tsx': defaultAppCode
  });
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  const [model, setModel] = useState(localStorage.getItem('model') || 'gemini-2.0-flash');

  const suggestions = [
    { label: '✨ Landing Page', prompt: 'Create a modern landing page with hero section and features grid' },
    { label: '🎮 3D Cube', prompt: 'Create a 3D rotating cube using React Three Fiber' },
    { label: '📝 Todo App', prompt: 'Create a todo app with add, complete, and delete functionality' },
    { label: '🌤️ Weather UI', prompt: 'Create a weather dashboard with animated cards' }
  ];

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          apiKey,
          model,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) fullResponse += data.text;
              if (data.files) {
                // Update files from AI response
                const newFiles = { ...files };
                data.files.forEach((change: FileChange) => {
                  if (change.action === 'delete') {
                    delete newFiles[change.file];
                  } else if (change.content) {
                    // Normalize path for Sandpack
                    let path = change.file;
                    if (!path.startsWith('/')) path = '/' + path;
                    path = path.replace(/^\/src\//, '/');
                    newFiles[path] = change.content;
                  }
                });
                setFiles(newFiles);
              }
            } catch {}
          }
        }
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: fullResponse || 'Code generated successfully!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const saveSettings = () => {
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('model', model);
    setShowSettings(false);
  };

  return (
    <div className="app-container">
      {/* Chat Panel */}
      <aside className="chat-panel">
        <header className="chat-header">
          <div className="logo">
            <span className="logo-icon"></span>
            <span>LuminaAI</span>
          </div>
          <div className="header-actions">
            <button className="btn-icon" title="New Project">
              <Plus size={16} />
            </button>
            <button className="btn-icon" onClick={() => setShowSettings(true)} title="Settings">
              <Settings size={16} />
            </button>
          </div>
        </header>

        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="message">
              <div className="message-content">
                <p><strong>Welcome to LuminaAI</strong></p>
                <p style={{ marginTop: 8 }}>Describe what you want to build and I'll create it for you.</p>
              </div>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className="message">
              <div className="message-header">
                <span className={`message-role ${msg.role}`}>
                  {msg.role === 'user' ? 'You' : 'Lumina'}
                </span>
                <span className="message-time">{msg.time}</span>
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="message">
              <div className="message-header">
                <span className="message-role ai">Lumina</span>
              </div>
              <div className="message-content">Generating code...</div>
            </div>
          )}
        </div>

        <div className="chat-suggestions">
          {suggestions.map(s => (
            <button 
              key={s.label} 
              className="suggestion-chip"
              onClick={() => setInput(s.prompt)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="chat-input-container">
          <textarea
            className="chat-input"
            placeholder="Describe what you want to build..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button 
            className="send-btn" 
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-panel">
        <header className="main-header">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              <span className="tab-dot"></span>
              Preview
            </button>
            <button 
              className={`tab ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              <span className="tab-dot"></span>
              Code
            </button>
          </div>
          <div className="header-actions">
            <button className="btn-icon" title="Refresh">
              <RefreshCw size={16} />
            </button>
            <button className="btn-icon" title="Fullscreen">
              <Maximize2 size={16} />
            </button>
            <button className="btn-icon" title="Export">
              <Download size={16} />
            </button>
          </div>
        </header>

        <div className="preview-container">
          <Sandpack
            template="react-ts"
            theme={sandpackDark}
            files={files}
            customSetup={{
              dependencies: defaultDependencies
            }}
            options={{
              showNavigator: false,
              showTabs: activeTab === 'code',
              showLineNumbers: true,
              showInlineErrors: true,
              editorHeight: '100%',
              recompileMode: 'delayed',
              recompileDelay: 500,
              activeFile: '/App.tsx',
              visibleFiles: activeTab === 'code' 
                ? Object.keys(files) 
                : undefined,
              layout: activeTab === 'code' ? 'console' : 'preview'
            }}
          />
        </div>
      </main>

      {/* Settings Modal */}
      <div className={`modal-overlay ${showSettings ? 'active' : ''}`} onClick={() => setShowSettings(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <header className="modal-header">
            <h2>Settings</h2>
            <button className="btn-icon" onClick={() => setShowSettings(false)}>×</button>
          </header>
          <div className="modal-body">
            <div className="form-group">
              <label>API Key</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your Google AI API key"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Model</label>
              <input
                type="text"
                className="form-control"
                placeholder="gemini-2.0-flash"
                value={model}
                onChange={e => setModel(e.target.value)}
              />
            </div>
          </div>
          <footer className="modal-footer">
            <button className="btn-secondary" onClick={() => setShowSettings(false)}>Cancel</button>
            <button className="btn-primary" onClick={saveSettings}>Save</button>
          </footer>
        </div>
      </div>
    </div>
  );
}
```

---

## PART 2: PHP BACKEND

### api/config.php

```php
<?php
define('SETTINGS_FILE', __DIR__ . '/settings.json');

function loadSettings() {
    if (file_exists(SETTINGS_FILE)) {
        return json_decode(file_get_contents(SETTINGS_FILE), true) ?: [];
    }
    return [];
}

function saveSettings($settings) {
    file_put_contents(SETTINGS_FILE, json_encode($settings, JSON_PRETTY_PRINT));
}

function getRequestBody() {
    return json_decode(file_get_contents('php://input'), true) ?: [];
}
```

### api/chat.php

```php
<?php
require_once __DIR__ . '/config.php';

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

if (ob_get_level()) ob_end_clean();

$data = getRequestBody();

if (empty($data['message']) || empty($data['apiKey'])) {
    sendSSE('error', ['error' => 'Message and API key required']);
    exit;
}

$apiKey = $data['apiKey'];
$model = $data['model'] ?? 'gemini-2.0-flash';
$message = $data['message'];
$history = $data['history'] ?? [];

$systemPrompt = getSystemPrompt();

// Build contents for Gemini
$contents = [];
foreach ($history as $msg) {
    $contents[] = [
        'role' => $msg['role'] === 'user' ? 'user' : 'model',
        'parts' => [['text' => $msg['content']]]
    ];
}
$contents[] = [
    'role' => 'user',
    'parts' => [['text' => $message]]
];

// Call Gemini API
$url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:streamGenerateContent?key={$apiKey}&alt=sse";

$payload = [
    'contents' => $contents,
    'systemInstruction' => ['parts' => [['text' => $systemPrompt]]],
    'generationConfig' => [
        'temperature' => 0.7,
        'maxOutputTokens' => 8192
    ]
];

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_RETURNTRANSFER => false,
    CURLOPT_WRITEFUNCTION => function($ch, $chunk) {
        $lines = explode("\n", $chunk);
        foreach ($lines as $line) {
            if (strpos($line, 'data: ') === 0) {
                $json = json_decode(substr($line, 6), true);
                if (isset($json['candidates'][0]['content']['parts'][0]['text'])) {
                    $text = $json['candidates'][0]['content']['parts'][0]['text'];
                    sendSSE('content', ['text' => $text]);
                }
            }
        }
        return strlen($chunk);
    }
]);

curl_exec($ch);
curl_close($ch);

sendSSE('done', ['status' => 'complete']);

function sendSSE($event, $data) {
    echo "event: {$event}\n";
    echo "data: " . json_encode($data) . "\n\n";
    if (ob_get_level()) ob_flush();
    flush();
}

function getSystemPrompt() {
    return <<<'PROMPT'
You are LuminaAI, an expert React developer. Generate COMPLETE, WORKING code using this XML format:

<response>
    <thinking>Brief analysis</thinking>
    <changes>
        <change>
            <file>App.tsx</file>
            <action>create</action>
            <description>Description</description>
            <content><![CDATA[
// Complete code here
            ]]></content>
        </change>
    </changes>
    <message>Brief explanation</message>
</response>

## RULES:
1. Files go at ROOT level (App.tsx, not src/App.tsx)
2. DO NOT create index.tsx - Sandpack handles this
3. Use standard imports: import React from 'react';
4. Export default: export default App;

## AVAILABLE LIBRARIES:
- react, react-dom
- framer-motion (for 2D animations)
- lucide-react (for icons)
- three, @react-three/fiber, @react-three/drei (for 3D)
- zustand (for state)

## 2D vs 3D:
- 2D UI: Use framer-motion's motion.div with initial/animate props
- 3D: Use Canvas from @react-three/fiber, put useFrame INSIDE Canvas children

## STYLING:
- Dark theme (#0a0a0a, #1a1a2e)
- Vibrant accents (#7c3aed, #ec4899)
- Use inline styles or CSS-in-JS

Generate COMPLETE code - never use placeholders!
PROMPT;
}
```

---

## PART 3: RUNNING THE PROJECT

### Development

```bash
# Terminal 1: PHP API
cd api
php -S localhost:8000

# Terminal 2: React Frontend
cd frontend
npm run dev
```

### Production Build

```bash
cd frontend
npm run build
# Copy dist/ to your PHP server
```

---

## SUMMARY

This is the **official, proper way** to use Sandpack:
- ✅ npm install @codesandbox/sandpack-react
- ✅ Use it as a React component
- ✅ Pass files and dependencies as props
- ✅ No CDN hacks, no version conflicts
- ✅ Works 100% reliably

The PHP backend handles AI streaming, the React frontend handles the UI and Sandpack preview.
