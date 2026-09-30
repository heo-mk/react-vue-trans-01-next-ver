import React, { Fragment } from 'react';

/**
 * 괄호 줄바꿈 규칙:
 * '(' 앞에서만 줄이 바뀌고 괄호 안은 한 덩어리(inline-block whitespace-nowrap)로 유지
 */
export function formatParentheses(text: string): React.ReactNode {
  if (!text || !text.includes('(')) {
    return text;
  }

  // 괄호 패턴: (내용) 매칭하여 분할 (캡처 그룹 포함)
  const parts = text.split(/(\([^)]+\))/g);

  return parts.map((part, index) => {
    if (part.startsWith('(') && part.endsWith(')')) {
      return (
        <span
          key={index}
          className="inline-block whitespace-nowrap"
          style={{
            wordBreak: 'keep-all',
            overflowWrap: 'normal',
          }}
        >
          {part}
        </span>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

export function FormattedTitle({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return <span className={className}>{formatParentheses(text)}</span>;
}
