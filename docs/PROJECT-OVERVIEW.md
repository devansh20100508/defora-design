# PixelForge AI — Project Overview

PixelForge AI is a browser-based image editor designed as a premium editing studio experience. It combines a dark modern interface, layered editing system, image adjustments, filters, AI demo actions, and export tools in a single React + TypeScript project.

## Goal

The project aims to provide a polished editor workflow inspired by design tools like Canva, Figma, and advanced photo editors, while remaining lightweight enough to run locally in a browser.

## Core features

- Image upload and demo image support
- Canvas-based editing surface
- Layer system for text, shapes, and drawings
- Adjustments such as brightness, contrast, saturation, exposure, temperature, sharpness, and blur
- Film-style visual filters
- Rotation and flips
- Compare mode for before/after review
- Shape tools for rectangle, ellipse, triangle, diamond, star, line, and arrow
- Text editing controls with font sizing and color selection
- Export to PNG, JPG, and WebP
- AI-style demo actions for enhancement and creative effects

## Tech stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- HTML5 Canvas

## Project structure

- src/App.tsx — app state and editor orchestration
- src/components/Editor/CanvasEditor.tsx — rendering and interaction layer
- src/components/Editor/PropertiesPanel.tsx — adjustment and text/shape controls
- src/components/Editor/LayersPanel.tsx — layer management and ordering
- src/types/editor.ts — editor typing definitions
- src/utils/imageProcessing.ts — filter and demo image utilities
- src/utils/exportImage.ts — image export pipeline

## Editing model

The application uses a layered editor model where the canvas draws the original image and then overlays layers that include:

- text layers
- shape layers
- drawing strokes

Each layer includes visibility, opacity, and transform controls. This makes the editor flexible enough for common creative tasks without requiring a much larger engine.

## Known scope

This project is intentionally a strong front-end editor prototype with real interactive behavior and polished UI. It is ready for further expansion with advanced AI image processing, more precise transform handles, and deeper crop/selection tooling.

## Launch

Use the project README for quick start instructions, or see the setup guide in the docs folder.
