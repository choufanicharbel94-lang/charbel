# Design System Overview

This documentation describes a comprehensive design system built on three-layer token architecture (primitive → semantic → component) with integrated slide generation capabilities.

## Key Components

**Token Architecture:** The system uses CSS variables across three layers. Primitives define raw values like `--color-blue-600: #2563EB`, which feed into semantic aliases (`--color-primary`), ultimately referenced by component tokens (`--button-bg`).

**Primary Purpose:** The design system supports "token architecture, component specifications, and slide generation" with emphasis on systematic design and brand-compliant presentations.

## Slide Generation System

The slide functionality operates through contextual decision-making:

- BM25 search algorithm finds relevant slide templates
- Decision CSVs map goals to layouts, typography, colors, and animations
- Pattern-breaking at 1/3 and 2/3 positions maintains engagement
- All slides must import `design-tokens.css` and use CSS variables exclusively

**Critical Requirement:** Slides cannot use hardcoded colors or fonts—they must reference design tokens through `var()` syntax for compliance and theme consistency.

## Integration Points

The system connects with brand guidelines and UI styling tools. Scripts provided include token generation, validation, and slide template searching through Python/Node.js utilities.

**License:** MIT
**Version:** 1.0.0
