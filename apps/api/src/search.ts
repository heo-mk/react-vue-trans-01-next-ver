import { allConcepts } from './content';
import { searchConcepts as sharedSearchConcepts } from './content/search';
import type { ConceptPage } from '@repo/schema';

export function searchConcepts(searchQuery: string): ConceptPage[] {
  return sharedSearchConcepts(allConcepts, searchQuery);
}

