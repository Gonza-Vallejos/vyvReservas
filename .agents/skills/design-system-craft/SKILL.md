---
name: design-system-craft
description: >-
  Use this skill when designing, building, or refactoring UI components and pages in web and mobile applications.
  Guides modern UI/UX design, visual hierarchy, micro-interactions, responsive layouts, color systems, and premium aesthetics.
---

# UI/UX & Web Design Craft Skill

This skill guides the design and styling implementation for web and mobile applications to achieve state-of-the-art, premium visual excellence.

---

## 1. Design Philosophy & Foundations

1. **Visual Hierarchy & Depth**:
   - Never present flat, monotonous containers.
   - Use multi-layer depth: background tint -> card surface -> elevation shadow / glowing border (`0 20px 40px -15px rgba(0, 0, 0, 0.08)`).
   - Use soft, subtle glassmorphism (`backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.75); border: 1px solid rgba(255, 255, 255, 0.4)`).

2. **Harmonious Color Palette**:
   - **Primary Brand**: Deep vibrant indigo/blue (e.g., `#2563eb` or `#3b82f6`) with accent amber/coral (`#f59e0b` / `#10b981`).
   - **Surface & Backgrounds**: Soft slate background (`#f8fafc` or `#0f172a` for dark mode) with pure crisp surfaces (`#ffffff` or `#1e293b`).
   - **Text Contrast**: High-contrast primary headers (`#0f172a` / `#f8fafc`), muted slate for labels (`#64748b` / `#94a3b8`).

3. **Typography Standards**:
   - Modern Google Fonts: **Outfit** for titles/metrics (geometric, friendly, modern) and **Inter** for readable UI content/forms.
   - Distinctive typography hierarchy: `display` (2.5rem - 3.5rem, weight 800/900), `h2` (1.8rem - 2.2rem, weight 800), `body` (0.95rem - 1rem, weight 400/500), `caption/labels` (0.7rem - 0.8rem, weight 700, uppercase letter-spacing 0.5px).

---

## 2. Interactive Components & Micro-animations

1. **Buttons & CTAs**:
   - Smooth hover lifts (`transform: translateY(-2px); box-shadow: 0 12px 24px -6px rgba(37, 99, 235, 0.35);`).
   - Active press feedback (`transform: scale(0.97);`).
   - Loading states with spinners or pulsing skeletons.

2. **Cards & Badges**:
   - Rounded corners (`border-radius: 20px` to `28px`).
   - Subtle interactive hover states (`transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`).
   - Pill status badges with dual tones (e.g. green: `#dcfce7` bg with `#166534` text; red: `#fee2e2` bg with `#991b1b` text).

3. **Input Fields & Forms**:
   - Clean floating or icon-accompanied inputs with soft border `#e2e8f0`.
   - Focus rings with branded glow (`box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12); border-color: var(--primary)`).

---

## 3. Layouts & Responsiveness

1. **Fluid Grid Systems**:
   - Use CSS Grid with `repeat(auto-fill, minmax(320px, 1fr))` for cards.
   - Clean, spacious margins (desktop: `80px` padding, mobile: `20px` padding).
2. **Mobile First Adaptation**:
   - Navigation bar collapses into modern drawer or bottom bar on mobile.
   - Touch targets must be at least `44px x 44px`.

---

## 4. UI Checklist for Every View

- [ ] Does the page have a clear visual focal point (Hero banner, key action)?
- [ ] Are empty states and loading skeletons polished and welcoming?
- [ ] Do buttons provide active/hover feedback?
- [ ] Are icons used consistently (stroke width, size, Lucide icon family)?
- [ ] Is there adequate spacing (whitespace) between related groups?
