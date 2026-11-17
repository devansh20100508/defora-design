# GitHub Setup Guide

## Create a repository

1. Create a new GitHub repository in the browser.
2. Name it something like `pixelforge-ai-editor`.
3. Do not initialize with a README if you already have one locally.
4. Use the remote URL from the new repository.

## Connect the local repo

```bash
git remote add origin https://github.com/<your-user>/<your-repo>.git
git branch -M main
git push -u origin main
```

## Authentication note

GitHub push requires valid authentication. If the machine does not have a configured GitHub credential helper or SSH key, the push will fail until authentication is configured.

## Recommended repo contents

- README.md
- docs/
- src/
- package.json
- public assets if added later

This keeps the repository organized and easy for teammates or recruiters to review.
