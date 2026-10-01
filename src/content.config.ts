import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/*
 * Content lives in src/content/* as Markdown files.
 * You normally edit it through Pages CMS (see README), not by hand.
 * The schemas are forgiving: empty fields left by the CMS are treated as "not set".
 */

const text = z.string().nullish().transform((v) => (v && v.trim() ? v.trim() : undefined));
const list = z
  .array(z.string().nullish())
  .nullish()
  .transform((v) => (v ?? []).filter((x): x is string => !!x && !!x.trim()).map((x) => x.trim()));
const flag = z.boolean().nullish().transform((v) => !!v);

const writeups = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writeups' }),
  schema: z.object({
    title: z.string(),
    description: text,
    date: z.coerce.date(),
    category: z
      .enum(['write-up', 'article', 'experiment', 'news'])
      .nullish()
      .transform((v) => v ?? 'write-up'),
    platform: text,
    difficulty: text,
    tags: list,
    cover: text,
    link: text,
    draft: flag,
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: text,
    date: z.coerce.date(),
    tags: list,
    cover: text,
    images: list,
    github: text,
    demo: text,
    featured: flag,
    draft: flag,
  }),
});

const certificates = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/certificates' }),
  schema: z.object({
    title: z.string(),
    issuer: z.string(),
    date: z.coerce.date(),
    image: text,
    link: text,
    draft: flag,
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gallery' }),
  schema: z.object({
    title: z.string(),
    image: z.string(),
    date: z.coerce.date(),
    caption: text,
    draft: flag,
  }),
});

export const collections = { writeups, projects, certificates, gallery };
