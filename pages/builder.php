<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LuminaAI – AI Code Builder</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet">

    <!-- Monaco Editor -->
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/editor/editor.main.min.css">

    <!-- Stylesheets -->
    <link rel="stylesheet" href="/assets/css/main.css">
    <link rel="stylesheet" href="/assets/css/chat.css">
    <link rel="stylesheet" href="/assets/css/editor.css">
    <link rel="stylesheet" href="/assets/css/preview.css">
</head>

<body>
    <div class="app-container">
        <!-- Left Panel: Chat -->
        <aside class="chat-panel">
            <header class="chat-header">
                <div class="logo">
                    <span class="logo-icon"></span>
                    <span class="logo-text">LuminaAI</span>
                </div>
                <div class="header-actions">
                    <button class="btn-icon" id="newProjectBtn" title="New Project">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </button>
                    <button class="btn-icon" id="settingsBtn" title="Settings">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <circle cx="12" cy="12" r="3" />
                            <path
                                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                    </button>
                </div>
            </header>

            <div class="chat-messages" id="chatMessages">
                <div class="chat-message system">
                    <div class="message-content">
                        <p>Welcome to <strong>LuminaAI</strong></p>
                        <p>Describe what you want to build and I'll create it for you.</p>
                    </div>
                </div>
            </div>

            <div class="chat-suggestions" id="chatSuggestions">
                <button class="suggestion-chip"
                    data-prompt="Create a modern landing page with a hero section, features grid, and animated stats counter">
                    ✨ Landing Page
                </button>
                <button class="suggestion-chip"
                    data-prompt="Create a 3D rotating cube using Three.js with React Three Fiber">
                    🎮 3D Cube
                </button>
                <button class="suggestion-chip"
                    data-prompt="Create a todo app with add, complete, and delete functionality">
                    📝 Todo App
                </button>
                <button class="suggestion-chip"
                    data-prompt="Create a weather dashboard with animated cards and gradient backgrounds">
                    🌤️ Weather UI
                </button>
            </div>

            <div class="chat-input-container">
                <textarea id="chatInput" placeholder="Describe what you want to build..." rows="1"></textarea>
                <button class="send-btn" id="sendBtn" title="Send">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                </button>
            </div>
        </aside>

        <!-- Main Panel: Preview/Code -->
        <main class="main-panel">
            <header class="main-header">
                <div class="tabs">
                    <button class="tab active" data-tab="preview">
                        <span class="tab-dot"></span>
                        Preview
                    </button>
                    <button class="tab" data-tab="code">
                        <span class="tab-dot"></span>
                        Code
                    </button>
                </div>
                <div class="header-actions">
                    <div class="theme-toggle" id="themeToggle" title="Toggle Theme"></div>
                    <button class="btn-icon" id="refreshPreviewBtn" title="Refresh">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M23 4v6h-6M1 20v-6h6" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                    </button>
                    <button class="btn-icon" id="fullscreenBtn" title="Fullscreen">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path
                                d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                        </svg>
                    </button>
                    <button class="btn-icon" id="exportBtn" title="Export">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7,10 12,15 17,10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </button>
                </div>
            </header>

            <!-- Preview Tab -->
            <div class="tab-content active" id="previewTab">
                <div class="preview-container">
                    <iframe id="previewFrame"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"></iframe>
                </div>
            </div>

            <!-- Code Tab -->
            <div class="tab-content" id="codeTab">
                <div class="code-layout">
                    <aside class="file-explorer">
                        <div class="explorer-header">
                            <span>Files</span>
                            <button class="btn-icon-sm" id="addFileBtn" title="Add File">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                            </button>
                        </div>
                        <div class="file-tree" id="fileTree"></div>
                    </aside>
                    <div class="code-editor-container">
                        <div class="editor-tabs" id="editorTabs"></div>
                        <div id="monacoEditor"></div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Console Panel (hidden by default) -->
        <div class="logs-panel hidden" id="logsPanel">
            <header class="logs-header">
                <span>Console</span>
                <div class="logs-actions">
                    <button class="btn-icon-sm" id="clearLogsBtn" title="Clear">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        </svg>
                    </button>
                    <button class="btn-icon-sm" id="hideLogsBtn" title="Hide">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </header>
            <div class="logs-content" id="logsContent"></div>
        </div>
    </div>

    <!-- Settings Modal -->
    <div class="modal-overlay" id="settingsModal">
        <div class="modal">
            <header class="modal-header">
                <h2>Settings</h2>
                <button class="btn-icon" id="closeSettingsBtn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </header>
            <div class="modal-body">
                <div class="form-group">
                    <label for="providerSelect">Provider</label>
                    <select id="providerSelect" class="form-control">
                        <option value="google">Google Gemini</option>
                        <option value="openrouter">OpenRouter</option>
                        <option value="custom">Custom (OpenAI Compatible)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="modelInput">Model</label>
                    <input type="text" id="modelInput" class="form-control"
                        placeholder="gemini-2.5-flash-preview-05-20">
                </div>

                <div class="form-group">
                    <label for="apiKeyInput">API Key</label>
                    <div class="input-with-actions">
                        <input type="password" id="apiKeyInput" class="form-control" placeholder="Enter your API key">
                        <button class="btn-icon" id="toggleApiKeyBtn" title="Show/Hide">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
                        <button class="btn-secondary" id="testApiBtn">Test</button>
                    </div>
                    <div class="form-hint" id="apiKeyStatus"></div>
                </div>

                <div class="form-group">
                    <label for="endpointInput">Endpoint</label>
                    <input type="text" id="endpointInput" class="form-control"
                        placeholder="https://generativelanguage.googleapis.com">
                </div>

                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="autoDetectCheckbox" checked>
                        <span>Auto-detect endpoint format</span>
                    </label>
                </div>

                <div class="form-group">
                    <label for="systemInstructions">Custom Instructions</label>
                    <textarea id="systemInstructions" class="form-control" rows="3"
                        placeholder="Additional instructions for the AI..."></textarea>
                </div>
            </div>
            <footer class="modal-footer">
                <button class="btn-secondary" id="cancelSettingsBtn">Cancel</button>
                <button class="btn-primary" id="saveSettingsBtn">Save</button>
            </footer>
        </div>
    </div>

    <!-- Monaco Editor Loader -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js"></script>

    <!-- Application Scripts -->
    <!-- Application Scripts -->
    <script src="/assets/js/virtual-fs.js?v=<?php echo time(); ?>"></script>
    <script src="/assets/js/xml-parser.js?v=<?php echo time(); ?>"></script>
    <script src="/assets/js/preview-engine.js?v=<?php echo time(); ?>"></script>
    <script src="/assets/js/code-editor.js?v=<?php echo time(); ?>"></script>
    <script src="/assets/js/chat.js?v=<?php echo time(); ?>"></script>
    <script src="/assets/js/settings.js?v=<?php echo time(); ?>"></script>
    <script src="/assets/js/app.js"></script>
</body>

</html>