# Quick Release Guide

## One-Command Release

To release a new version:

```bash
./scripts/release.sh v0.2.0 && git push origin main && git push origin v0.2.0
```

## What Happens Automatically

1. ✅ Builds for both ARM64 (Apple Silicon) and x86_64 (Intel)
2. ✅ Creates DMG installers for both architectures
3. ✅ Uploads to GitHub Releases automatically
4. ✅ Users can download from the Releases page

## Version Examples

- `v0.1.0` - First release
- `v0.2.0` - Feature update
- `v0.2.1` - Bug fix
- `v1.0.0` - Major release

## Monitor Progress

Watch the workflow at: https://github.com/YOUR_USERNAME/japanaese-slack/actions

---

For detailed information, see [RELEASE.md](../../RELEASE.md)
