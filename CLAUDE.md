# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + Vite application using ReactFlow (@xyflow/react) for building interactive node-based diagrams and flow charts. The project uses React 19 with JSX (not TypeScript) and follows a minimal Vite setup with HMR.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with hot module reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Architecture

### Core Technologies
- **React 19**: Using the latest React features including StrictMode
- **Vite**: Build tool and dev server with Fast Refresh via @vitejs/plugin-react (uses Babel)
- **@xyflow/react**: Main library for creating interactive node-based UIs

### Application Structure
- **Entry Point**: `src/main.jsx` - Renders the root App component into `#root` div
- **Main Component**: `src/App.jsx` - Contains the ReactFlow canvas with nodes, edges, and controls
- **Styling**: CSS files in `src/` with ReactFlow styles imported from '@xyflow/react/dist/style.css'

### ReactFlow State Management
The app uses local React state (useState) to manage:
- **Nodes**: Array of node objects with id, position, and data
- **Edges**: Array of edge objects connecting nodes
- **Change handlers**: `onNodesChange`, `onEdgesChange`, `onConnect` use ReactFlow's built-in helpers (`applyNodeChanges`, `applyEdgeChanges`, `addEdge`)

All change handlers are memoized with useCallback to prevent unnecessary re-renders.

### ESLint Configuration
- Custom flat config in `eslint.config.js` (new format)
- Uses recommended rules from @eslint/js
- React Hooks plugin with 'recommended-latest' config
- React Refresh plugin for Vite
- Custom rule: allows unused vars matching `^[A-Z_]` pattern
- Ignores: `dist/` directory

## File Patterns
- JavaScript/JSX files use `.jsx` extension
- No TypeScript in this project
- CSS files in `src/` directory
