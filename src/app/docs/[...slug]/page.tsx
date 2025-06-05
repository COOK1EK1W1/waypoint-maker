
// src/app/docs/[...slug]/page.tsx
import { getAllDocs, getDocBySlug } from '@/app/docs/docs';
import { notFound } from 'next/navigation';
import { remark } from 'remark';
import html from 'remark-html';

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const doc = getDocBySlug((await params).slug);
  if (!doc) return notFound();

  const processed = await remark().use(html).process(doc.content);
  const contentHtml = processed.toString();

  return (
    <article className="prose max-w-none">
      <h1>{doc.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </article>
  );
}

export async function generateStaticParams() {
  const docs = getAllDocs();
  console.log(docs)
  return docs.map((x) => ({ slug: x.slug }))
}
