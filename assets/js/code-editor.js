/**
 * LuminaAI Builder - Code Editor
 * 
 * Monaco Editor wrapper for code editing with syntax highlighting.
 */

class CodeEditor {
    constructor() {
        this.editor = null;
        this.models = new Map();
        this.currentFile = null;
        this.isReady = false;
        this.onSave = null;
    }

    /**
     * Initialize Monaco Editor
     */
    async init(container) {
        return new Promise((resolve, reject) => {
            require.config({
                paths: {
                    'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs'
                }
            });

            require(['vs/editor/editor.main'], () => {
                // Add React type definitions to silence errors
                monaco.languages.typescript.typescriptDefaults.addExtraLib(`
                    declare module 'react' {
                        export = React;
                    }
                    declare namespace React {
                        function useState<T>(initialState: T): [T, (newState: T) => void];
                        function useEffect(effect: () => void | (() => void), deps?: any[]): void;
                        function useRef<T>(initialValue: T): { current: T };
                        const createElement: any;
                        const Fragment: any;
                    }
                    declare module 'react-dom/client' {
                         export function createRoot(container: any): any;
                    }
                `, 'file:///node_modules/@types/react/index.d.ts');

                // Define custom dark theme
                monaco.editor.defineTheme('luminaTheme', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                        { token: 'comment', foreground: '6A9955' },
                        { token: 'keyword', foreground: 'C586C0' },
                        { token: 'string', foreground: 'CE9178' },
                        { token: 'number', foreground: 'B5CEA8' },
                        { token: 'type', foreground: '4EC9B0' },
                    ],
                    colors: {
                        'editor.background': '#0d1117',
                        'editor.foreground': '#e6edf3',
                        'editorCursor.foreground': '#7c3aed',
                        'editor.lineHighlightBackground': '#161b22',
                        'editorLineNumber.foreground': '#6e7681',
                        'editor.selectionBackground': '#388bfd40',
                        'editor.inactiveSelectionBackground': '#388bfd20',
                    }
                });

                // Create editor instance
                this.editor = monaco.editor.create(container, {
                    value: '',
                    language: 'typescript',
                    theme: 'luminaTheme',
                    automaticLayout: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                    lineNumbers: 'on',
                    renderWhitespace: 'selection',
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    tabSize: 2,
                    insertSpaces: true,
                    folding: true,
                    bracketPairColorization: { enabled: true }
                });

                // Handle save shortcut
                this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                    this.save();
                });

                this.isReady = true;
                resolve();
            });
        });
    }

    /**
     * Open a file in the editor
     */
    openFile(path, content) {
        if (!this.isReady) return;

        this.currentFile = path;
        const language = this.getLanguage(path);

        // Check if we have a cached model for this file
        if (this.models.has(path)) {
            const model = this.models.get(path);
            this.editor.setModel(model);
        } else {
            // Create a new model
            const model = monaco.editor.createModel(content, language);
            this.models.set(path, model);
            this.editor.setModel(model);
        }

        // Update model content if it changed
        const model = this.editor.getModel();
        if (model.getValue() !== content) {
            model.setValue(content);
        }
    }

    /**
     * Get current file content
     */
    getContent() {
        if (!this.editor) return '';
        return this.editor.getValue();
    }

    /**
     * Get current file path
     */
    getCurrentFile() {
        return this.currentFile;
    }

    /**
     * Save current file
     */
    save() {
        if (this.currentFile && this.onSave) {
            const content = this.getContent();
            this.onSave(this.currentFile, content);
        }
    }

    /**
     * Update file content without changing cursor
     */
    updateContent(content) {
        if (!this.editor) return;

        const model = this.editor.getModel();
        if (model) {
            const position = this.editor.getPosition();
            model.setValue(content);
            if (position) {
                this.editor.setPosition(position);
            }
        }
    }

    /**
     * Close a file and remove its model
     */
    closeFile(path) {
        if (this.models.has(path)) {
            const model = this.models.get(path);
            model.dispose();
            this.models.delete(path);
        }

        if (this.currentFile === path) {
            this.currentFile = null;
            this.editor.setModel(null);
        }
    }

    /**
     * Get Monaco language from file extension
     */
    getLanguage(path) {
        const ext = path.split('.').pop().toLowerCase();
        const languages = {
            'tsx': 'typescript',
            'ts': 'typescript',
            'jsx': 'javascript',
            'js': 'javascript',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'md': 'markdown',
            'xml': 'xml'
        };
        return languages[ext] || 'plaintext';
    }

    /**
     * Set editor theme
     */
    setTheme(theme) {
        if (this.editor) {
            monaco.editor.setTheme(theme);
        }
    }

    /**
     * Format document
     */
    format() {
        if (this.editor) {
            this.editor.getAction('editor.action.formatDocument').run();
        }
    }

    /**
     * Dispose of the editor
     */
    dispose() {
        if (this.editor) {
            this.editor.dispose();
        }
        for (const model of this.models.values()) {
            model.dispose();
        }
        this.models.clear();
    }
}

// Global instance
window.codeEditor = new CodeEditor();
