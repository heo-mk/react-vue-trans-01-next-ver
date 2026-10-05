import type { ComparisonCellContent, FormattedContent } from '@repo/schema';

export function getComparisonCellPlainText(cell: ComparisonCellContent | undefined): string {
  if (!cell) return '';
  if (typeof cell === 'string') return cell;
  const parts: string[] = [];
  if (cell.lead) parts.push(cell.lead);
  if (cell.items && cell.items.length > 0) parts.push(...cell.items);
  return parts.join(' ');
}

export function getContentPlainText(content: FormattedContent | undefined): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  const parts: string[] = [];
  if (content.lead) parts.push(content.lead);
  for (const item of content.items) {
    if (item.term) parts.push(item.term);
    if (item.desc) parts.push(item.desc);
  }
  if (content.closing) parts.push(content.closing);
  return parts.join(' ');
}
