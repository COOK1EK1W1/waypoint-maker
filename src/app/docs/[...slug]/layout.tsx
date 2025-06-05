// src/app/docs/layout.tsx
import { getAllDocs } from '../docs';
import Link from 'next/link';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docs = getAllDocs();
  console.log(docs)

  return (
    <div className="flex">
      <nav className="w-64 p-4 border-r">
        <ul>
          {docs.map(doc => (
            <li key={doc.slug.join('/')}>
              <Link href={`/docs/${doc.slug.join('/')}`}>
                {doc.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

