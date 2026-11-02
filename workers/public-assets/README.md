# Public portfolio images

This Worker serves public images from the private `nrflabs-portfolio-media-prod` R2 bucket at `https://assets.naufalrf.net`.

The allowlist is intentionally limited to GET/HEAD requests for image objects under `about/`, `projects/`, and `achievements/`. The Worker does not list the bucket, and `resumes/` remains private. Public API responses map eligible image keys to this hostname; database values remain canonical storage keys or legacy URLs for Admin normalization.

Deploy from this directory with the Admin repository's Wrangler installation:

```sh
../../node_modules/.bin/wrangler deploy --config wrangler.toml
```

Before releasing changes, verify one known image key, a missing object, a `resumes/` path, an unsupported method, and a traversal path.
