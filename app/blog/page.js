import { articles } from '@/lib/portfolio/data';
import Link from 'next/link';

export const metadata = {
  title: 'Blog — TechOps Desktop',
  description: 'Artículos sobre IT, Help Desk, automatización e IA por Carlos Diaz.',
};

export default function BlogIndex() {
  const list = articles.filter((a) => a.published);
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-cyan-300 text-sm hover:underline">← Desktop</Link>
        <h1 className="mt-4 text-4xl font-bold">Blog</h1>
        <p className="mt-2 text-white/65">IT, Help Desk, automatización e IA.</p>
        <div className="mt-10 space-y-6">
          {list.map((a) => (
            <article key={a.id} className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition">
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-cyan-300">
                <span>{a.category}</span>
                <span className="text-white/30">•</span>
                <time dateTime={a.date}>{new Date(a.date).toLocaleDateString('es-ES')}</time>
                <span className="text-white/30">•</span>
                <span className="text-white/60">{a.readingTime} min</span>
              </div>
              <h2 className="mt-2 text-2xl font-semibold">
                <Link href={`/blog/${a.slug}`} className="hover:text-cyan-200">{a.title.es}</Link>
              </h2>
              <p className="mt-2 text-white/70">{a.excerpt.es}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
