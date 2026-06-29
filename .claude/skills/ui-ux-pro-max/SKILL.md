# UI/UX Pro Max - Design Intelligence Skill

This is a comprehensive design system and guideline resource for creating professional user interfaces across web and mobile platforms.

## Core Purpose

The skill provides structured guidance for **UI structure, visual design decisions, interaction patterns, and user experience quality control** across 10 technology stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, HTML/CSS).

## Key Resources

**Design Database:**
- 50+ design styles (glassmorphism, minimalism, brutalism, neumorphism, etc.)
- 161 color palettes organized by product type
- 57 font pairings for different brand personalities
- 161 product type patterns with reasoning rules
- 99 UX guidelines across 10 priority categories
- 25 chart types for data visualization

**Priority Rule Categories (1-10):**
1. **Accessibility** (CRITICAL) — contrast, focus states, keyboard navigation
2. **Touch & Interaction** (CRITICAL) — target sizing, spacing, feedback
3. **Performance** (HIGH) — image optimization, lazy loading, CLS prevention
4. **Style Selection** (HIGH) — consistency, icon standards, platform adaptation
5. **Layout & Responsive** (HIGH) — viewport setup, mobile-first, spacing scales
6. **Typography & Color** (MEDIUM) — semantic tokens, readability, hierarchy
7. **Animation** (MEDIUM) — duration, easing, motion meaning
8. **Forms & Feedback** (MEDIUM) — labels, error placement, validation
9. **Navigation Patterns** (HIGH) — bottom nav limits, deep linking, back behavior
10. **Charts & Data** (LOW) — accessibility, legends, responsive design

## Workflow

**Step 1:** Analyze user requirements (product type, audience, style keywords, tech stack)

**Step 2:** Generate design system using `--design-system` flag with semantic search

**Step 3:** Supplement with domain-specific searches (`--domain color`, `--domain ux`, etc.)

**Step 4:** Apply stack-specific guidelines using `--stack` parameter

## When to Use

**Must invoke** for: new pages, UI refactoring, component creation, color/typography decisions, accessibility reviews, navigation design, animation implementation

**Skip** for: pure backend logic, API design, infrastructure work, non-visual tasks
