# The Noctis fixture

The SDK's browser tier builds this site with the Noctis profile registered and checks that its
code takes each palette's syntax theme, in light and in dark.

```ts
/** A greeting, by name. */
export function greet(name: string): string {
  const count = 2;
  return `Hello, ${name}, ${count} times`;
}
```

```sh
# Install the pins, then check.
mise run install && mise run check --verbose
```
