/**
 * LuminaAI Builder - XML Parser
 * 
 * Parses AI responses in XML format and extracts file changes.
 */

class XMLParser {
    /**
     * Parse an AI response containing XML
     */
    parse(response) {
        const result = {
            thinking: null,
            message: null,
            changes: [],
            raw: response
        };

        try {
            // Extract <response> block
            const responseMatch = response.match(/<response>([\s\S]*?)<\/response>/i);
            if (!responseMatch) {
                // Try to extract just changes without response wrapper
                const changesOnly = this.extractChanges(response);
                if (changesOnly.length > 0) {
                    result.changes = changesOnly;
                    return result;
                }

                // No XML found, treat entire response as message
                result.message = response;
                return result;
            }

            const content = responseMatch[1];

            // Extract thinking
            const thinkingMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/i);
            if (thinkingMatch) {
                result.thinking = thinkingMatch[1].trim();
            }

            // Extract message
            const messageMatch = content.match(/<message>([\s\S]*?)<\/message>/i);
            if (messageMatch) {
                result.message = messageMatch[1].trim();
            }

            // Extract changes
            result.changes = this.extractChanges(content);

        } catch (error) {
            console.error('XML parse error:', error);
            result.message = response;
        }

        return result;
    }

    /**
     * Extract file changes from XML content
     */
    extractChanges(content) {
        const changes = [];

        // Match all <change> blocks
        const changeRegex = /<change>([\s\S]*?)<\/change>/gi;
        let match;

        while ((match = changeRegex.exec(content)) !== null) {
            const changeContent = match[1];

            // Extract file path
            const fileMatch = changeContent.match(/<file>([\s\S]*?)<\/file>/i);
            if (!fileMatch) continue;

            const change = {
                file: fileMatch[1].trim(),
                action: 'create',
                description: '',
                content: null,
                patches: []
            };

            // Extract action
            const actionMatch = changeContent.match(/<action>([\s\S]*?)<\/action>/i);
            if (actionMatch) {
                change.action = actionMatch[1].trim().toLowerCase();
            }

            // Extract description
            const descMatch = changeContent.match(/<description>([\s\S]*?)<\/description>/i);
            if (descMatch) {
                change.description = descMatch[1].trim();
            }

            // Extract content (handle CDATA)
            const contentMatch = changeContent.match(/<content>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/content>/i) ||
                changeContent.match(/<content>([\s\S]*?)<\/content>/i);
            if (contentMatch) {
                change.content = contentMatch[1];
            }

            // Extract patches for patch action
            if (change.action === 'patch') {
                change.patches = this.extractPatches(changeContent);
            }

            changes.push(change);
        }

        return changes;
    }

    /**
     * Extract patches for partial file updates
     */
    extractPatches(content) {
        const patches = [];

        const patchRegex = /<patch>([\s\S]*?)<\/patch>/gi;
        let match;

        while ((match = patchRegex.exec(content)) !== null) {
            const patchContent = match[1];

            // Extract find pattern (handle CDATA)
            const findMatch = patchContent.match(/<find>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/find>/i) ||
                patchContent.match(/<find>([\s\S]*?)<\/find>/i);

            // Extract replace content (handle CDATA)
            const replaceMatch = patchContent.match(/<replace>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/replace>/i) ||
                patchContent.match(/<replace>([\s\S]*?)<\/replace>/i);

            if (findMatch && replaceMatch) {
                patches.push({
                    find: findMatch[1],
                    replace: replaceMatch[1]
                });
            }
        }

        return patches;
    }

    /**
     * Apply changes to the Virtual File System
     */
    applyChanges(changes, vfs) {
        const applied = [];

        for (const change of changes) {
            try {
                switch (change.action) {
                    case 'create':
                    case 'update':
                        if (change.content !== null) {
                            vfs.writeFile(change.file, change.content);
                            applied.push({
                                file: change.file,
                                action: vfs.exists(change.file) ? 'updated' : 'created',
                                description: change.description
                            });
                        }
                        break;

                    case 'patch':
                        this.applyPatches(change, vfs);
                        applied.push({
                            file: change.file,
                            action: 'patched',
                            description: change.description
                        });
                        break;

                    case 'delete':
                        vfs.deleteFile(change.file);
                        applied.push({
                            file: change.file,
                            action: 'deleted',
                            description: change.description
                        });
                        break;
                }
            } catch (error) {
                console.error(`Failed to apply change to ${change.file}:`, error);
                applied.push({
                    file: change.file,
                    action: 'error',
                    description: error.message
                });
            }
        }

        return applied;
    }

    /**
     * Apply patches to an existing file
     */
    applyPatches(change, vfs) {
        let content = vfs.readFile(change.file);

        if (content === null) {
            throw new Error(`File not found: ${change.file}`);
        }

        for (const patch of change.patches) {
            if (content.includes(patch.find)) {
                content = content.replace(patch.find, patch.replace);
            } else {
                console.warn(`Patch pattern not found in ${change.file}:`, patch.find.substring(0, 50));
            }
        }

        vfs.writeFile(change.file, content);
    }

    /**
     * Detect NPM dependencies from import statements
     */
    detectDependencies(content) {
        const deps = new Set();
        // Updated regex to handle multiline imports
        const importRegex = /import\s+(?:[\s\S]*?from\s+)?['"]([^'"./][^'"]*)['"]/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
            const pkg = match[1];
            // Extract package name (handle scoped packages)
            const pkgName = pkg.startsWith('@')
                ? pkg.split('/').slice(0, 2).join('/')
                : pkg.split('/')[0];
            deps.add(pkgName);
        }

        return Array.from(deps);
    }
}

// Global instance
window.xmlParser = new XMLParser();
