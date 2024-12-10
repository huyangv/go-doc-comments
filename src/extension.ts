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

        // Generate comment based on the next line
        if (nextLineText.startsWith('package ')) {
            // Package comment
            const packageName = nextLineText.split(' ')[1];
            comment = `// Package ${packageName}\n`;
        } else if (nextLineText.startsWith('func ') || (nextLineText.includes('(') && nextLineText.includes(')') && !nextLineText.startsWith('type'))) {
            // 处理函数声明
            interface ParamInfo {
                name: string;
                type: string;
            }

            // 处理函数声明
            const parseFuncDecl = (line: string): { funName: string; argList: string[]; returnList: string[] } => {
                // 1. 去掉 func 关键字
                let rest = line.replace(/^func\s+/, '');

                // 2. 如果有接收器，去掉接收器部分
                const receiverMatch = rest.match(/^\([^)]+\)\s*/);
                if (receiverMatch) {
                    rest = rest.substring(receiverMatch[0].length);
                }

                // 3. 提取方法名和参数列表
                const methodMatch = rest.match(/^(\w+)\s*\((.*?)\)/);
                if (!methodMatch) {
                    return { funName: '', argList: [], returnList: [] };
                }
                const [fullMatch, name, params] = methodMatch;

                // 4. 提取返回值部分 - 从方法声明的右括号后开始
                let afterMethodMatch = rest.substring(fullMatch.length).trim();
                afterMethodMatch = afterMethodMatch.substring(0, afterMethodMatch.length - 1)
                const beforeBody = afterMethodMatch.trim();

                // 5. 处理返回值
                let returns = '';
                if (beforeBody.startsWith('(')) {
                    // 多返回值
                    returns = beforeBody.slice(1, beforeBody.lastIndexOf(')'));
                } else {
                    // 单返回值
                    returns = beforeBody;
                }

                return {
                    funName: name,
                    argList: processTypeList(params),
                    returnList: processTypeList(returns)
                };
            };

            // 处理类型列表（参数或返回值）
            const processTypeList = (input: string): string[] => {
                if (!input.trim()) return [];

                // 先处理整个输入字符串
                const fullStr = input.trim();

                // 先尝试解析完整的类型声明
                const items: string[] = [];
                let current = '';
                let depth = 0;

                // 按逗号分割，但要考虑括号嵌套
                for (let i = 0; i < input.length; i++) {
                    const char = input[i];
                    if (char === '(' || char === '[' || char === '{') {
                        depth++;
                        current += char;
                    } else if (char === ')' || char === ']' || char === '}') {
                        depth--;
                        current += char;
                    } else if (char === ',' && depth === 0) {
                        if (current.trim()) {
                            items.push(current.trim());
                        }
                        current = '';
                    } else {
                        current += char;
                    }
                }
                if (current.trim()) {
                    items.push(current.trim());
                }

                // 如果只有一项，检查是否是多个名字共用一个类型
                if (items.length === 1 && items[0].includes(',')) {
                    const parts = items[0].split(/\s+/);
                    if (parts.length >= 2) {
                        // 最后一部分是类型
                        const type = parts.slice(-1)[0];
                        // 前面的部分是名字列表
                        const namesStr = parts.slice(0, -1).join(' ');
                        // 分割名字并添加类型
                        return namesStr.split(',')
                            .map(name => name.trim())
                            .filter(name => name.length > 0)
                            .map(name => `${name} ${type}`);
                    }
                }

                // 处理每个项
                const result: string[] = [];
                let lastType = '';

                for (let i = items.length - 1; i >= 0; i--) {
                    const item = items[i].trim();

                    // 如果是复杂类型，直接添加
                    if (isComplexType(item)) {
                        result.push(item);
                        continue;
                    }

                    // 检查是否包含类型声明
                    if (item.includes(' ')) {
                        result.push(item);
                        // 更新最后的类型
                        const parts = item.split(/\s+/);
                        lastType = parts.slice(1).join(' ');
                    } else {
                        // 没有类型声明，使用最后的类型
                        if (lastType) {
                            result.push(`${item} ${lastType}`);
                        } else {
                            // 向后查找类型
                            let foundType = '';
                            for (let j = i + 1; j < items.length; j++) {
                                if (items[j].includes(' ')) {
                                    const parts = items[j].split(/\s+/);
                                    foundType = parts.slice(1).join(' ');
                                    break;
                                }
                            }
                            if (foundType) {
                                result.push(`${item} ${foundType}`);
                            } else {
                                result.push(item);
                            }
                        }
                    }
                }

                return result.reverse();
            };

            // 检查是否是复杂类型
            const isComplexType = (str: string): boolean => {
                const trimmed = str.trim();
                // 检查是否是函数类型
                if (trimmed.startsWith('func')) {
                    return true;
                }
                // 检查是否是其他复杂类型
                return trimmed.startsWith('chan') ||
                    trimmed.startsWith('map[') ||
                    trimmed.startsWith('[]') ||
                    trimmed.includes('interface{');
            };

            const funcInfo = parseFuncDecl(nextLineText);
            if (funcInfo) {
                // 生成注释
                comment = `// ${funcInfo.funName}\n`;

                // 添加参数
                if (funcInfo.argList.length > 0) {
                    comment += `//\n// Parameters:\n`;
                    funcInfo.argList.forEach(param => {
                        comment += `//   - ${param}\n`;
                    });
                }

                // 添加返回值
                if (funcInfo.returnList.length > 0) {
                    comment += `//\n// Returns:\n`;
                    funcInfo.returnList.forEach(ret => {
                        comment += `//   - ${ret}\n`;
                    });
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

export function deactivate() { }
