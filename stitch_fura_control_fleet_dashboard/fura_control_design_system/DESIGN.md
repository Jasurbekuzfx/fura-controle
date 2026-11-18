---
name: Fura Control Design System
colors:
  surface: '#071426'
  surface-dim: '#071426'
  surface-bright: '#2e3a4d'
  surface-container-lowest: '#030e20'
  surface-container-low: '#0f1c2e'
  surface-container: '#142032'
  surface-container-high: '#1e2a3d'
  surface-container-highest: '#293549'
  on-surface: '#d7e3fc'
  on-surface-variant: '#c0c7d6'
  inverse-surface: '#d7e3fc'
  inverse-on-surface: '#253144'
  outline: '#8a919f'
  outline-variant: '#404753'
  surface-tint: '#a6c8ff'
  primary: '#a6c8ff'
  on-primary: '#003060'
  primary-container: '#2d91ff'
  on-primary-container: '#002a54'
  inverse-primary: '#005eb1'
  secondary: '#40e48d'
  on-secondary: '#00391d'
  secondary-container: '#00c774'
  on-secondary-container: '#004c29'
  tertiary: '#cebdff'
  on-tertiary: '#380094'
  tertiary-container: '#9b7aff'
  on-tertiary-container: '#300083'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#a6c8ff'
  on-primary-fixed: '#001c3b'
  on-primary-fixed-variant: '#004787'
  secondary-fixed: '#60fea5'
  secondary-fixed-dim: '#3be18b'
  on-secondary-fixed: '#00210f'
  on-secondary-fixed-variant: '#00522d'
  tertiary-fixed: '#e8ddff'
  tertiary-fixed-dim: '#cebdff'
  on-tertiary-fixed: '#21005e'
  on-tertiary-fixed-variant: '#5114c5'
  background: '#071426'
  on-background: '#d7e3fc'
  surface-variant: '#293549'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  kpi-stat:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
  table-header:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system is engineered for mission-critical freight dispatch, heavy logistics tracking, and fleet telemetry monitoring. It targets fleet managers, freight dispatchers, cargo operators, and telemetry analysts who monitor real-time vehicle routes, cargo states, and driver metrics under high-stress, data-dense conditions.

The visual direction pairs **Modern SaaS Functionalism** with **Precision Dark Navy Engineering**. Depth is conveyed through deep maritime navies, surgical borders, and controlled ambient glows that highlight crucial operational states without visual fatigue. The emotional posture is authoritative, unflinching, and real-time responsive—delivering instant situational clarity across telematics feeds, route deviations, and cargo status flags.

## Colors

The color architecture enforces a high-contrast dark foundation optimized for night-and-day dispatch terminals. Deep blue-black canvas layers allow high-luminance status signals to stand out immediately.

### Canvas & Structural Tiers
- **Main Canvas (`#071426`):** The foundational viewport background for application screens.
- **Sidebar & Navigation Surface (`#0B1B32`):** Primary organizational anchor and fixed navigation frame.
- **Primary Card & Data Tile Surface (`#102440`):** Default container tier for data grids, KPI cards, and modal dialogs.
- **Secondary Card & Inset Surface (`#142B49`):** Interactive card variations, hover surfaces, and segmented controls.
- **Structural Outlines (`#243F60`):** Crisp, low-luminance divider lines and structural borders.

### Accent & Status Spectrum
- **Electric Blue Accent (`#0788F9`):** Primary interactions, route paths, active telemetry markers, and focused elements.
- **Operational Green / Muvaffaqiyat (`#00C875`):** Positive completion, nominal vehicle health, and cleared routes.
- **Attention Orange / Ogohlantirish (`#FFA526`):** Active transit, loading pauses, maintenance alerts, and pending customs.
- **Telemetry Purple / Maxsus Holat (`#8055F5`):** Auxiliary cargo status, refrigerated trailer telemetry, and driver analytics.
- **Critical Red / Xavf (`#EF4444`):** Emergency stops, route violations, speeding triggers, and hardware failures.

### Text & Content Luminance
- **Crisp High-Contrast Text (`#F5F8FF`):** 100% white-blue tint for headlines, metrics, vehicle IDs, and primary values.
- **Secondary Muted Text (`#9BAFC8`):** Desaturated slate-blue for column titles, metadata labels, unit tags, and timestamps.

