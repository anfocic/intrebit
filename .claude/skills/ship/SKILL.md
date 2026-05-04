---
name: ship
description: Review, build-check, commit, and optionally push the current changes.
disable-model-invocation: true
---

# Ship Pipeline

Follow these steps in strict order. **Stop immediately if any step fails.**

## Step 1: Pre-flight

Run `git diff --stat HEAD` to see what changed. If there are no changes, tell the user "Nothing to ship" and stop.

## Step 2: Review

Launch the **code-reviewer** agent to review all uncommitted changes. Wait for the result.

- If the verdict is **PASS**: proceed to Step 3.
- If **FAIL with CRITICAL issues**: report the issues to the user and stop. Do NOT proceed.
- If **FAIL with only WARNING/INFO**: report the issues to the user but proceed to Step 3.

## Step 3: Build check

Launch the **build-checker** agent to run `npm run build`. Wait for the result.

- If build passes: proceed to Step 4.
- If build fails: report errors and stop. Do NOT commit broken code.

## Step 4: Commit

1. Stage all changed files (use specific file names from the diff, not `git add -A`)
2. Generate a concise commit message based on the changes
3. Create the commit

## Step 5: Push (ask first)

Ask the user: "Push to remote?" — only push if they confirm.

## Rules

- Never skip the review or build-check steps
- Never force-push
- Never commit if build fails
- Report each step's result as you go so the user sees progress
