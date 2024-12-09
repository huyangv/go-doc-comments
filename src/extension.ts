import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('go-doc-comments.generateComment', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        if (document.languageId !== 'go') {
            vscode.window.showWarningMessage('This command only works with Go files');
            return;
        }

        const position = editor.selection.active;
        const line = document.lineAt(position.line);
        const nextLine = position.line < document.lineCount - 1 
            ? document.lineAt(position.line + 1) 
            : null;

        if (!nextLine) {
            return;
        }

        // Always insert at the next line position
        const insertPosition = new vscode.Position(position.line + 1, 0);
        const nextLineText = nextLine.text.trim();
        let comment = '';

        // Function signature regex that matches both normal functions and interface methods
        const funcRegex = /(?:func\s+)?(?:\([\w\s*]+\s+[\w*]+\))?\s*(\w+)\s*\((.*?)\)(?:\s*\((.*?)\))?\s*{?/;

        // Generate comment based on the next line
        if (nextLineText.startsWith('package ')) {
            // Package comment
            const packageName = nextLineText.split(' ')[1];
            comment = `// Package ${packageName}\n`;
        } else if (nextLineText.startsWith('func ') || (nextLineText.includes('(') && nextLineText.includes(')') && !nextLineText.startsWith('type'))) {
            // Function or method comment (including interface methods)
            const match = nextLineText.match(funcRegex);
            
            if (match) {
                const funcName = match[1];
                const params = match[2] || '';
                const returns = match[3] || '';

                // Build the comment
                comment = `// ${funcName}\n`;

                // Add parameters
                if (params.trim()) {
                    const paramList = params.split(',').map(p => p.trim());
                    if (paramList.length > 0) {
                        comment += `//\n// Parameters:\n`;
                        paramList.forEach(param => {
                            // Handle variadic parameters
                            if (param.includes('...')) {
                                const [paramName, ...rest] = param.split(/\s+/);
                                comment += `//   - ${paramName} ${rest.join(' ')}\n`;
                                return;
                            }
                            
                            // Handle multiple parameters with same type
                            if (!param.includes(' ')) {
                                // This is a parameter without type (part of a multi-param declaration)
                                // Look ahead to find the type from the next parameter
                                const nextParam = paramList.find(p => p.includes(' '));
                                if (nextParam) {
                                    const type = nextParam.split(/\s+/).slice(1).join(' ');
                                    comment += `//   - ${param} ${type}\n`;
                                    return;
                                }
                            }
                            
                            // Normal parameter
                            const [paramName, ...paramType] = param.split(/\s+/);
                            comment += `//   - ${paramName} ${paramType.join(' ')}\n`;
                        });
                    }
                }

                // Add returns
                if (returns.trim()) {
                    const returnList = returns.split(',').map(r => r.trim());
                    comment += `//\n// Returns:\n`;
                    returnList.forEach(ret => {
                        // If return value has no name, generate r1, r2, etc.
                        if (!ret.includes(' ')) {
                            comment += `//   - ${ret}\n`;
                        } else {
                            comment += `//   - ${ret}\n`;
                        }
                    });
                } else {
                    // Check if there's a single return type in the function signature
                    // Updated regex to handle both function and interface method return types
                    const singleReturnMatch = nextLineText.match(/\)\s+(\w+)(?:\s*{|\s*$)/);
                    if (singleReturnMatch) {
                        comment += `//\n// Returns:\n//   - ${singleReturnMatch[1]}\n`;
                    }
                }
            }
        } else if (nextLineText.startsWith('type ')) {
            // Type comment
            const typeMatch = nextLineText.match(/type\s+(\w+)/);
            if (typeMatch) {
                const typeName = typeMatch[1];
                comment = `// ${typeName}\n`;
            }
        }

        if (comment) {
            await editor.edit(editBuilder => {
                editBuilder.insert(insertPosition, comment);
            });
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
