import * as vscode from 'vscode';
import { parseArg, splitFuncLine, FunctionArg, Comment, CommentType } from './ut';

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

        const cmt: Comment = {};
        let tmpValue

        if (nextLineText.startsWith('package ')) {
            cmt.type = CommentType.Package;
            const packageName = nextLineText.split(' ')[1];
            cmt.directOut = `// Package ${packageName}\n`;
        } else if (tmpValue = nextLineText.match(/type\s+(\w+)/), tmpValue) {
            if (nextLineText.includes("interface")) {
                cmt.type = CommentType.Interface;
            }
            else if (nextLineText.includes("struct")) {
                cmt.type = CommentType.Struct;
            }
            const typeName = tmpValue[1];
            cmt.directOut = `// ${typeName}\n`;
        } else if (nextLineText.startsWith('func ') || (nextLineText.includes('(') && nextLineText.includes(')'))) {
            cmt.type = CommentType.Function;
            let line = nextLineText;
            // 1 先将方法分段
            const { funcName, generics, arg, returns } = splitFuncLine(line)
            cmt.name = funcName
            cmt.args = parseArg(arg, false)
            cmt.returns = parseArg(returns, true)
        }

        switch (cmt.type) {
            case CommentType.Package:
            case CommentType.Interface:
            case CommentType.Struct:
                comment = cmt.directOut || ""
                break
            case CommentType.Function:
                comment += `// ${cmt.name}\n`
                comment += `// \n`
                if (cmt.args && cmt.args.length) {
                    comment += `// Parameters:\n`
                    for (let i = 0; i < cmt.args.length; i++) {
                        const arg = cmt.args[i]
                        arg.name && (arg.name = " " + arg.name)
                        arg.type && (arg.type = " " + arg.type)
                        comment += `//   -${arg.name || ""}${arg.type || ""}\n`
                    }
                }
                comment += `// \n`
                if (cmt.returns && cmt.returns.length) {
                    comment += `// Returns:\n`
                    for (const ret of cmt.returns) {
                        ret.name && (ret.name = " " + ret.name)
                        ret.type && (ret.type = " " + ret.type)
                        comment += `//   -${ret.name || ""}${ret.type || ""}\n`
                    }
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





