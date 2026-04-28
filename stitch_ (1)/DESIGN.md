# Design System: The Ethereal Voyager

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Concierge"**

This design system moves away from the rigid, boxed-in layouts of traditional travel apps. Instead, it adopts an editorial, "concierge-first" philosophy. The experience should feel like looking through a high-end travel magazine at midnight—sophisticated, immersive, and effortlessly intelligent.

We break the "template" look by utilizing **intentional asymmetry** and **tonal depth**. Rather than placing elements in a flat grid, we use overlapping layers and significant white space (breathing room) to guide the eye. This system is designed to feel like a premium assistant that anticipates needs, using vibrant indigo accents to highlight the "intelligence" behind the AI.

---

## 2. Colors
Our palette is rooted in a deep, nocturnal base to allow the travel imagery and AI accents to vibrate with life.

*   **Primary Palette (Intelligence):** `primary (#b6a0ff)` and `secondary (#8596ff)`. These are our "energy" colors, reserved for AI interactions and brand moments.
*   **Surface Palette (The Canvas):** We utilize a range of `surface` tokens from `lowest (#000000)` to `highest (#25252c)` to create a sense of architectural depth.

### The "No-Line" Rule
**Explicit Instruction:** Traditional 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background color shifts. To separate a profile section from a feed, place a `surface-container-low` card against a `surface` background. Let the change in value be the border.

### The "Glass & Gradient" Rule
Main CTAs and high-level AI suggestions should utilize a subtle linear gradient from `primary` to `primary-dim`. For floating navigation or modal headers, use **Glassmorphism**: 
*   **Fill:** `surface-variant` at 60% opacity.
*   **Effect:** 20px backdrop blur.
This ensures the UI feels like a series of physical, translucent layers.

---

## 3. Typography
We use a high-contrast pairing of **Plus Jakarta Sans** for headlines and **Manrope** for utility.

*   **Display & Headlines (Plus Jakarta Sans):** Used for large, editorial moments like destination names or AI greetings. The generous x-height conveys modernity and authority.
*   **Title & Body (Manrope):** Optimized for legibility. Body-lg is our standard for AI responses to ensure long-form travel itineraries are easy to digest.
*   **Label (Manrope):** Reserved for metadata and overlines. These should often be in `on-surface-variant` to maintain a quiet hierarchy.

---

## 4. Elevation & Depth
In this design system, depth is a functional tool, not a stylistic flourish.

### The Layering Principle
Depth is achieved by "stacking" the surface-container tiers. 
*   **Base:** `surface (#0e0e13)`
*   **Section:** `surface-container-low (#131318)`
*   **Interactive Card:** `surface-container (#19191f)`
This natural progression creates a "soft lift" that feels more organic than harsh drop shadows.

### Ambient Shadows
When an element must float (e.g., a floating action button or a primary modal), use an **Ambient Shadow**:
*   **Blur:** 32px to 48px.
*   **Opacity:** 8%.
*   **Color:** Use the `primary` token for the shadow color to create a subtle glow effect that feels like the AI is illuminating the interface.

### The "Ghost Border" Fallback
If a border is required for accessibility in input fields, use the "Ghost Border": `outline-variant` at **15% opacity**. Never use a 100% opaque stroke.

---

## 5. Components

### Buttons
*   **Primary:** A vibrant gradient of `primary` to `primary-container`. Corner radius: `full`. No border.
*   **Secondary:** `surface-container-high` background with `primary` text. This provides a tactile feel without competing with the main action.
*   **Tertiary:** Text-only using `primary` color, reserved for low-emphasis actions like "View Map."

### Input Fields
*   **Styling:** Use `surface-container-low` as the base. 
*   **States:** On focus, the container transitions to `surface-container-high` with a 1px "Ghost Border" in `primary` at 30% opacity. 
*   **Typography:** Use `body-md` for input text and `label-sm` for floating labels.

### Cards & Lists
*   **Rule:** Forbid the use of divider lines. 
*   **Implementation:** Separate list items using 12px of vertical white space. Use `surface-container-lowest` for the list background and `surface-container` for individual "featured" items to create a nested hierarchy.
*   **Radius:** Always use `xl (1.5rem)` for large destination cards and `md (0.75rem)` for smaller utility items.

### AI Suggestion Chips
*   **Styling:** Semi-transparent `secondary-container` (40% opacity) with a `secondary` text label. These should feel like "pills" floating over the dark background.

---

## 6. Do's and Don'ts

### Do:
*   **Use Asymmetry:** Place a large `display-sm` headline off-center to create an editorial feel.
*   **Embrace the Dark:** Keep 80% of the screen in the `surface` and `surface-container` range to make the `primary` accents feel truly "vibrant."
*   **Use High-End Imagery:** Only use photography with deep shadows and cinematic lighting to match the sophisticated theme.

### Don't:
*   **Don't use pure white:** All "white" text should use `on-surface (#f6f2fa)` to reduce eye strain in dark mode.
*   **Don't use hard edges:** Avoid the `none` or `sm` roundedness tokens unless for very specific technical data. High-end travel feels "soft" and "human."
*   **Don't clutter:** If a screen feels busy, increase the spacing rather than adding boxes or lines to "organize" it.