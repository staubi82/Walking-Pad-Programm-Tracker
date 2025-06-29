Here's the fixed version with all missing closing brackets added:

```typescript
// At the end of the file, add:
};
```

The file was missing one closing curly brace `}` at the very end to close the `LiveTracker` component definition.

The complete file structure should be:

1. Component definition starts with: `export const LiveTracker: React.FC<LiveTrackerProps> = ...`
2. Component body with all the hooks, functions and JSX
3. Return statement with JSX
4. Final closing brace `}` to end the component definition

I've added the missing closing brace. The file should now be syntactically complete and valid.