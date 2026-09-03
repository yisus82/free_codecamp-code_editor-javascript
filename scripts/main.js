const makeEditor = (id, mode) => {
  const editor = ace.edit(id, {
    theme: 'ace/theme/dracula',
    mode,
    tabSize: 2,
    useSoftTabs: true,
    showPrintMargin: false,
    wrap: true,
  });
  editor.session.setUseWrapMode(true);
  editor.commands.addCommand({
    name: 'run',
    bindKey: {
      win: 'Ctrl-Enter',
      mac: 'Command-Enter',
    },
    exec() {
      runWeb(false);
    }
  });
  editor.commands.addCommand({
    name: 'save',
    bindKey: {
      win: 'Ctrl-S',
      mac: 'Command-S',
    },
    exec() {
      saveProject();
    }
  });
  editor.commands.addCommand({
    name: 'unfocus',
    bindKey: {
      win: 'esc',
      mac: 'esc',
    },
    exec() {
      focusActiveTab();
    }
  });

  return editor;
};

const htmlEditor = makeEditor('htmlEditor', 'ace/mode/html');
const cssEditor = makeEditor('cssEditor', 'ace/mode/css');
const jsEditor = makeEditor('jsEditor', 'ace/mode/javascript');

htmlEditor.focus();

function buildPreviewSrcdoc(withTests = false) {
  const html = htmlEditor.getValue().replace(/\n/g, '\n\t\t');
  const css = cssEditor.getValue().replace(/\n/g, '\n\t\t\t');
  const js = jsEditor.getValue().replace(/\n/g, '\n\t\t\t');
  const tests = testsArea.value.replace(/\n/g, '\n\t\t\t');

  return `<!DOCTYPE html>
<html>
\t<head>
\t\t<meta charset="UTF-8">
\t\t<meta name="viewport" content="width=device-width, initial-scale=1.0">
\t\t<title>Web Preview</title>${css ? `\n\t\t<style>\n\t\t\t${css}\n\t\t</style>` : ''}
\t</head>
\t<body>${html ? `\n\t\t${html}` : ''}${js ? `\n\t\t<script>\n\t\t\t${js}${withTests && tests ? `\n\n\t\t\t/* Tests */\n\t\t\t${tests}` : ''}\n\t\t</script>` : ''}
\t</body>
</html>`;
}

const escapeHtml = unsafe => unsafe
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const log = (message, type = 'info') => {
  const color = type === 'error' ? 'var(--err)' : type === 'warning' ? 'var(--warn)' : 'var(--info)';
  const time = new Date().toLocaleTimeString();
  const line = document.createElement('div');
  line.innerHTML = `<span style="color: ${color};">[${time}]</span> ${escapeHtml(message)}`;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
};

const runWeb = (withTests = false) => {
  preview.srcdoc = buildPreviewSrcdoc(withTests);
  log(withTests ? 'Run with tests.' : 'Web preview updated.');
};

runWebBtn.onclick = () => runWeb(false);

runWithTestsBtn.onclick = () => runWeb(true);

openPreviewBtn.onclick = () => {
  const previewWindow = window.open('', '_blank');
  previewWindow.document.write(buildPreviewSrcdoc());
};

const saveProject = () => { };

const focusActiveTab = () => {
  const activeTab = document.querySelector('.tab.active');
  if (activeTab) {
    activeTab.focus();
  }
};

const getActiveEditorName = () => {
  const activeTab = document.querySelector('.tab.active');
  return activeTab ? activeTab.dataset.editor : null;
};

const setActiveEditor = editorName => {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    if (tab.dataset.editor === editorName) {
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      tab.tabIndex = 0;
    } else {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
      tab.tabIndex = -1;
    }
  });

  const editorPanes = document.querySelectorAll('.editor-pane');
  editorPanes.forEach(editorPane => {
    if (editorPane.dataset.editor === editorName) {
      editorPane.hidden = false;
    } else {
      editorPane.hidden = true;
    }
  });

  if (editorName === 'html') {
    htmlEditor.focus();
  } else if (editorName === 'css') {
    cssEditor.focus();
  } else if (editorName === 'js') {
    jsEditor.focus();
  }
};

webTabs.onclick = event => {
  const tab = event.target.closest('.tab');
  if (tab) {
    setActiveEditor(tab.dataset.editor);
  }
};

const setActiveNextEditor = () => {
  const editors = ['html', 'css', 'js'];
  const currentEditor = getActiveEditorName();
  const currentIndex = editors.indexOf(currentEditor);
  const nextIndex = (currentIndex + 1) % editors.length;
  setActiveEditor(editors[nextIndex]);
};

const setActivePreviousEditor = () => {
  const editors = ['html', 'css', 'js'];
  const currentEditor = getActiveEditorName();
  const currentIndex = editors.indexOf(currentEditor);
  const previousIndex = (currentIndex - 1 + editors.length) % editors.length;
  setActiveEditor(editors[previousIndex]);
};

webTabs.onkeydown = event => {
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    setActiveNextEditor();
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    setActivePreviousEditor();
  }
};

const showConfirmDialog = (message, onConfirm) => {
  const dialog = document.createElement('div');
  dialog.classList.add('confirm-dialog');
  dialog.innerHTML = `
    <div class="confirm-dialog-content">
      <p>${message}</p>
      <div class="confirm-dialog-buttons">
        <button class="btn ok" id="confirm-yes">Yes</button>
        <button class="btn err" id="confirm-no">No</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);

  const yesButton = dialog.querySelector('#confirm-yes');
  yesButton.onclick = () => {
    onConfirm();
    document.body.removeChild(dialog);
  };

  const noButton = dialog.querySelector('#confirm-no');
  noButton.onclick = () => {
    document.body.removeChild(dialog);
  };
};

const clearOutput = () => output.innerHTML = '';

clearOutputBtn.onclick = () => showConfirmDialog('Are you sure you want to clear the output?', clearOutput);