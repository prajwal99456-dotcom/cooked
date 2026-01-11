/**
 * LuminaAI Builder - Main Application
 * 
 * Initializes and coordinates all components.
 */

class LuminaApp {
    constructor() {
        this.currentProject = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('LuminaAI: Initializing...');

        try {
            // Initialize Virtual File System with defaults
            window.vfs.initDefaults();

            // Watch for file changes
            window.vfs.watch((event) => this.onFileChange(event));

            // Initialize Preview Engine
            const iframe = document.getElementById('previewFrame');
            await window.previewEngine.init(iframe);

            // Setup preview callbacks
            window.previewEngine.onLog = (entry) => this.onPreviewLog(entry);
            window.previewEngine.onError = (error) => this.onPreviewError(error);

            // Initialize Code Editor
            const editorContainer = document.getElementById('monacoEditor');
            await window.codeEditor.init(editorContainer);
            window.codeEditor.onSave = (path, content) => this.onEditorSave(path, content);

            // Initialize Chat Handler
            window.chatHandler.init();
            window.chatHandler.onFilesChanged = (changes) => this.onFilesChanged(changes);

            // Initialize Settings Handler
            window.settingsHandler.init();

            // Setup UI event listeners
            this.setupEventListeners();

            // Render file tree
            this.renderFileTree();

            // Initial preview render
            await window.previewEngine.render(window.vfs);

            this.isInitialized = true;
            console.log('LuminaAI: Ready');

        } catch (error) {
            console.error('LuminaAI: Init failed -', error);
        }
    }

    /**
     * Setup UI event listeners
     */
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Refresh preview
        document.getElementById('refreshPreviewBtn').addEventListener('click', () => {
            window.previewEngine.refresh(window.vfs);
        });

