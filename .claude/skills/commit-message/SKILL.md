---
name: commit-message
description: Use this skill whenever creating, writing, or generating a git commit message, or any time the user says "commit", "git commit", "stage and commit", "push changes", or asks to save/finalize code changes to version control. Generates properly formatted commit messages by analyzing staged changes via git diff --staged. Always use before running any git commit command.
---

# Generating Commit Messages

## Process
1. Run `git diff --staged` to see all staged changes
2. Analyze what changed and why
3. Generate a commit message following the format below
4. Only then run `git commit`, always appending ` # via-skill` to the command so the project's PreToolUse hook allows it through. Example: `git commit -m "Add JWT auth middleware" #via-skill`

## Format

### Summary line (under 50 characters)
- Present tense imperative mood: "Add", "Fix", "Update", "Remove"
- Specific and descriptive — no generic messages

### Example
```
Add JWT authentication middleware
```

## Forbidden
- No "Generated with Claude Code"
- No "Co-Authored-By: Claude noreply@anthropic.com"
- No vague messages like "Update files" or "Fix issues"
- No Body in commit messages
