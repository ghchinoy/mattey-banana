## Project Style & UX Mandates

- **Stack Preference:** Favor **Lit WebComponents**, **Preact Signals**, and **Material 3** over heavy frameworks like React unless specified.
- **Accessibility (A11Y):** Rigorously use Material 3 design tokens (e.g., `--md-sys-color-surface`) for all custom containers. Ensure high-contrast ratios (WCAG 2.1) between text and backgrounds.
- **Expectation Management:** When implementing complex algorithms (like WASM tracing), clearly label UI outputs as "STUB" or "PLACEHOLDER" if the real logic is not yet complete.
- **WASM Workflow:** Always check host `wasm-bindgen` CLI version and match it exactly in `Cargo.toml`.
- **Branding:** Maintain the "Mattey Banana" branding and "AI to vector generator" tagline across all documentation and UI components.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

