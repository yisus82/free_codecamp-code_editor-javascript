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

const runWeb = (withTests = false) => { };

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