# Contributing to Candy CLI

First off, thank you for taking the time to contribute! 🎉

## How to Contribute

### Reporting Bugs
1. Search [existing issues](../../issues) to make sure it hasn't been reported.
2. Open a new issue with a clear title, description, and steps to reproduce.

### Suggesting Features
Open an issue with the `enhancement` label. Describe the feature, its use case, and any alternatives you've considered.

### Submitting Pull Requests

1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b feat/my-new-feature
   ```

2. **Install** dependencies:
   ```bash
   npm install
   ```

3. **Make your changes.** Ensure they follow the project structure:
   - New features belong in `src/features/`
   - New CLI commands belong in `src/commands/`
   - Templates are EJS files in `templates/`

4. **Add tests** in the `test/` folder for any new logic.

5. **Run the test suite** and make sure all tests pass:
   ```bash
   npm test
   ```

6. **Commit** with a clear, descriptive message (we loosely follow [Conventional Commits](https://www.conventionalcommits.org/)):
   ```
   feat: add Redis Cluster support
   fix: handle missing app.module.ts gracefully
   docs: update README with gRPC example
   ```

7. **Open a Pull Request** against the `main` branch. Fill in the PR template.

## Project Structure

```
src/
├── index.ts          # CLI entry point
├── constants.ts      # Shared constants
├── commands/         # init, add command handlers
├── features/         # Modular feature definitions
├── generator/        # Engine, AST utils, compose utils
└── prompts/          # Interactive prompt definitions
test/                 # Jest unit tests
templates/            # EJS templates for generated code
```

## Development Setup

```bash
# Install dependencies
npm install

# Watch mode (recompile on change)
npm run dev

# Run all tests
npm test

# Build for production
npm run build
```

## Code Style

- TypeScript strict mode is enabled — no `any` unless absolutely necessary.
- All new features must have at least one unit test.
- Keep feature files small and focused — each feature in `src/features/` should do one thing.
