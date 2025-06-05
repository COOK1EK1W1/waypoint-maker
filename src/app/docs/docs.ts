// src/lib/docs.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export type DocPage = {
  slug: string[];
  title: string;
  content: string;
};

const docsDir = path.join(process.cwd(), 'src/app/docs/content');

function getAllFiles(dir: string, base: string[] = []): string[][] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return getAllFiles(entryPath, [...base, entry.name]);
    } else if (entry.name.endsWith('.md')) {
      return [[...base, entry.name.replace(/\.md$/, '')]];
    } else {
      return [];
    }
  });
}

export function getAllDocs(): DocPage[] {
  const slugs = getAllFiles(docsDir);
  return slugs.map(slug => {
    const filePath = path.join(docsDir, ...slug) + '.md';
    const file = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(file);
    return {
      slug,
      title: data.title ?? slug.join('/'),
      content,
    };
  });
}

export function getDocBySlug(slug: string[]): DocPage | null {
  try {
    const filePath = path.join(docsDir, ...slug) + '.md';
    console.log(filePath)
    const file = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(file);
    return {
      slug,
      title: data.title ?? slug.join('/'),
      content,
    };
  } catch {
    return null;
  }
}

