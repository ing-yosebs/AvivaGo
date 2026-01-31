# AvivaGo Design System Guide

## Philosophy
**"Premium Trust"**. Clean, airy, and professional. Inspired by Airbnb's card layouts and Stripe's typography interactions.
- **Mobile First**: All components are designed for 375px width first, then expand.
- **Whitespace**: Generous padding to reduce cognitive load.
- **Depth**: Soft, layered shadows instead of harsh borders.

## 1. Color Palette (Tailwind)

### Primary (Brand) - Trust Blue
- **Primary**: `blue-600` (#2563eb) - Main Actions (Buttons, Links)
- **Hover**: `blue-700` (#1d4ed8)
- **Surface**: `blue-50` (#eff6ff) - Highlights, Badges

### Neutrals (Text & Structure)
- **Headings**: `gray-900` (#111827) - Inter Tight, Heavy weight
- **Body**: `gray-600` (#4b5563) - Highly readable
- **Borders**: `gray-100` (#f3f4f6) - Subtle separation
- **Background**: `gray-50` (#f9fafb) - App background
- **Cards**: `white` (#ffffff)

### Signal Colors
- **Success**: `emerald-500` - Validations, Verified Status
- **Locked/Premium**: `gray-900` or `indigo-600`

## 2. Typography
**Font Family**: System Sans (`ui-sans-serif`, `system-ui`).
*Rationale: Lowest latency, native feel.*

- **H1 (Hero)**: `text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900`
- **H2 (Section)**: `text-xl font-bold text-gray-900`
- **H3 (Card Title)**: `text-lg font-semibold text-gray-900`
- **Body**: `text-base text-gray-600 leading-relaxed`
- **Label**: `text-xs font-bold uppercase tracking-wider text-gray-500`

## 3. UI Components (Tailwind Classes)

### Buttons
- **Primary**: `bg-blue-600 text-white font-medium py-3 px-6 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 shadow-blue-500/30`
- **Secondary/Ghost**: `bg-white text-gray-700 font-medium py-3 px-6 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all`

### Cards (Driver Preview)
- **Container**: `bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group`
- **Image**: `aspect-[4/3] object-cover w-full group-hover:scale-105 transition-transform duration-500`

### Inputs
- **Field**: `w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none`

## 4. Spacing System
- **Module**: 4px (`1` unit).
- **Section Padding**: `py-12 md:py-16`
- **Card Padding**: `p-5` or `p-6`
- **Gap**: `gap-6` (24px) standard grid gap.
