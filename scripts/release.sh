#!/bin/bash

# Release script for Japanese Slack Tauri app
# Usage: ./scripts/release.sh v0.2.0

set -e

VERSION="${1:?Version required (e.g., v0.2.0)}"

# Validate version format
if ! [[ "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$ ]]; then
    echo "Invalid version format. Expected: v0.2.0 or v0.2.0-beta"
    exit 1
fi

echo "Releasing version: $VERSION"

# Update package.json
echo "Updating package.json..."
npm version "$VERSION" --no-git-tag-version

# Update Cargo.toml
echo "Updating src-tauri/Cargo.toml..."
CARGO_VERSION="${VERSION#v}"  # Remove 'v' prefix
sed -i '' "s/^version = \".*\"/version = \"$CARGO_VERSION\"/" src-tauri/Cargo.toml

# Commit changes
git add package.json package-lock.json src-tauri/Cargo.toml
git commit -m "chore: bump version to $VERSION"

# Create git tag
echo "Creating git tag: $VERSION"
git tag -a "$VERSION" -m "Release $VERSION"

echo ""
echo "Ready to release! Run:"
echo "  git push origin main"
echo "  git push origin $VERSION"
echo ""
echo "The GitHub Actions workflow will automatically build and release when the tag is pushed."
