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

  return editor;
};

const htmlEditor = makeEditor('htmlEditor', 'ace/mode/html');
const cssEditor = makeEditor('cssEditor', 'ace/mode/css');
const jsEditor = makeEditor('jsEditor', 'ace/mode/javascript');

htmlEditor.focus();

const runWeb = (withTests = false) => { };

const saveProject = () => { };