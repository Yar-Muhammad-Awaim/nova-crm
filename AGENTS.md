# Agent Instructions & Guidelines

See [GEMINI.md](./GEMINI.md) for primary project instructions.

## Essential Constraints
- **Git Commits**: Under no circumstances should commit messages contain references to AI, assistant models, or AI co-author tags.
- **Data Integrity**: All AI-assisted extraction must be deterministically validated against the company's employee directory using Zod before database persistence.
- **Security**: Role-based access control must be verified server-side on every database query and server action.
