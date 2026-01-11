/**
 * LuminaAI Builder - Settings Handler
 * 
 * Manages settings with reliable theme toggle.
 */

class SettingsHandler {
    constructor() {
        this.modal = null;
        this.isOpen = false;
    }

    /**
     * Initialize
     */
    init() {
        this.modal = document.getElementById('settingsModal');

        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => this.open());

        // Close/Cancel buttons
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.close());
        document.getElementById('cancelSettingsBtn').addEventListener('click', () => this.close());

        // Save button
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.save());

        // Test API button
        document.getElementById('testApiBtn').addEventListener('click', () => this.testConnection());

        // Toggle API key visibility
        document.getElementById('toggleApiKeyBtn').addEventListener('click', () => this.toggleApiKeyVisibility());

        // Provider change
        document.getElementById('providerSelect').addEventListener('change', (e) => this.onProviderChange(e));

        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });

        // Load settings
        this.loadSettings();

        // Initialize theme from localStorage
        this.initTheme();
    }

    /**
     * Initialize theme from localStorage
     */
    initTheme() {
        const savedTheme = localStorage.getItem('luminaTheme') || 'dark';
        this.applyTheme(savedTheme);
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        this.applyTheme(newTheme);
        localStorage.setItem('luminaTheme', newTheme);

        // Save to backend too
        fetch('/api/settings.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme: newTheme })
        }).catch(() => { }); // Silent fail for theme
    }

    /**
     * Apply theme
     */
    applyTheme(theme) {
        const html = document.documentElement;
        const toggle = document.getElementById('themeToggle');

        if (theme === 'light') {
            html.setAttribute('data-theme', 'light');
            toggle?.classList.add('light');
        } else {
            html.removeAttribute('data-theme');
            toggle?.classList.remove('light');
        }
    }

    /**
     * Open modal
     */
    async open() {
        await this.loadSettings();
        this.modal.classList.add('active');
        this.isOpen = true;
    }

    /**
     * Close modal
     */
    close() {
        this.modal.classList.remove('active');
        this.isOpen = false;
        document.getElementById('apiKeyInput').value = '';
    }

    /**
     * Load settings
     */
    async loadSettings() {
        try {
            const response = await fetch('/api/settings.php');
            const data = await response.json();

            if (data.success && data.settings) {
                const s = data.settings;

                document.getElementById('providerSelect').value = s.provider || 'google';
                document.getElementById('modelInput').value = s.model || '';
                document.getElementById('endpointInput').value = s.endpoint || '';
                document.getElementById('autoDetectCheckbox').checked = s.auto_detect_endpoint !== false;
                document.getElementById('systemInstructions').value = s.system_instructions || '';

                const apiKeyInput = document.getElementById('apiKeyInput');
                if (s.has_api_key && s.api_key_masked) {
                    apiKeyInput.placeholder = 'Current: ' + s.api_key_masked;
                } else {
                    apiKeyInput.placeholder = 'Enter your API key';
                }
                apiKeyInput.value = '';

                // Apply theme from settings if different from localStorage
                if (s.theme && !localStorage.getItem('luminaTheme')) {
                    this.applyTheme(s.theme);
                }

                this.onProviderChange({ target: { value: s.provider } });
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    /**
     * Save settings
     */
    async save() {
        const saveBtn = document.getElementById('saveSettingsBtn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        try {
            const settings = {
                provider: document.getElementById('providerSelect').value,
                model: document.getElementById('modelInput').value,
                endpoint: document.getElementById('endpointInput').value,
                auto_detect_endpoint: document.getElementById('autoDetectCheckbox').checked,
                system_instructions: document.getElementById('systemInstructions').value,
                theme: document.documentElement.getAttribute('data-theme') || 'dark'
            };

            const apiKeyValue = document.getElementById('apiKeyInput').value.trim();
            if (apiKeyValue) {
                settings.api_key = apiKeyValue;
            }

            const response = await fetch('/api/settings.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            const data = await response.json();

            if (data.success) {
                this.showStatus('Settings saved!', 'success');
                document.getElementById('apiKeyInput').value = '';
                setTimeout(() => this.close(), 800);
            } else {
                this.showStatus(data.message || 'Failed to save', 'error');
            }
        } catch (error) {
            this.showStatus('Error: ' + error.message, 'error');
        } finally {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    }

    /**
     * Test API connection
     */
    async testConnection() {
        const testBtn = document.getElementById('testApiBtn');
        const originalText = testBtn.textContent;
        testBtn.textContent = 'Testing...';
        testBtn.disabled = true;

        try {
            const settings = {
                provider: document.getElementById('providerSelect').value,
                model: document.getElementById('modelInput').value,
                endpoint: document.getElementById('endpointInput').value
            };

            const apiKeyValue = document.getElementById('apiKeyInput').value.trim();
            if (apiKeyValue) {
                settings.api_key = apiKeyValue;
            }

            const response = await fetch('/api/test-connection.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            const data = await response.json();

            if (data.success) {
                this.showStatus('✓ Connected!', 'success');
            } else {
                this.showStatus('✕ ' + (data.message || 'Failed'), 'error');
            }
        } catch (error) {
            this.showStatus('✕ ' + error.message, 'error');
        } finally {
            testBtn.textContent = originalText;
            testBtn.disabled = false;
        }
    }

    /**
     * Toggle API key visibility
     */
    toggleApiKeyVisibility() {
        const input = document.getElementById('apiKeyInput');
        input.type = input.type === 'password' ? 'text' : 'password';
    }

    /**
     * Handle provider change
     */
    onProviderChange(e) {
        const provider = e.target.value;
        const endpointInput = document.getElementById('endpointInput');
        const modelInput = document.getElementById('modelInput');

        switch (provider) {
            case 'google':
                if (!endpointInput.value || endpointInput.value.includes('openrouter')) {
                    endpointInput.value = 'https://generativelanguage.googleapis.com';
                }
                modelInput.placeholder = 'gemini-2.5-flash-preview-05-20';
                break;
            case 'openrouter':
                if (!endpointInput.value || endpointInput.value.includes('googleapis')) {
                    endpointInput.value = 'https://openrouter.ai/api';
                }
                modelInput.placeholder = 'anthropic/claude-3-sonnet';
                break;
            case 'custom':
                modelInput.placeholder = 'model-name';
                break;
        }
    }

    /**
     * Show status
     */
    showStatus(message, type) {
        const statusEl = document.getElementById('apiKeyStatus');
        statusEl.textContent = message;
        statusEl.className = `form-hint text-${type}`;

        if (type === 'success') {
            setTimeout(() => {
                statusEl.textContent = '';
                statusEl.className = 'form-hint';
            }, 3000);
        }
    }
}

window.settingsHandler = new SettingsHandler();
