---
name: release
description: Prepare and execute ssr-themes releases using the repo's GitHub release workflow and version-tag rules.
---

## What I do

- Guide release prep for this repo's npm package and GitHub release flow.
- Verify the package version in `ssr-themes/package.json` matches the intended tag `v<version>`.
- Follow the repo's release workflow in `.github/workflows/release.yml`.
- Use the repo's standard validation steps before release when changes affect package behavior:
  - `bun run test`
  - `bun run check-format`
  - `bun run check-types`
  - `bun run test:e2e`
  - `bun run build`
- Create or suggest the correct `gh release create` command for a new version.
- Warn if the requested release already exists or if the tag/version do not match.

## When to use me

Use this skill when preparing, validating, or kicking off a new `ssr-themes` release.

## Repo-specific release rules

- Releases are published from GitHub Releases, not from a direct local `npm publish`.
- The release tag must exactly match the package version as `v<version>`.
- The package version lives in `ssr-themes/package.json`.
- The publishing workflow is `.github/workflows/release.yml`.
- The workflow publishes from `ssr-themes/` after verification passes.
- Do not create a release for an already-published tag unless the user explicitly wants to rerun the workflow.

## Default workflow

1. Check the current branch and workspace state.
2. Switch to `main` and pull the latest `origin/main` if the user asked to release from main.
3. Read `ssr-themes/package.json` and determine the target tag `v<version>`.
4. Check whether that git tag and GitHub Release already exist.
5. If no new version exists yet, ask for or prepare the version bump before release.
6. Run the repo's verification commands when appropriate.
7. Create the GitHub Release with `gh release create v<version> --target main`.
8. Report the release URL and any follow-up verification status.

## Ask when blocked

Ask one focused question if:

- the user wants a release but no new version has been chosen,
- the worktree has unrelated changes that could affect release prep,
- or the requested action would rerun an existing release instead of creating a new one.
