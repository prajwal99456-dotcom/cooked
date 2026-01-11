/**
 * LuminaAI Builder - Preview Engine (Sandpack)
 * 
 * Clean implementation - loads sandpack-frame.html in iframe
 * and communicates via postMessage.
 */

class PreviewEngine {
    constructor() {
        this.iframe = null;
        this.isReady = false;
        this.pendingFiles = null;
        this.logs = [];
        this.onLog = null;
        this.onError = null;
    }

    /**
     * Initialize the preview engine
     */
    async init(iframeElement) {
        console.log('[PreviewEngine] Initializing with Sandpack...');

        this.iframe = iframeElement;

        // Listen for messages from Sandpack frame
        window.addEventListener('message', (event) => {
            this.handleMessage(event);
        });

        // Load the Sandpack frame
        this.iframe.src = '/sandpack-frame.html';

        this.log('info', 'Loading Sandpack preview...');
    }

    /**
     * Handle messages from Sandpack frame
     */
    handleMessage(event) {
        if (!event.data || !event.data.type) return;

        switch (event.data.type) {
            case 'SANDPACK_READY':
                console.log('[PreviewEngine] Sandpack ready');
                this.isReady = true;
                this.log('info', 'Sandpack preview ready');

                // Send any pending files
                if (this.pendingFiles) {
                    this.sendFiles(this.pendingFiles);
                    this.pendingFiles = null;
                }
                break;

            case 'FILES_UPDATED':
                console.log('[PreviewEngine] Files updated');
                this.log('info', 'Preview updated');
                break;

            case 'SANDPACK_ERROR':
                console.error('[PreviewEngine] Sandpack error:', event.data.error);
                this.log('error', event.data.error);
                if (this.onError) this.onError(event.data.error);
                break;
        }
    }

    /**
     * Send files to Sandpack frame
     */
    sendFiles(files) {
        if (!this.iframe || !this.iframe.contentWindow) {
            console.error('[PreviewEngine] Iframe not available');
            return;
        }

        this.iframe.contentWindow.postMessage({
            type: 'UPDATE_FILES',
            files: files
        }, '*');
    }

    /**
     * Render the preview with current VFS files
     */
    async render(vfs) {
        const files = vfs.toObject();

        console.log('[PreviewEngine] Rendering files:', Object.keys(files));

        if (this.isReady) {
            this.sendFiles(files);
        } else {
            // Queue files to be sent when ready
            this.pendingFiles = files;
            console.log('[PreviewEngine] Sandpack not ready, queuing files...');
        }
    }

    /**
     * Refresh the preview
     */
    async refresh(vfs) {
        if (vfs) {
            await this.render(vfs);
        } else {
            // Reload the frame
            this.isReady = false;
            this.iframe.src = '/sandpack-frame.html';
        }
    }

    /**
     * Log a message
     */
    log(level, message) {
        const entry = {
            time: new Date().toLocaleTimeString(),
            level,
            message
        };
        this.logs.push(entry);
        if (this.onLog) this.onLog(entry);
    }

    /**
     * Clear logs
     */
    clearLogs() {
        this.logs = [];
    }
}

// Create global instance
window.previewEngine = new PreviewEngine();
