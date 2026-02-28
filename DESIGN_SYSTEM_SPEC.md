# Ethereal UI: Awakened Path Design System

This document specifies the visual identity, physics, and interaction patterns of the **Awakened Path** application. This system is designed to evoke a sense of deep calm, presence, and spiritual focus through "Ethereal UI" principles.

---

## 🎨 1. Color Palette: The Padmasana Theme
The palette is inspired by a meditative sunset, using deep, warm voids and luminescent accents.

| Element | Color Code | Purpose |
| :--- | :--- | :--- |
| **Deep Cosmic** | `#0B0014` | The primary deep void background color. |
| **Muted Rose** | `#C65F9D` | Brand primary accent; used for high-energy interactions. |
| **Creamy Beige** | `#F4E3DA` | Primary text and secondary borders; provides high contrast with warmth. |
| **Teal Glow** | `#ABCEC9` | Bioluminescent indicator color; signifies active presence and safety. |
| **Indigo Void** | `#050008` | Gradient stop for the "Infinite Depth" background. |

---

## ✨ 2. Core Visual Systems

### A. Living Blobs (Background)
The application sits on top of a dynamic, organic layer of SVG-based "Living Blobs".
*   **Motion**: Two independent keyframes: `morph` (changes shape organically) and `float-blob` (provides subtle vertical drifting).
*   **Appearance**: High blur (`40px`) and low opacity (`40%`) ensure these elements don't distract but make the UI feel alive.

### B. Glassmorphism & Depth
All containers (cards, modals, navigation) use a "Glass Surface" style:
*   **Surface**: `rgba(11, 0, 20, 0.7)` (Deep Cosmic Glass).
*   **Backdrop**: `blur(12px)` for a frosted effect.
*   **Border**: `1px solid rgba(244, 227, 218, 0.15)` (Fine Cream Border).

---

## 🎭 3. Animation Physics & Transitions

### A. The "Heartbeat" (Passive State)
All cards possess a perpetual pulse called the **Heartbeat System**.
*   **Effect**: A soft, oscillating `box-shadow` that expands and contracts every 4 seconds.
*   **Philosophy**: Communicates that the content is "breathing" even when the user isn't interacting.

### B. The "Surge" (Hover State)
When a user interacts with a card, the system transitions from passive to active through the **Surge Interaction**.
*   **Intensity**: The `heartbeat` stops, and is replaced by a high-intensity, static glow (`var(--card-glow-surge)`).
*   **Scale**: The card lifts (`translateY(-8px)`) and scales (`1.02x`) slightly.
*   **Timing**: Uses `var(--ease-fluid)`: `cubic-bezier(0.23, 1, 0.32, 1)`, a premium motion profile that starts fast and ends with a silk-smooth deceleration.

### C. Kinetic Typography
Text reveal animations used for main greetings and headings.
*   **Animation**: `text-reveal` shifting from `blur(10px)` and tight letter-spacing to clear, readable text.

---

## 🖱️ 4. Interactive Elements (Dashboard Specific)

### A. The Bioluminescent Indicator (Light-Dot)
Each card features a circular indicator in the bottom-right.
*   **Hollow State**: A subtle ring signifying potential.
*   **Solid State**: On hover, the ring fills with solid **Teal Glow** (`#ABCEC9`) and emits a localized aura.

### B. Layered Parallax Graphics
Cards contain deep-layer background icons (`card-graphic`).
*   **Interaction**: On hover, the large background graphic moves in the opposite direction of the card's lift (`translate(-10px, -20px)`) and rotates slightly.
*   **Depth**: This creates a 3D parallax effect, making the card feel like a window rather than a flat box.

### C. Floating Island Navigation
The bottom navigation bar is detached from the screen edge.
*   **Magnetic Indicator**: A moving pill that slides behind the active icon using the same fluid easing.
*   **Bioluminescent Pulse**: A single glowing dot appears beneath the active icon to anchor the user's current location.

---

## 📜 5. CSS Utility Tokens
These variables are the source of truth for all future components:
*   `--ease-fluid`: `cubic-bezier(0.23, 1, 0.32, 1)`
*   `--card-glow-base`: `rgba(198, 95, 157, 0.25)`
*   `--card-glow-surge`: `rgba(198, 95, 157, 0.75)`
*   `--bg-body`: Infinite gradient from Cosmic Void to Indigo Void.
