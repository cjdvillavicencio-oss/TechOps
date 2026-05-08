import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'TechOps AI Agents',
  description:
    'Workspace OS centrado en agentes: selección de agente, chat contextual y experiencia desktop inmersiva.',
  keywords: ['AI Agents', 'Workspace OS', 'TechOps', 'Agents Mode', 'Next.js'],
  openGraph: {
    title: 'TechOps AI Agents',
    description: 'Agents Mode con interfaz desktop inmersiva.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: 'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);' }} />
      </head>
      <body className="bg-slate-950 text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
