/**
 * LuminaAI Builder - Chat Handler
 * 
 * Handles chat with real-time code updates to the editor.
 */

class ChatHandler {
    constructor() {
        this.messagesContainer = null;
        this.inputElement = null;
        this.sendButton = null;
        this.history = [];
        this.isStreaming = false;
        this.onFilesChanged = null;
    }

    /**
     * Initialize
     */
    init() {
        this.messagesContainer = document.getElementById('chatMessages');
        this.inputElement = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendBtn');

        this.sendButton.addEventListener('click', () => this.sendMessage());

        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.inputElement.addEventListener('input', () => {
            this.inputElement.style.height = 'auto';
            this.inputElement.style.height = Math.min(this.inputElement.scrollHeight, 120) + 'px';
        });

        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const prompt = chip.dataset.prompt;
                if (prompt) {
                    this.inputElement.value = prompt;
                    this.sendMessage();
                }
            });
        });
    }

    /**
     * Send message
     */
    async sendMessage() {
        const message = this.inputElement.value.trim();
        if (!message || this.isStreaming) return;

        this.inputElement.value = '';
        this.inputElement.style.height = 'auto';

        this.addMessage('user', message);
        this.history.push({ role: 'user', content: message });

        const suggestions = document.getElementById('chatSuggestions');
        if (suggestions) suggestions.style.display = 'none';

        await this.getAIResponse(message);
    }

    /**
     * Get AI response with streaming
     */
    async getAIResponse(message) {
        this.isStreaming = true;
        this.sendButton.disabled = true;

        const thinkingEl = this.addThinkingIndicator();
        let fullResponse = '';
        let currentMessageEl = null;

        try {
            const response = await fetch('/api/chat.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    history: this.history.slice(-10)
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            thinkingEl.remove();
            currentMessageEl = this.addMessage('assistant', '', true);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const events = buffer.split('\n\n');
                buffer = events.pop() || '';

                for (const event of events) {
                    if (!event.trim()) continue;

                    const lines = event.split('\n');
                    let eventType = '';
                    let eventData = '';

                    for (const line of lines) {
                        if (line.startsWith('event: ')) eventType = line.slice(7);
                        else if (line.startsWith('data: ')) eventData = line.slice(6);
                    }

                    if (eventData) {
                        try {
                            const data = JSON.parse(eventData);

                            if (eventType === 'content' && data.text) {
                                fullResponse += data.text;
                                // Show generating status
                                this.updateStreamingContent(currentMessageEl, 'Generating code...');

                                // Try to parse and update files in real-time
                                this.tryRealTimeUpdate(fullResponse);
                            }

                            if (eventType === 'complete' || eventType === 'done') {
                                this.processAIResponse(fullResponse, currentMessageEl);
                            }

                            if (eventType === 'error') {
                                this.addMessage('error', data.error || 'An error occurred');
                            }
                        } catch (e) {
                            console.error('Parse error:', e);
                        }
                    }
                }
            }

            // Final process if no complete event
            if (fullResponse && currentMessageEl) {
                this.processAIResponse(fullResponse, currentMessageEl);
            }

        } catch (error) {
            thinkingEl?.remove();
            this.addMessage('error', 'Failed to connect: ' + error.message);
        } finally {
            this.isStreaming = false;
            this.sendButton.disabled = false;

            if (fullResponse) {
                this.history.push({ role: 'assistant', content: fullResponse });
            }
        }
    }

    /**
     * Try real-time file updates during streaming
     */
    tryRealTimeUpdate(response) {
        // Check if we have complete file blocks
        const changeRegex = /<change>[\s\S]*?<file>(.*?)<\/file>[\s\S]*?<action>(.*?)<\/action>[\s\S]*?<content><!\[CDATA\[([\s\S]*?)\]\]><\/content>[\s\S]*?<\/change>/g;

        let match;
        while ((match = changeRegex.exec(response)) !== null) {
            const [, file, action, content] = match;
            if (file && content && action !== 'delete') {
                // Update VFS immediately
                window.vfs.writeFile(file.trim(), content);
            }
        }
    }

    /**
     * Update streaming content
     */
    updateStreamingContent(messageEl, status) {
        const contentEl = messageEl.querySelector('.message-content');
        if (contentEl) {
            contentEl.innerHTML = `<span class="streaming-status">${status}</span><span class="streaming-cursor"></span>`;
        }
    }

    /**
     * Process complete AI response
     */
    processAIResponse(response, messageEl) {
        const parsed = window.xmlParser.parse(response);

        if (messageEl) {
            const contentEl = messageEl.querySelector('.message-content');
            if (contentEl) {
                contentEl.classList.remove('streaming-content');

                let html = '';

                if (parsed.message) {
                    html = `<p>${this.escapeHtml(parsed.message)}</p>`;
                }

                if (parsed.changes && parsed.changes.length > 0) {
                    const fileList = parsed.changes.map(change => {
                        const actionClass = change.action === 'delete' ? 'deleted' :
                            change.action === 'update' || change.action === 'patch' ? 'updated' : 'success';
                        const actionText = change.action === 'delete' ? 'deleted' :
                            change.action === 'update' ? 'updated' :
                                change.action === 'patch' ? 'patched' : 'created';
                        const icon = change.action === 'delete' ? '✕' : '✓';

                        return `
                            <div class="file-indicator ${actionClass}" data-file="${change.file}">
                                <span class="icon">${icon}</span>
                                <span class="filename">${change.file}</span>
                                <span class="action">${actionText}</span>
                            </div>
                        `;
                    }).join('');

                    html += fileList;

                    // Apply all changes to VFS
                    window.xmlParser.applyChanges(parsed.changes, window.vfs);

                    // Notify app of file changes
                    if (this.onFilesChanged) {
                        this.onFilesChanged(parsed.changes);
                    }
                }

                if (!html) {
                    html = '<p>Response processed</p>';
                }

                contentEl.innerHTML = html;

                // Make file indicators clickable
                contentEl.querySelectorAll('.file-indicator').forEach(indicator => {
                    indicator.addEventListener('click', () => {
                        const file = indicator.dataset.file;
                        if (file && window.luminaApp) {
                            window.luminaApp.openFile(file);
                            window.luminaApp.switchTab('code');
                        }
                    });
                });
            }
        }
    }

    /**
     * Add message
     */
    addMessage(role, content, isStreaming = false) {
        const el = document.createElement('div');
        el.className = `chat-message ${role}`;

        const roleLabel = role === 'user' ? 'You' :
            role === 'assistant' ? 'Lumina' :
                role === 'error' ? 'Error' : 'System';

        el.innerHTML = `
            <div class="message-header">
                <span class="role">${roleLabel}</span>
                <span class="timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="message-content ${isStreaming ? 'streaming-content' : ''}">
                ${content}${isStreaming ? '<span class="streaming-cursor"></span>' : ''}
            </div>
        `;

        this.messagesContainer.appendChild(el);
        this.scrollToBottom();
        return el;
    }

    /**
     * Add thinking indicator
     */
    addThinkingIndicator() {
        const el = document.createElement('div');
        el.className = 'chat-message assistant';
        el.innerHTML = `
            <div class="message-header">
                <span class="role">Lumina</span>
            </div>
            <div class="thinking-indicator">
                <div class="thinking-dots"><span></span><span></span><span></span></div>
                <span>Thinking...</span>
            </div>
        `;
        this.messagesContainer.appendChild(el);
        this.scrollToBottom();
        return el;
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearHistory() {
        this.history = [];
        this.messagesContainer.innerHTML = `
            <div class="chat-message system">
                <div class="message-content">
                    <p>Chat cleared. Ready for a new conversation.</p>
                </div>
            </div>
        `;
    }
}

window.chatHandler = new ChatHandler();