        // Fullscreen
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Export
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportProject();
        });

        // New project
        document.getElementById('newProjectBtn').addEventListener('click', () => {
            this.newProject();
        });

        // Add file
        document.getElementById('addFileBtn')?.addEventListener('click', () => {
            this.addNewFile();
        });

        // Logs panel controls
        document.getElementById('hideLogsBtn')?.addEventListener('click', () => {
            document.getElementById('logsPanel').classList.add('hidden');
        });

        document.getElementById('clearLogsBtn')?.addEventListener('click', () => {
            document.getElementById('logsContent').innerHTML = '';
            window.previewEngine.clearLogs();
        });

        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            window.settingsHandler.toggleTheme();
        });
    }

    /**
     * Switch tabs
     */
    switchTab(tabId) {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabId + 'Tab');
        });

        // Open first file if switching to code tab
        if (tabId === 'code' && !window.codeEditor.getCurrentFile()) {
            const files = window.vfs.listFiles();
            if (files.length > 0) {
                // Prefer src/App.tsx if it exists
                const appFile = files.find(f => f.includes('App.'));
                this.openFile(appFile || files[0]);
            }
        }
    }

    /**
     * Render file tree
     */
    renderFileTree() {
        const fileTree = document.getElementById('fileTree');
        const files = window.vfs.listFiles().sort();

        // Group by directory
        const tree = {};
        for (const file of files) {
            const parts = file.split('/');
            if (parts.length === 1) {
                tree[file] = { isFile: true, path: file };
            } else {
                const dir = parts[0];
                if (!tree[dir]) {
                    tree[dir] = { isFile: false, children: {} };
                }
                tree[dir].children[parts.slice(1).join('/')] = { isFile: true, path: file };
            }
        }

        let html = '';

        for (const [name, item] of Object.entries(tree)) {
            if (item.isFile) {
                html += this.renderFileItem(name, name, 0);
            } else {
                html += `
                    <div class="file-item folder">
                        <span class="file-icon folder-icon"></span>
                        <span class="file-name">${name}/</span>
                    </div>
                `;
                for (const [childName, childItem] of Object.entries(item.children)) {
                    html += this.renderFileItem(childName, childItem.path, 1);
                }
            }
        }

        fileTree.innerHTML = html;

        // Add click handlers
        fileTree.querySelectorAll('.file-item:not(.folder)').forEach(item => {
            item.addEventListener('click', () => {
                this.openFile(item.dataset.path);
            });
        });
    }

    /**
     * Render file item
     */
    renderFileItem(name, path, indent) {
        const ext = path.split('.').pop().toLowerCase();
        const iconClasses = {
            'tsx': 'tsx-icon',
            'ts': 'tsx-icon',
            'jsx': 'tsx-icon',
            'js': 'js-icon',
            'html': 'html-icon',
            'css': 'css-icon',
            'json': 'json-icon'
        };
        const iconClass = iconClasses[ext] || 'default-icon';
        const activeClass = window.codeEditor.getCurrentFile() === path ? 'active' : '';
        const indentClass = indent > 0 ? `indent-${indent}` : '';

        return `
            <div class="file-item ${indentClass} ${activeClass}" data-path="${path}">
                <span class="file-icon ${iconClass}"></span>
                <span class="file-name">${name}</span>
            </div>
        `;
    }

    /**
     * Open file in editor
     */
    openFile(path) {
        const content = window.vfs.readFile(path);
        if (content !== null) {
            window.codeEditor.openFile(path, content);
            this.updateEditorTabs(path);
            this.renderFileTree();
        }
    }

    /**
     * Update editor tabs
     */
    updateEditorTabs(activePath) {
        const tabsContainer = document.getElementById('editorTabs');
        const name = activePath.split('/').pop();

        let existingTab = tabsContainer.querySelector(`[data-path="${activePath}"]`);

        if (!existingTab) {
            const tab = document.createElement('div');
            tab.className = 'editor-tab active';
            tab.dataset.path = activePath;
            tab.innerHTML = `
                <span class="tab-dot"></span>
                <span>${name}</span>
                <span class="close-tab" onclick="window.luminaApp.closeTab('${activePath}'); event.stopPropagation();">×</span>
            `;
            tab.addEventListener('click', () => this.openFile(activePath));
            tabsContainer.appendChild(tab);
        }

        tabsContainer.querySelectorAll('.editor-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.path === activePath);
        });
    }

    /**
     * Close editor tab
     */
    closeTab(path) {
        const tab = document.querySelector(`.editor-tab[data-path="${path}"]`);
        if (tab) tab.remove();

        window.codeEditor.closeFile(path);

        // This is safe because window.luminaApp is assigned below
        const remainingTab = document.querySelector('.editor-tab');
        if (remainingTab) {
            this.openFile(remainingTab.dataset.path);
        }
    }

    /**
     * Handle file change from VFS
     */
    onFileChange(event) {
        this.renderFileTree();

        const currentFile = window.codeEditor.getCurrentFile();
        if (currentFile && (event.path === currentFile || event.type === 'load')) {
            const content = window.vfs.readFile(currentFile);
            if (content !== null) {
                window.codeEditor.updateContent(content);
            }
        }
    }

    /**
     * Handle files changed from AI
     */
    async onFilesChanged(changes) {
        this.renderFileTree();

        // Open the first new/modified file in editor
        if (changes && changes.length > 0) {
            const firstChange = changes.find(c => c.action !== 'delete');
            if (firstChange) {
                this.openFile(firstChange.file);
                this.switchTab('code');
            }
        }

        // Rebuild preview
        await window.previewEngine.render(window.vfs);
    }

    /**
     * Handle editor save
     */
    async onEditorSave(path, content) {
        window.vfs.writeFile(path, content);
        await window.previewEngine.render(window.vfs);
    }

    /**
     * Handle preview log
     */
    onPreviewLog(entry) {
        const logsContent = document.getElementById('logsContent');
        const logsPanel = document.getElementById('logsPanel');

        const logEl = document.createElement('div');
        logEl.className = 'log-entry';
        logEl.innerHTML = `
            <span class="log-time">[${entry.time}]</span>
            <span class="log-level ${entry.level}">${entry.level.toUpperCase()}</span>
            <span class="log-message">${entry.message}</span>
        `;
        logsContent.appendChild(logEl);
        logsContent.scrollTop = logsContent.scrollHeight;

        if (entry.level === 'error') {
            logsPanel.classList.remove('hidden');
        }
    }

    /**
     * Handle preview error
     */
    onPreviewError(error) {
        document.getElementById('logsPanel').classList.remove('hidden');
    }

    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        document.body.classList.toggle('fullscreen');
    }

    /**
     * Export project
     */
    exportProject() {
        const files = window.vfs.toObject();
        const projectData = {
            name: 'LuminaAI Project',
            exportedAt: new Date().toISOString(),
            files: files
        };

        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'lumina-project.json';
        a.click();

        URL.revokeObjectURL(url);
    }

    /**
     * New project
     */
    newProject() {
        if (confirm('Start a new project? This will clear the current project.')) {
            window.vfs.initDefaults();
            window.chatHandler.clearHistory();
            window.previewEngine.render(window.vfs);
            this.renderFileTree();

            // Clear editor tabs
            document.getElementById('editorTabs').innerHTML = '';
        }
    }

    /**
     * Add new file
     */
    addNewFile() {
        const filename = prompt('Enter file path (e.g., src/components/Button.tsx):');
        if (filename) {
            window.vfs.writeFile(filename, '// New file\n');
            this.openFile(filename);
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.luminaApp = new LuminaApp();
    window.luminaApp.init();
});
