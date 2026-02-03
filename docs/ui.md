# UI Coding Standards

## Component Library

This project uses **shadcn/ui** as the exclusive UI component library.

### Rules

1. **ONLY use shadcn/ui components** - No custom components are permitted
2. All UI elements must be built using existing shadcn/ui components
3. If a component does not exist in shadcn/ui, install it via `npx shadcn@latest add <component>`
4. Compose complex UIs by combining multiple shadcn/ui components

### Installing Components

```bash
npx shadcn@latest add <component-name>
```

Available components: https://ui.shadcn.com/docs/components

## Date Formatting

All date formatting must use **date-fns**.

### Standard Date Format

Dates should be formatted as: `do MMM yyyy`

Examples:
- 1st Sep 2025
- 2nd Aug 2025
- 3rd Jan 2026
- 4th Jun 2024

### Implementation

```typescript
import { format } from "date-fns";

// Format a date
const formattedDate = format(date, "do MMM yyyy");
// Output: "1st Sep 2025"
```

### Usage

```typescript
import { format } from "date-fns";

// In components
<span>{format(new Date(workout.startedAt), "do MMM yyyy")}</span>
```
