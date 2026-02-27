---
name: react-best-practices
description: Apply React best practices, patterns, and modern conventions for building scalable, maintainable React applications
license: Complete terms in LICENSE.txt
---

This skill guides the development of React applications following modern best practices, patterns, and conventions.

## React Core Principles

Follow these fundamental practices:
- **Component Design**: Create focused, single-responsibility components
- **State Management**: Use appropriate state solutions (useState, useReducer, context, external libraries)
- **Performance**: Implement memoization (React.memo, useMemo, useCallback) when necessary
- **Type Safety**: Leverage TypeScript for props, state, and events

## Modern React Patterns

### Component Patterns
- Use functional components with hooks
- Prefer composition over inheritance
- Extract custom hooks for reusable logic
- Keep components under 300 lines (split when larger)
- Co-locate related code (styles, tests, types)

### State Management
- Use local state when possible
- Lift state only when necessary
- Consider context for shared state
- Use reducers for complex state logic
- External state libraries (Zustand, Jotai) for global state

### Data Fetching
- Use React Query/TanStack Query for server state
- Implement loading and error states
- Cache data appropriately
- Handle race conditions

## Code Organization

```
src/
  components/
    common/         # Reusable components
    layout/         # Layout components
  features/         # Feature-based modules
    [feature]/
      components/
      hooks/
      utils/
      types.ts
  hooks/            # Shared custom hooks
  utils/            # Utility functions
  types/            # Shared types
```

## Best Practices

### Props & Types
```typescript
// Define clear prop interfaces
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick: () => void;
  children: React.ReactNode;
}

// Use destructuring with defaults
export function Button({ 
  variant = 'primary', 
  size = 'md',
  onClick,
  children 
}: ButtonProps) {
  return <button>{children}</button>;
}
```

### Custom Hooks
```typescript
// Extract reusable logic
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle] as const;
}
```

### Performance Optimization
```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => 
  computeExpensiveValue(data), 
  [data]
);

// Memoize callbacks passed to children
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);

// Memoize components when needed
const MemoizedComponent = React.memo(Component);
```

### Error Handling
```typescript
// Use Error Boundaries
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## Anti-Patterns to Avoid

- Don't mutate state directly
- Avoid unnecessary useEffect
- Don't use index as key in lists
- Avoid prop drilling (use context or composition)
- Don't define components inside other components
- Avoid inline object/array literals in JSX props
- Don't forget dependency arrays in useEffect/useCallback/useMemo

## Testing

- Write tests for critical user flows
- Test component behavior, not implementation
- Use React Testing Library
- Mock external dependencies
- Test error states and edge cases

## Accessibility

- Use semantic HTML
- Provide alt text for images
- Implement keyboard navigation
- Use ARIA attributes appropriately
- Ensure color contrast meets WCAG standards

Remember: Write components that are easy to understand, test, and maintain. Optimize for readability first, performance second.
