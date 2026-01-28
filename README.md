# PDF Unlock

A simple macOS app to remove password protection from PDFs.

![Screenshot](screenshot.png)

## Download

**Recommended:** [PDF Unlock (Tauri)](https://github.com/rakeshbhugra/pdf-unlock/releases) - ~26MB, lightweight

[PDF Unlock (Electron)](https://github.com/rakeshbhugra/pdf-unlock/releases) - ~111MB, larger bundle

## Usage

1. **Select PDF** - Click the file zone to choose a password-protected PDF
2. **Enter Password** - Type the PDF's password
3. **Choose Output** (optional) - Pick where to save the unlocked file, or it saves next to the original as `filename_unlocked.pdf`
4. **Unlock** - Click the button and wait for confirmation

## Two Versions Available

| Feature | Tauri (Recommended) | Electron |
|---------|---------------------|----------|
| Bundle Size | ~26MB | ~111MB |
| Memory Usage | Lower | Higher |
| Startup Time | Faster | Slower |
| Technology | System WebView + Rust | Chromium + Node.js |

**We recommend the Tauri version** for its significantly smaller size and better performance.

## Building from Source

### Prerequisites

- Node.js 18+
- Python 3.10+
- [uv](https://github.com/astral-sh/uv) (Python package manager)
- [Rust](https://rustup.rs/) (for Tauri only)

### Step 1: Build Python Binary

```bash
git clone https://github.com/rakeshbhugra/pdf-unlock.git
cd pdf-unlock

# Install Python dependencies and build binary
uv sync
uv run pyinstaller --onefile --name pdf-unlock main.py
```

### Step 2a: Build Tauri App (Recommended)

```bash
# Copy binary with target triple suffix
cp dist/pdf-unlock tauri-app/src-tauri/binaries/pdf-unlock-bin-aarch64-apple-darwin  # Apple Silicon
# OR for Intel Mac:
# cp dist/pdf-unlock tauri-app/src-tauri/binaries/pdf-unlock-bin-x86_64-apple-darwin

# Build Tauri app
cd tauri-app
npm install
npm run tauri build
```

Output: `tauri-app/src-tauri/target/release/bundle/dmg/PDF Unlock_1.0.0_aarch64.dmg`

### Step 2b: Build Electron App (Alternative)

```bash
cp dist/pdf-unlock electron-app/resources/

cd electron-app
npm install
npm run build
```

Output: `electron-app/dist/PDF Unlock-1.0.0-arm64.dmg`

## Development

### Tauri (Recommended)

```bash
cd tauri-app
npm install
npm run tauri dev
```

### Electron

```bash
cd electron-app
npm install
npm start
```

## Project Structure

```
pdf-unlock/
├── main.py                     # Python CLI for PDF unlocking
├── pyproject.toml              # Python dependencies
├── tauri-app/                  # Tauri version (recommended)
│   ├── package.json
│   ├── src-tauri/
│   │   ├── Cargo.toml
│   │   ├── tauri.conf.json
│   │   └── binaries/
│   └── src/
│       ├── main.js
│       └── styles.css
├── electron-app/               # Electron version
│   ├── package.json
│   ├── main.js
│   ├── preload.js
│   └── renderer/
└── screenshot.png
```

## License

MIT
