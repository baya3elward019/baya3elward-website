// @ts-check
import { defineConfig } from 'astro/config';
import rehypeBase from './src/lib/rehype-base.mjs';

/**
 * The site works on GitHub Pages without editing anything here.
 *
 * - Repo named  <user>.github.io      -> site at https://<user>.github.io/
 * - Any other repo name (e.g. my-site) -> site at https://<user>.github.io/my-site/
 *
 * GitHub Actions provides GITHUB_REPOSITORY / GITHUB_REPOSITORY_OWNER automatically.
 * If you connect a custom domain later, set SITE_URL and SITE_BASE="/" in
 * .github/workflows/deploy.yml (see README).
 */
const owner = process.env.GITHUB_REPOSITORY_OWNER;
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isUserSite = !!repo && !!owner && repo.toLowerCase() === `${owner.toLowerCase()}.github.io`;

const base = process.env.SITE_BASE || (repo && !isUserSite ? `/${repo}` : '/');
const site = process.env.SITE_URL || (owner ? `https://${owner.toLowerCase()}.github.io` : 'http://localhost:4321');

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      wrap: false,
    },
    rehypePlugins: [[rehypeBase, { base }]],
  },
});