## Typography

The design system relies on **Plus Jakarta Sans** across all roles to achieve a clean geometric silhouette with open counters and exceptional small-size legibility. Data density requires unambiguous numeral rendering (especially vehicle plates, speed gauges, and GPS coordinates).

All numerical readouts, dispatch timers, metric cards, and table values must leverage tabular figures (`font-variant-numeric: tabular-nums`) to prevent horizontal jitter during real-time telemetry updates. Uzbek language content uses clean standard casing with specific attention to diacritical clarity on characters such as `O'`, `G'`, and `sh`. Table headers use uppercase styling with slight letter spacing (`0.05em`) for quick scanability.

## Layout & Spacing

The layout is built upon a 12-column fluid grid system pinned to a fixed left sidebar (width: `280px` expanded, `72px` collapsed).

### Breakpoints & Fluid Columns
- **Desktop (>= 1280px):** 12-column grid, `margin: 2rem`, `gutter: 1.5rem`. Max dashboard width: unconstrained fluid or containerized at `1680px`.
- **Tablet (768px - 1279px):** 8-column grid, `margin: 1.5rem`, `gutter: 1rem`. Sidebar automatically collapses to icon-only mode.
- **Mobile (< 768px):** 4-column grid, `margin-mobile: 1rem`, `gutter-mobile: 0.75rem`. Sidebar shifts to off-canvas drawer; data tables convert to stacked inspection cards.

The vertical pacing adheres strictly to an 8px spatial rhythm (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 16px, `space-lg` = 24px, `space-xl` = 32px).

## Elevation & Depth

Visual hierarchy uses a hybrid strategy combining **Tonal Inset Layering**, **Crisp Outlines**, and **Color-Tinted Ambient Glows**. Flat grey drop shadows are strictly prohibited; depth is created using dark blue base tones and neon-tinted radial glows.

### Elevation Hierarchy
- **Level 0 (Canvas Base `#071426`):** The structural viewport floor.
- **Level 1 (Docked Containers `#0B1B32` & `#102440`):** Default card and navigation surface, bound by a crisp 1px solid border in `#243F60`.
- **Level 2 (Active Cards & Hover Surfaces `#142B49`):** Subtle elevation with an ambient dark blue shadow: `0 8px 24px rgba(3, 11, 22, 0.45)`.
- **Level 3 (Modals, Overlays & Drawers):** High-level overlay surface `#102440` with dual borders (`#243F60` outer, `rgba(245, 248, 255, 0.08)` inner inset) and depth shadow: `0 20px 48px rgba(0, 0, 0, 0.65)`. Backdrops use `rgba(7, 20, 38, 0.8)` with an 8px blur.
- **Glow Elevation (Action Focus & High Alert):** Primary CTA buttons and critical KPI triggers project an ambient color-matched aura:
  - Primary Action Glow: `0 0 16px rgba(7, 136, 249, 0.45), 0 4px 12px rgba(7, 136, 249, 0.3)`
  - Emergency Alert Glow: `0 0 16px rgba(239, 68, 68, 0.45)`

## Shapes

The design system maintains a disciplined, architectural shape geometry at Level 2 (Rounded):
- Standard control elements, inputs, buttons, and badges utilize **8px (`0.5rem`)** corner radii.
- Medium containers, modal dialogs, and KPI cards leverage **16px (`1rem`)** (`rounded-lg`).
- Feature map overlays and telemetry callouts scale up to **24px (`1.5rem`)** (`rounded-xl`).
- Status pills, notification indicators, and micro-avatars utilize full capsule rounding (`9999px`).

## Components

### 1. Action Buttons
- **Primary Action (Vibrant Blue Glow):** Solid background in `#0788F9`, text `#F5F8FF` (`label-md`), height 40px, padding 0 20px, border-radius 8px. Idle shadow: `0 0 16px rgba(7, 136, 249, 0.4)`. Hover state: background `#2596FA`, shadow: `0 0 24px rgba(7, 136, 249, 0.65)`. Active: scale `0.98`.
- **Secondary Action:** Background `#142B49`, 1px border `#243F60`, text `#F5F8FF`. Hover: background `#1C3B63`, border-color `#0788F9`.
- **Destructive Action:** Background `rgba(239, 68, 68, 0.12)`, 1px border `#EF4444`, text `#EF4444`. Hover: background `#EF4444`, text `#FFFFFF`, glow `0 0 16px rgba(239, 68, 68, 0.4)`.

