import { open, save } from '@tauri-apps/plugin-dialog';
import { Command } from '@tauri-apps/plugin-shell';

const fileZone = document.getElementById('file-zone');
const fileNameEl = document.getElementById('file-name');
const passwordInput = document.getElementById('password');
const outputBtn = document.getElementById('output-btn');
const outputNameEl = document.getElementById('output-name');
const unlockBtn = document.getElementById('unlock-btn');

let selectedFilePath = null;
let selectedOutputPath = null;

function updateButtons() {
  outputBtn.disabled = !selectedFilePath;
  unlockBtn.disabled = !selectedFilePath || !passwordInput.value;
}

function setButtonState(state, message) {
  unlockBtn.className = `unlock-btn ${state}`;
  unlockBtn.textContent = message;
}

function resetButton() {
  unlockBtn.className = 'unlock-btn';
  unlockBtn.textContent = 'Unlock PDF';
  updateButtons();
}

function getFileName(filePath) {
  return filePath.split('/').pop();
}

function getDefaultOutputName(filePath) {
  const name = getFileName(filePath);
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex > 0) {
    return name.slice(0, dotIndex) + '_unlocked.pdf';
  }
  return name + '_unlocked.pdf';
}

fileZone.addEventListener('click', async () => {
  const filePath = await open({
    multiple: false,
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
  });

  if (filePath) {
    selectedFilePath = filePath;
    selectedOutputPath = null;
    fileNameEl.textContent = getFileName(filePath);
    fileZone.classList.add('has-file');
    outputNameEl.textContent = 'Choose location...';
    outputBtn.classList.remove('has-file');
    resetButton();
  }
});

outputBtn.addEventListener('click', async () => {
  const defaultName = getDefaultOutputName(selectedFilePath);
  const outputPath = await save({
    defaultPath: defaultName,
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
  });

  if (outputPath) {
    selectedOutputPath = outputPath;
    outputNameEl.textContent = getFileName(outputPath);
    outputBtn.classList.add('has-file');
  }
});

passwordInput.addEventListener('input', () => {
  updateButtons();
});

unlockBtn.addEventListener('click', async () => {
  if (!selectedFilePath || !passwordInput.value) return;

  unlockBtn.disabled = true;
  setButtonState('loading', 'Unlocking...');

  try {
    const args = [selectedFilePath, passwordInput.value];
    if (selectedOutputPath) {
      args.push('-o', selectedOutputPath);
    }

    const command = Command.sidecar('binaries/pdf-unlock-bin', args);
    const output = await command.execute();

    if (output.code === 0) {
      const match = output.stdout.match(/Saved unlocked PDF to (.+)/);
      const outputPath = match ? match[1].trim() : null;
      const outputName = outputPath ? getFileName(outputPath) : 'unlocked';
      setButtonState('success', `Saved: ${outputName}`);
      setTimeout(resetButton, 3000);
    } else {
      const message = output.stdout.trim() || output.stderr.trim() || 'Unknown error';
      setButtonState('error', message);
      setTimeout(resetButton, 3000);
    }
  } catch (err) {
    console.error('Sidecar error:', err);
    const errorMsg = err?.message || err?.toString() || JSON.stringify(err) || 'Unknown error';
    setButtonState('error', `Failed: ${errorMsg}`);
    setTimeout(resetButton, 3000);
  }
});
