# Code Standards

This project uses **Biome** for formatting and linting.

## Quick Reference

- **Check for issues**: `pnpm biome check`
- **Auto-fix**: `pnpm biome check --write`

Most issues are automatically fixable.

---

## Beyond Biome

Rules Biome can't catch.

### Code shape

- Use const assertions (`as const`) for immutable values and literal types
- Prefer early returns over nested conditionals
- Extract complex conditions into well-named boolean variables
- Prefer specific imports over namespace imports
