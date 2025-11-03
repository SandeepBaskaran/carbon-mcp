# Button Component

The Button component is used to trigger actions in your application.

## Props

- `kind`: 'primary' | 'secondary' | 'ghost' | 'danger' | 'tertiary'
- `size`: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `disabled`: boolean
- `onClick`: (event) => void

## Accessibility

Buttons should have clear, descriptive labels. Use aria-label when button text is not sufficient.
Ensure proper keyboard navigation support with Tab and Enter/Space keys.

## Usage

```tsx
import { Button } from 'carbon-components-react';

<Button kind="primary" onClick={handleClick}>
  Click me
</Button>
```

## Best Practices

- Use primary buttons for the main call-to-action
- Use secondary buttons for supporting actions
- Ghost buttons work well on colored backgrounds
- Limit the number of primary buttons per page to one or two
