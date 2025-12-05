# Release Guide

This document explains how to release the Japanese Slack Tauri app.

## Automated Release Process

The project uses GitHub Actions to automatically build and release the macOS app when you push a version tag.

### How It Works

1. **Build Workflow** (`build.yml`): Automatically runs on every push to `main` and on pull requests
   - Builds for both ARM64 (Apple Silicon) and x86_64 (Intel)
   - Uploads artifacts for inspection

2. **Release Workflow** (`release.yml`): Automatically runs when you push a version tag
   - Builds the final release for both architectures
   - Uploads DMG files to GitHub Releases
   - Generates release notes

## Releasing a New Version

### Step 1: Update Version

Use the provided release script:

```bash
chmod +x scripts/release.sh
./scripts/release.sh v0.2.0
```

This script will:
- Update `package.json` version
- Update `src-tauri/Cargo.toml` version
- Create a git commit with version bump
- Create a git tag

### Step 2: Push to GitHub

```bash
git push origin main
git push origin v0.2.0
```

### Step 3: Watch the Workflow

Go to **Actions** tab on GitHub to monitor the build. The workflow will:
1. Build for ARM64 and x86_64
2. Create DMG installers
3. Upload them to a GitHub Release

## Manual Version Update (Alternative)

If you prefer to update versions manually:

1. Update `package.json`:
   ```json
   {
     "version": "0.2.0"
   }
   ```

2. Update `src-tauri/Cargo.toml`:
   ```toml
   [package]
   version = "0.2.0"
   ```

3. Commit and tag:
   ```bash
   git add package.json src-tauri/Cargo.toml
   git commit -m "chore: bump version to v0.2.0"
   git tag -a v0.2.0 -m "Release v0.2.0"
   git push origin main
   git push origin v0.2.0
   ```

## Release Artifacts

Each release generates:
- `japanese-slack-temp_0.2.0_aarch64.dmg` - For Apple Silicon (M1, M2, etc.)
- `japanese-slack-temp_0.2.0_x86_64.dmg` - For Intel Macs

Both are uploaded to the GitHub Release page for users to download.

## Version Format

Use semantic versioning: `vMAJOR.MINOR.PATCH`

Examples:
- `v0.1.0` - Initial release
- `v0.2.0` - Minor feature update
- `v0.2.1` - Bug fix
- `v1.0.0` - Major release

## Troubleshooting

### Build fails in GitHub Actions

1. Check the workflow logs in the Actions tab
2. Common issues:
   - Node.js cache issues: Delete cache in Actions settings
   - Rust toolchain: Ensure you have latest Rust installed locally
   - Missing environment variables: Check that API keys aren't needed in build

### Release doesn't appear

1. Verify the tag was pushed: `git tag -l`
2. Check Actions workflow status
3. Ensure tag format matches `v*` pattern

### Generated wrong tag

If you created a tag by mistake:

```bash
git tag -d v0.2.0            # Delete local tag
git push origin :v0.2.0      # Delete remote tag
```

Then try again.

## Environment Variables

The app currently has the Gemini API key hardcoded. For future releases:
1. Move API key to `.env` file
2. Add to GitHub Actions secrets if needed for builds
3. Update build workflow if necessary

See `src-tauri/src/translation.rs` for current API key location.
