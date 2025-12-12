---
description: Enforces "Dark First" branding with dynamic Light/Dark theming. Mandates the "Heartbeat" & "Surge" animation system for all cards, ensuring high-energy visuals and specific hardware-accelerated CSS properties.
---

# Design System & Visual Physics Rules

This workflow enforces the "Dark First" brand identity and the specific "Heartbeat" animation physics. All generated UI components must strictly adhere to the following tokens and behaviors.

## 1. Core Brand Identity (Immutable)
These colors remain consistent across the site to maintain branding, regardless of the active mode.

| Color Name | Hex | CSS Variable | Usage |
| :--- | :--- | :--- | :--- |
| **Soft Mint / Sage** | `#ABCEC9` | `--brand-primary` | Primary buttons, active states, glows, hero text gradient. |
| **Muted Lavender** | `#C3B8D5` | `--brand-secondary` | Secondary accents, hero text gradient (end), background blobs. |
| **Pure Black** | `#000000` | `--text-on-brand` | Text placed on top of primary buttons (for contrast). |

---

## 2. Dark Mode (Default Theme)
The site is designed as "Dark First" with a deep, almost black background and glowing glass cards.

* **Background:** `#050505` (Deepest Charcoal)
* **Gradient Body:** Linear Gradient from `#050505` to `#121214` (Variable: `--bg-body`)
* **Text Main:** `#f8fafc` (Slate 50 / Off-White)
* **Text Muted:** `#94a3b8` (Slate 400 / Cool Grey)
* **Glass Surface:** `RGBA(30,30,35, 0.65)` (Variable: `--glass-surface`)
* **Glass Border:** `RGBA(255,255,255, 0.08)` (Variable: `--glass-border`)

---

## 3. Light Mode (Toggleable)
Overrides that take effect when the user toggles the theme.

* **Background:** Radial Gradient `#ffffff` center fading to `#EDE8F8` edges (Variable: `--bg-body`)
* **Text Main:** `#1e293b` (Slate 800 / Dark Slate)
* **Text Muted:** `#64748b` (Slate 500 / Slate Grey)
* **Glass Surface:** `RGBA(255,255,255, 0.55)` (Frosted White)
* **Glass Border:** `RGBA(255,255,255, 0.6)` (Semi-Opaque White)

---

## 4. 🚨 CRITICAL RULE: The "Heartbeat" & "Surge" System
**Flat design is strictly forbidden.** Every card element (`.card`, containers, ready-packs) MUST follow this specific "High Energy" visual behavior.

### A. "Always On" High Intensity (Idle State)
* **Visual:** Cards must emit a strong, ambient light even when idle.
* **Animation:** Infinite loop pulsation (approx. 4s duration).
* **Intensity:** Breath varies deeply between **30px and 50px** blur radius.
* **Opacity:** Base opacity approx **0.45**.
* **Token:** Use `--card-glow-base` (rgba(171, 206, 201, 0.25)).

### B. "High Energy" Surge (Hover State)
* **Interaction:** On hover, the heartbeat animation stops.
* **Visual:** The card enters a "Surge" state.
* **Intensity:** Massive glow spread of **60px** with **0.75** opacity.
* **Lift:** Card must scale slightly (`scale(1.01)`) and lift (`translateY(-6px)`).
* **Color:** Surge Color `rgba(171, 206, 201, 0.75)`.

### C. Performance Optimization
Because these shadows are heavy, you **MUST** include hardware acceleration properties on card CSS:
```css
.card {
  transform: translateZ(0);
  will-change: box-shadow, transform;
}