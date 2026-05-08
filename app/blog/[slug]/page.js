import { articles } from '@/lib/portfolio/data';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const article = articles.find((item) => item.slug === resolvedParams.slug);

  if (!article) return { title: 'Not found' };

  return {
    title: `${article.title.es} - Blog`,
    description: article.excerpt.es,
    openGraph: { images: [article.cover] },
  };
}

export default async function ArticlePage({ params }) {
  const resolvedParams = await params;
  const article = articles.find((item) => item.slug === resolvedParams.slug);

  if (!article) return notFound();

  const html = (article.content.es || '')
    .replace(/^# (.*)$/gm, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>')
    .replace(/^## (.*)$/gm, '<h2 class="text-2xl font-semibold mt-5 mb-3">$1</h2>')
    .replace(/\n\n/g, '<br/><br/>');

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/blog" className="text-cyan-300 text-sm hover:underline">
          ← Blog
        </Link>
        <div
          className="mt-4 w-full h-64 rounded-2xl bg-cover bg-center border border-white/10"
          style={{ backgroundImage: `url(${article.cover})` }}
        />
        <div className="mt-4 text-[11px] uppercase tracking-widest text-cyan-300">
          {article.category} · {new Date(article.date).toLocaleDateString('es-ES')} · {article.readingTime} min
        </div>
        <h1 className="mt-2 text-4xl font-bold">{article.title.es}</h1>
        <p className="mt-2 text-white/65">{article.excerpt.es}</p>
        <div className="mt-6 leading-relaxed text-white/85" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </main>
  );
}
