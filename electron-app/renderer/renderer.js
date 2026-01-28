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
  const filePath = await window.electronAPI.selectFile();
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
  const outputPath = await window.electronAPI.selectOutput(defaultName);
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

  const result = await window.electronAPI.unlockPdf(selectedFilePath, passwordInput.value, selectedOutputPath);

  if (result.success) {
    const outputName = result.outputPath ? getFileName(result.outputPath) : 'unlocked';
    setButtonState('success', `Saved: ${outputName}`);
    setTimeout(resetButton, 3000);
  } else {
    setButtonState('error', result.message || 'Failed');
    setTimeout(resetButton, 3000);
  }
});
