import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getAxisMetaMap,
  getConceptParams,
  getConceptDetail,
} from '@/lib/graphql/loaders';
import { ConceptView } from '@/components/content/ConceptView';

const AXIS = 'react-vue';

export const dynamicParams = false;

export async function generateStaticParams() {
  const concepts = await getConceptParams(AXIS);
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
  const concept = await getConceptDetail(AXIS, slug);
  if (!concept) return { title: '개념을 찾을 수 없습니다' };

  return {
    title: `${concept.title} | React ↔ Vue 전환 학습 가이드`,
    description: concept.oneLineSummary,
  };
}

export default async function ReactVueConceptPage({
  params,
}: {
  params: Promise<{ concept: string }>;
}) {
  const { concept: slug } = await params;
  const [concept, axisMetaMap] = await Promise.all([
    getConceptDetail(AXIS, slug),
    getAxisMetaMap(),
  ]);

  if (!concept) {
    notFound();
  }

  return <ConceptView concept={concept} meta={axisMetaMap[AXIS]} />;
}
