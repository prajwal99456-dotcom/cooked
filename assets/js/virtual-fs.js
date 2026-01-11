/**
 * LuminaAI Builder - Virtual File System
 * 
 * Sandpack-compatible file structure
 * Note: Sandpack templates include their own index.tsx, so we only need App.tsx
 */

class VirtualFileSystem {
    constructor() {
        this.files = new Map();
        this.watchers = [];
    }

    initDefaults() {
        this.files.clear();

        // App.tsx - Main component (Sandpack renders this automatically)
        this.files.set('App.tsx', `import React from 'react';

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
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                Your app will appear here instantly.
            </p>
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '2rem',
                padding: '14px 24px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: 'rgba(255,255,255,0.7)'
            }}>
                <span style={{
                    width: '10px',
                    height: '10px',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                    borderRadius: '50%',
                    animation: 'pulse 2s ease-in-out infinite'
                }}></span>
                Ready to create
            </div>
            <style>{\`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.1); }
                }
            \`}</style>
        </div>
    );
}

export default App;`);

        // styles.css
        this.files.set('styles.css', `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

*, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    width: 100%;
    height: 100%;
}

body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: #0a0a0a;
    min-height: 100vh;
    color: #fff;
    -webkit-font-smoothing: antialiased;
}

#root {
    min-height: 100vh;
}`);

        this.notify({ type: 'load' });
    }

    writeFile(path, content) {
        const normalized = this.normalizePath(path);
        const isNew = !this.files.has(normalized);
        this.files.set(normalized, content);
        this.notify({ type: isNew ? 'create' : 'update', path: normalized });
        return true;
    }

    readFile(path) {
        return this.files.get(this.normalizePath(path)) || null;
    }

    deleteFile(path) {
        const normalized = this.normalizePath(path);
        if (this.files.has(normalized)) {
            this.files.delete(normalized);
            this.notify({ type: 'delete', path: normalized });
            return true;
        }
        return false;
    }

    exists(path) {
        return this.files.has(this.normalizePath(path));
    }

    listFiles() {
        return Array.from(this.files.keys());
    }

    toObject() {
        const obj = {};
        this.files.forEach((content, path) => obj[path] = content);
        return obj;
    }

    fromObject(obj) {
        this.files.clear();
        for (const [path, content] of Object.entries(obj)) {
            this.files.set(this.normalizePath(path), content);
        }
        this.notify({ type: 'load' });
    }

    watch(callback) {
        this.watchers.push(callback);
        return () => { this.watchers = this.watchers.filter(w => w !== callback); };
    }

    notify(event) {
        this.watchers.forEach(cb => { try { cb(event); } catch (e) { } });
    }

    normalizePath(path) {
        // Remove leading ./ or /
        let normalized = path.replace(/^\.?\//, '');
        // Remove src/ prefix since Sandpack uses root-level files
        normalized = normalized.replace(/^src\//, '');
        return normalized;
    }
}

window.vfs = new VirtualFileSystem();
