# My Boilerplate Meteor React

A minimal boilerplate for building web applications with Meteor and React.

## Features

- **Meteor** - Full-stack JavaScript platform
- **React 18** - Modern UI library
- **Automated Versioning** - Semantic-release with conventional commits
- **Code Quality** - ESLint and Prettier
- **Logging** - Winston logger for server

## Getting Started

```bash
# Install dependencies
meteor npm install

# Run development server
npm start

# Run linter
npm run lint
```

## Versioning

This project uses semantic-release with conventional commits for automated versioning.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

- `feat:` - New feature (triggers **minor** version bump: 1.1.0)
- `fix:` - Bug fix (triggers **patch** version bump: 1.0.1)
- `docs:` - Documentation changes (no version bump)
- `style:` - Code style changes (no version bump)
- `refactor:` - Code refactoring (no version bump)
- `perf:` - Performance improvements (triggers **patch** version bump)
- `test:` - Adding or updating tests (no version bump)
- `chore:` - Maintenance tasks (no version bump)
- `ci:` - CI/CD changes (no version bump)

### Breaking Changes

To trigger a **major** version bump (2.0.0), include `BREAKING CHANGE:` in the commit footer:

```
feat: new authentication system

BREAKING CHANGE: authentication API has changed
```

Or use `!` after the type:

```
feat!: new authentication system
```

### Examples

```bash
# Patch release (1.0.0 -> 1.0.1)
git commit -m "fix: resolve login issue"

# Minor release (1.0.0 -> 1.1.0)
git commit -m "feat: add user profile page"

# Major release (1.0.0 -> 2.0.0)
git commit -m "feat!: redesign API endpoints"
```
