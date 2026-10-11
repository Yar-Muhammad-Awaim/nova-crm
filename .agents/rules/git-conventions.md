# Git Commit Conventions & Author Identity Rules

## Hard Rules

1. **NEVER MENTION ASSISTANT OR AI IDENTITY**:
   - Under no circumstances should commit messages, commit descriptions, tags, branch names, or pull request text mention "AntiGravity", "Gemini", "Claude", "AI", "LLM", "bot", "assistant", or any AI model names.
   - Do NOT add `Co-Authored-By:` lines referencing AI, Anthropic, Google, OpenAI, or automated agents (e.g., do NOT add `Co-Authored-By: Claude ...` or `Co-Authored-By: AntiGravity ...`).

2. **Conventional Commit Standard**:
   - Follow standard conventional commits format:
     - `feat: <description>` for new features
     - `fix: <description>` for bug fixes
     - `refactor: <description>` for refactoring without behavior change
     - `style: <description>` for styling, design system, and UI/UX changes
     - `perf: <description>` for performance improvements
     - `test: <description>` for tests
     - `docs: <description>` for documentation updates
     - `chore: <description>` for maintenance and build tasks
   - Commit messages must be written in the imperative mood ("add", "update", "fix", not "added", "updates", "fixed").
   - Commit messages must describe the actual domain change and technical value clearly and concisely.
