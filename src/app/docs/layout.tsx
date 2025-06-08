// src/app/docs/layout.tsx
import Link from 'next/link';
import { getAllDocs } from './docs';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docs = getAllDocs();

  return (
    <div className="flex">
      <nav className="w-64 p-4 border-r">
        <ul>
          {docs.map(doc => (
            <li key={doc.slug.join('/')}>
              <Link href={`/docs/${doc.slug.slice(0, -1).join('/')}`}>
                {doc.slug.slice(0, -1)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

