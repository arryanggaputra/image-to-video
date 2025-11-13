# Hello World React with Bun

A simple React "Hello World" application built with Bun as the JavaScript runtime and package manager.

## Prerequisites

Make sure you have Bun installed on your system. If not, install it using:

```bash
curl -fsSL https://bun.sh/install | bash
```

## Getting Started

1. Navigate to the project directory:

```bash
cd hello-world-react
```

2. Install dependencies:

```bash
bun install
```

3. Start the development server:

```bash
bun run dev
```

The application will start running on `http://localhost:3000` (or another available port).

## Available Scripts

- `bun run dev` - Starts the development server with hot reloading
- `bun run build` - Builds the app for production
- `bun run start` - Runs the built app
- `bun run type-check` - Run TypeScript type checking

## Project Structure

```
hello-world-react/
├── public/
├── src/
│   ├── App.tsx          # Main App component
│   ├── App.css          # App styles
│   ├── index.tsx        # Entry point
│   └── index.css        # Global styles
├── package.json
├── tsconfig.json
├── bun.config.ts
└── index.html
```

## Technologies Used

- **Bun** - JavaScript runtime and package manager
- **React 18** - UI library
- **TypeScript** - Type safety
- **CSS** - Styling

## Features

- ⚡ Fast development with Bun's built-in bundler
- 🔥 Hot module replacement
- 📦 TypeScript support out of the box
- 🎨 Clean, modern UI
- 📱 Responsive design

## License

MIT License
