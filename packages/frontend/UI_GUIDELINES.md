# UI Guidelines

This document contains strict rules that MUST be followed for all UI updates.

---

## 1. Language

**The site must be 100% Vietnamese.**

### Rules:
- All labels, buttons, headings, descriptions, tooltips, and placeholder text MUST be in Vietnamese
- All error messages and notifications MUST be in Vietnamese
- Navigation items MUST be in Vietnamese

### Exceptions (allowed in English):
- `COST` - for general cost display
- Technical terms that have no common Vietnamese equivalent
- Code-related text (variable names, technical IDs)

### Examples:
| Incorrect | Correct |
|-----------|---------|
| Search | Tìm kiếm |
| Filter | Lọc |
| Submit | Gửi |
| Cancel | Hủy |
| Loading... | Đang tải... |
| No results found | Không tìm thấy kết quả |
| Back | Quay lại |
| Save | Lưu |
| Delete | Xóa |
| Edit | Sửa |
| Generals | Võ tướng |
| Skills | Chiến pháp |
| Innate Tactic | Chiến pháp tự mang |
| Inherited Tactic | Chiến pháp kế thừa |

---

## 2. Stat Translations

| English | Vietnamese |
|---------|------------|
| Attack / Strength | Võ lực |
| Command | Thống suất |
| Intelligence | Trí lực |
| Politics | Chính trị |
| Speed | Tốc độ |
| Charm | Mị lực |
| Stats | Chỉ số |

---

## 3. Troop Type Translations

Always use these Vietnamese names for troop types:

| English | Vietnamese |
|---------|------------|
| Cavalry | Kỵ |
| Shield | Khiên |
| Archer | Cung |
| Spear | Thương |
| Siege | Xe |

---

## 4. Grade Colors

Use these consistent colors for grades:

| Grade | Color | Tailwind Class |
|-------|-------|----------------|
| S | Orange | `text-orange-400`, `border-orange-400` |
| A | Purple | `text-purple-400`, `border-purple-400` |
| B | Light Blue | `text-sky-400`, `border-sky-400` |
| C | Light Cyan | `text-cyan-300`, `border-cyan-300` |

---

## 5. Faction Colors

| Faction | Vietnamese | Color |
|---------|------------|-------|
| Wei | Ngụy | Blue (`text-blue-400`) |
| Shu | Thục | Green (`text-green-400`) |
| Wu | Ngô | Red (`text-red-400`) |
| Qun | Quần | Yellow (`text-yellow-400`) |

---

## 6. Typography

- General names: Use serif font (`font-serif` class)
- Body text: Use default sans-serif
- Cost numbers: Use Comic Sans (`'Comic Sans MS', 'Comic Neue', cursive`)

---

## 7. Component Patterns

### Badges/Pills
- Use compact horizontal layout: `[Icon] [Label] [Value]`
- Border and text should match the semantic color (e.g., grade color)
- Background: `bg-[var(--bg-tertiary)]`

### Cards
- Use `card-gold` class for highlighted/important content
- Use `card` class for standard content

---

## 8. Alignment & Usability

### Grid Alignment
- Use consistent grid systems (Tailwind grid classes)
- Align labels and inputs vertically when in the same column
- Use equal column widths for related fields (e.g., base/growth stats side by side)
- Ensure column headers align with their content below

### Form Layout
- Group related fields together in the same section
- Use consistent spacing between form groups (mb-4 or mb-5 for sections)
- Labels should be positioned consistently (above or beside inputs, not mixed)
- Input fields in the same row should have matching heights

### Readability
- Maintain sufficient contrast between text and background
- Use appropriate font sizes (text-sm for labels, text-base for content)
- Don't crowd too many inputs in a single row (max 3-4 on desktop, 2 on mobile)
- Use column headers when displaying tabular data

### Mobile Responsiveness
- Stack columns vertically on mobile (use md: breakpoint for horizontal layouts)
- Ensure touch targets are at least 44x44px
- Don't require horizontal scrolling

---

## Checklist Before Committing UI Changes

- [ ] All text is in Vietnamese (except allowed exceptions)
- [ ] Troop type names use correct Vietnamese translations
- [ ] Grade colors are consistent with the color scheme
- [ ] Faction names and colors are correct
- [ ] Form fields are properly aligned in their grid
- [ ] Related fields are grouped together logically
- [ ] Layout is responsive and readable on mobile
- [ ] Column headers align with their content
