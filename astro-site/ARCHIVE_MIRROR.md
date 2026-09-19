# Official archive mirror

The large `public/official_archives` tree is served from an R2 origin in production. Local development still reads the same files from `public`, while the GitHub Pages artifact is built from `.pages-public` and excludes that tree.

## Prepare and review

```sh
npm run archive:mirror:prepare
npm run archive:mirror:verify
npm run archive:mirror:upload -- --dry-run
```

The manifest is written to `.official-archive-dist/archive-mirror-manifest.json`. It records every non-empty object, MIME type, cache policy, size, critical entry page, and every excluded zero-byte source file. These commands do not use the network.

## Upload

Create a checksum manifest before a real upload:

```sh
npm run archive:mirror:prepare -- --hash
npm run archive:mirror:verify -- --hash
npm run archive:mirror:upload
```

The uploader requires `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and optionally `R2_BUCKET` and `R2_UPLOAD_CONCURRENCY`. It refuses to upload a manifest without SHA-256 checksums. Object keys preserve the `official_archives/...` paths used by the saved pages.

After upload, set `PUBLIC_ARCHIVE_MIRROR_BASE_URL` to the HTTPS R2 public origin or custom domain. The URL must be the root immediately above `official_archives/`.

## GitHub Pages

The deployment workflow uses the verified public R2 origin, runs `npm run pages:prepare`, and builds Astro with `ASTRO_PUBLIC_DIR=.pages-public`. The preparation step fails if the mirror URL is absent or invalid, preventing another oversized or broken Pages artifact from being deployed. Replace the workflow URL when moving the bucket to a custom domain.
