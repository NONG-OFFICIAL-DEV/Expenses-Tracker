# Expense Tracker — repo rules

`apps/api` and `apps/web` are independent standalone npm projects (own `package.json` / `package-lock.json` / `node_modules` — not a workspace/monorepo tool). See `DEPLOYMENT.md` for the stack and deploy flow.

## Whenever you add, remove, or upgrade a dependency

CI and the Docker builds run `npm ci`, which fails hard if `package-lock.json` doesn't exactly match `package.json`. This has broken the pipeline multiple times (missing `@emnapi/*` entries, etc.) because a dependency was added to `package.json` without regenerating the lockfile.

Every time you edit a `package.json` dependency (adding a new UI library, icon set, form component, etc.):

1. Run `npm install` inside that same app directory (`apps/api` or `apps/web`) — never hand-edit `package-lock.json`.
2. Verify it's actually in sync before committing: `rm -rf node_modules && npm ci` should succeed cleanly in that directory.
3. Commit `package.json` and `package-lock.json` together in the same commit.

Do this in **whichever app you touched** — the two lockfiles are independent, so adding a package to `apps/web` never requires touching `apps/api`'s lockfile, and vice versa.
