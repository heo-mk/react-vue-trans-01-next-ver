import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getConcept, getConceptsByAxis } from '@/content/index';
import { ConceptView } from '@/components/content/ConceptView';

export async function generateStaticParams() {
  const concepts = getConceptsByAxis('nuxt-next');
  return concepts.map((c) => ({
    concept: c.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ concept: string }>;
}): Promise<Metadata> {
  const { concept: slug } = await params;
  const concept = getConcept('nuxt-next', slug);
  if (!concept) return { title: '개념을 찾을 수 없습니다' };

  return {
    title: `${concept.title} | React ↔ Vue 전환 학습 가이드`,
    description: concept.oneLineSummary,
  };
}

export default async function NuxtNextConceptPage({
  params,
}: {
  params: Promise<{ concept: string }>;
}) {
  const { concept: slug } = await params;
  const concept = getConcept('nuxt-next', slug);

  if (!concept) {
    notFound();
  }

  return <ConceptView concept={concept} />;
}