### 2. Logistics Status Badges (Uzbek Telematics)
Status badges are constructed with a frosted glass background (`rgba` fill at 12% opacity), a matching 1px semi-transparent outline (24% opacity), and a 6px glowing status dot.
- **Yo'lda (In Transit):** Background `rgba(7, 136, 249, 0.12)`, border `rgba(7, 136, 249, 0.3)`, text `#0788F9`. Dot: `#0788F9` with pulse glow.
- **Bo'sh (Empty / Available):** Background `rgba(0, 200, 117, 0.12)`, border `rgba(0, 200, 117, 0.3)`, text `#00C875`. Dot: `#00C875`.
- **Band (Occupied / Fully Loaded):** Background `rgba(128, 85, 245, 0.12)`, border `rgba(128, 85, 245, 0.3)`, text `#8055F5`. Dot: `#8055F5`.
- **Yuklanmoqda (Loading):** Background `rgba(255, 165, 38, 0.12)`, border `rgba(255, 165, 38, 0.3)`, text `#FFA526`. Dot: `#FFA526`.
- **Yakunlandi (Completed):** Background `rgba(155, 175, 200, 0.12)`, border `rgba(155, 175, 200, 0.25)`, text `#9BAFC8`. Dot: `#9BAFC8`.

### 3. KPI Stat Cards
- **Architecture:** Background `#102440`, border 1px solid `#243F60`, border-radius 16px, padding 20px. Position relative, overflow hidden.
- **Telemetry Icon:** Left-aligned 44x44px rounded container (`#142B49`) with glowing stroke icon corresponding to the metric metric color.
- **Watermark Graphic:** Vector semi-trailer truck or container contour rendered at 6% opacity in `#F5F8FF` positioned in the lower-right quadrant, bleeding slightly outside card bounds.
- **Typography:** Label in `#9BAFC8` (`label-sm`, uppercase), metric value in `#F5F8FF` (`kpi-stat`), trend badge with micro arrow indicator.

### 4. SaaS Data Table
- **Container:** Background `#102440`, 1px border `#243F60`, rounded 12px.
- **Header Row:** Background `#0B1B32`, border-bottom 1px solid `#243F60`, height 44px. Text in `#9BAFC8` (`table-header`), text-transform uppercase.
- **Data Rows:** Height 52px, horizontal border-bottom 1px solid `#1A3353`. Idle background transparent. Hover state: background `#142B49` with a subtle left accent edge (3px solid `#0788F9`).
- **Cells:** Primary identifiers (Vehicle Plate, Dispatch ID) in `#F5F8FF` font-weight 600. Secondary telemetry (Fuel, Speed, ETA) in `#9BAFC8` (`tabular-nums`).

### 5. Input Fields & Modal Filters
- **Input Elements:** Background `#0B1B32`, 1px border `#243F60`, border-radius 8px, height 40px, text `#F5F8FF`, placeholder `#9BAFC8`. Focus: border-color `#0788F9`, box-shadow `0 0 0 3px rgba(7, 136, 249, 0.2)`.
- **Modal Filters Panel:** Surface `#102440`, top accent bar (2px solid `#0788F9`), padding 24px. Includes multi-select filter tags in `#142B49` with active toggle states highlighted in `#0788F9`.
- **Checkboxes & Radios:** 18x18px, border 1.5px solid `#243F60`, rounded 4px (checkbox) or circular (radio). Checked state: `#0788F9` with sharp white tick icon.

### 6. Auxiliary Fleet Controls (Route Map Tooltips & Speed Telemetry)
- **Map Overlays:** Floating dark glass card (`background: rgba(16, 36, 64, 0.85)`, `backdrop-filter: blur(12px)`), 1px border `rgba(36, 63, 96, 0.6)`, displaying real-time speed, driver contact, and GPS coordinate tracking.