import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export async function generateStaticParams() {
  const files = fs.readdirSync(path.join((process as any).cwd(), 'content/guides'));
  return files.map((filename) => ({
    slug: filename.replace('.mdx', ''),
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const markdownWithMeta = fs.readFileSync(path.join((process as any).cwd(), 'content/guides', `${params.slug}.mdx`), 'utf-8');
  const { data } = matter(markdownWithMeta);
  return {
    title: data.title,
    description: data.description,
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const markdownWithMeta = fs.readFileSync(path.join((process as any).cwd(), 'content/guides', `${params.slug}.mdx`), 'utf-8');
  const { content, data } = matter(markdownWithMeta);

  return (
    <article className="max-w-3xl mx-auto py-12 px-6">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Search
      </Link>
      
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{data.title}</h1>
        <p className="text-xl text-slate-500 leading-relaxed">{data.description}</p>
      </header>
      
      <div className="prose prose-slate prose-lg max-w-none 
        prose-headings:text-slate-900 prose-headings:font-bold
        prose-a:text-blue-600 prose-img:rounded-xl
      ">
        <MDXRemote source={content} />
      </div>
    </article>
  );
}