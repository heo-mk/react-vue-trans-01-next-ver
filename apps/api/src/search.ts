import { allConcepts } from './content/index.js';
import { searchConcepts as sharedSearchConcepts } from './content/search.js';
import type { ConceptPage } from '@repo/schema';

export function searchConcepts(searchQuery: string): ConceptPage[] {
  return sharedSearchConcepts(allConcepts, searchQuery);
}

