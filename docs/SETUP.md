# Setup and Local Development

## Prerequisites

- Node.js 18+
- npm or pnpm
- A modern browser

## Install dependencies

```bash
npm install
```

 or

```bash
pnpm install
```

## Run locally

```bash
npm run dev -- --host 0.0.0.0
```

Then open the local Vite URL shown in the terminal.

## Production build

```bash
npm run build
```

## Preview production build

```bash
npm run preview -- --host 0.0.0.0
```

## Common issues

### Node not detected

Make sure Node is installed and available on your PATH. In many environments the shell may need a full Node installation path added first.

### Vite port conflicts

If 5173 is occupied, Vite will automatically select a fallback port such as 5174 or 5180.

### Large dependency installs

If package installation is slow, try a clean reinstall after removing node_modules and lock files.
