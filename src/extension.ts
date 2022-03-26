import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerTextEditorCommand('unwrap.toUnwrap', toUnwrap);

  context.subscriptions.push(disposable);
}

const wrapPairs = [
  ['\'', '\''],
  ['"', '"'],
  ['{', '}'],
  ['[', ']'],
  ['(', ')']
];

function toUnwrap(editor: vscode.TextEditor) {
  const replacedSelections: vscode.Selection[] = [];

  editor.edit(builder => {
    for(const selection of editor.selections) {
      if(selection.start.character === 0) { continue; }

      const range = new vscode.Range( // create range includes chars surround the selection
        selection.start.translate({ characterDelta: -1 }), 
        selection.end.translate({ characterDelta: 1 })
      );
      const text = editor.document.getText(range) || '';
  
      if(text.length < 3) { return; }
  
      const firstChar = text[0];
      const lastChar = text[text.length - 1];
  
      if(wrapPairs.some(pair => firstChar === pair[0] && lastChar === pair[1])) {
        builder.replace(range, text.slice(1, -1));
        replacedSelections.push(
          new vscode.Selection(
            range.start,
            selection.end.translate({ characterDelta: -1 })
          )
        );
      }
    }
  }).then(() => {
    editor.selections = replacedSelections;
  });
}

export function deactivate() {}
