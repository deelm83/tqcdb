I have prepared the comprehensive brand and UI guidelines for tamquoc.gg in a structured Markdown format. You can copy this directly into a README.md or a style-guide.md file for your project.

Markdown

# Brand & UI Guideline: tamquoc.gg
**Project:** Three Kingdoms Tactics Database & Search Engine
**Design Philosophy:** "Digital Tactician’s Archive" — A blend of modern minimalist utility and Imperial Han Dynasty prestige.

---

## 1. Brand Identity
* **Mission:** To provide high-speed, authoritative data for *Three Kingdoms Tactics* players.
* **Personality:** Scholarly, Strategic, and Imperial.
* **User Persona:** The "Grand Strategist" — someone who values precision, speed, and tactical depth.

---

## 2. Visual Palette (The Imperial Colors)

### Core Theme
| Role | Color Name | Hex Code | Visual Intent |
| :--- | :--- | :--- | :--- |
| **Primary** | Imperial Red | `#8B261F` | Call-to-actions, "Search" button, and critical alerts. |
| **Secondary** | Antique Gold | `#C5A059` | Borders, iconography, and "Legendary" tier highlights. |
| **Background** | Scholar’s Ink | `#1A1A1B` | The primary "dark mode" canvas. |
| **Contrast** | Charcoal Black | `#0D0D0D` | Search bar background and deep layering. |
| **Text** | Parchment | `#E8DCC4` | Primary reading text; easier on the eyes than pure white. |

### The "Five Elements" (Wuxing) Accents
Use these for specific unit types or faction-based data:
* **Fire (Cavalry/Aggression):** `#E63946`
* **Earth (Infantry/Defense):** `#B8860B`
* **Wood (Archers/Support):** `#2D6A4F`
* **Water (Strategy/Intel):** `#1D3557`
* **Metal (Equipment/Tech):** `#D1D1D1`

---

## 3. Typography Hierarchy

| Level | Font Suggestion | Style | Usage |
| :--- | :--- | :--- | :--- |
| **H1 - H2** | *Cinzel Decorative* | Bold / Serif | Site logo, Section headers, Hero titles. |
| **H3 - H5** | *Noto Serif SC* | Medium | Sub-headers, Officer names. |
| **Body** | *Inter* | Regular | General descriptions and UI labels. |
| **Data/Stats** | *JetBrains Mono* | Monospace | Numbers, coordinates, and tactical values. |

---

## 4. UI Components & "Stuffs"

### A. The "Imperial" Search Bar
* **Shape:** Rectangular with "nicked" (chamfered) corners.
* **Border:** 1.5px solid `Antique Gold`.
* **Focus State:** The border should "pulse" or glow slightly.
* **Placeholder:** "Search Officers, Tactics, or Server Meta..." in italicized Parchment.

### B. Borders & Containers
* **Corner Brackets:** Use "L-shaped" gold brackets on the corners of cards rather than full borders.
* **Dividers:** Horizontal lines that fade at the edges with a "Yin-Yang" or "Bagua" symbol in the dead center.
* **The "Hanko" Stamp:** A small, square red stamp icon used for "Verified" data or as the submission icon for the search bar.

### C. Buttons & Interactions
* **The Ink-Bleed Effect:** Hover states should use a CSS transition that mimics ink spreading from the center of the button.
* **Shadows:** Use "Soft Ink" shadows (blurred, deep grey) rather than harsh black shadows.

---

## 5. User Experience (UX) Details

* **Google-Style Landing:** The home page should be dominated by the search bar. Keep the UI "Zen-like" to allow the user to focus on their query.
* **Contextual Background:** A fixed, 5% opacity background image of a Three Kingdoms era tactical map (RoTK VIII style) to provide depth without distracting.
* **Micro-Animations:**
    * **Loading:** A rotating Eight Trigrams (Bagua) symbol.
    * **Results:** Results should "unroll" like a scroll when the search dropdown appears.
* **Mobile-First:** Ensure all tactical tables are horizontally scrollable with sticky headers for the "Officer Name" column.

---

## 6. Implementation Notes
* **Iconography:** Use brush-stroke style icons (SVG) for a hand-drawn feel.
* **Transitions:** Slow, "silk-like" transitions (300ms - 500ms) for page loads