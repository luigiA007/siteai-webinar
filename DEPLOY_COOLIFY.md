# Put the SiteAI webinar site on Coolify (*.paas-aii.forge99.com)

The site is plain static files. `Dockerfile` + `nginx.conf` in this folder turn it into a small nginx container that Coolify can build and run.

## Option 1: from a Git repository (recommended; updates are one click)
1. Put this folder's contents at the root of a Git repository (GitHub or GitLab). It can be private if Coolify has a GitHub App or deploy key for it.
2. In Coolify: Project → **+ New** → Resource → **Private Repository (GitHub App)** or **Public Repository** → pick the repo and branch.
3. Build pack: **Dockerfile** (Dockerfile location `/Dockerfile`). Ports exposed: **80**.
4. Domains: e.g. `https://siteai-webinar.paas-aii.forge99.com`. Coolify issues the HTTPS certificate.
5. **Deploy.** Health check: `/healthz` returns `ok`.

## Option 2: no Git
Coolify can also run the pre-built image if someone builds it on a machine with Docker:
`docker build -t siteai-webinar .` → push to a registry Coolify can pull from → New Resource → **Docker Image**.

## After it's live
- Open the site and the demos: `/`, `/brief/`, `/sites/radiance/`.
- The site is set to noindex (meta tag + X-Robots-Tag), so it stays out of search. Remove both if you ever want it indexed.
- Listing photos in the Radiance demo load from the MLS image host; they work on any normal web host.
- Updating: replace the files in the repo and click **Redeploy** (or turn on auto-deploy on push).
