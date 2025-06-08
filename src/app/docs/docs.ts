// src/lib/docs.ts
import fs from 'fs';
import path from 'path';

export type DocPage = {
  slug: string[];
};

const docsDir = path.join(process.cwd(), 'src/app/docs/(content)');

function getAllFiles(dir: string, base: string[] = []): string[][] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return getAllFiles(entryPath, [...base, entry.name]);
    } else if (entry.name.endsWith('.tsx')) {
      return [[...base, entry.name.replace(/\.tsx$/, '')]];
    } else {
      return [];
    }
  });
}

export function getAllDocs(): DocPage[] {
  const slugs = getAllFiles(docsDir);
  return slugs.map(slug => {
    return {
      slug,
    };
  });
}
