export const AXES_QUERY = /* GraphQL */ `
  query AxesQuery {
    axes {
      axis
      title
      subtitle
      description
      badge
      leftFramework
      rightFramework
    }
  }
`;

export const CONCEPT_CARDS_QUERY = /* GraphQL */ `
  query ConceptCardsQuery($axis: Axis) {
    concepts(axis: $axis) {
      axis
      slug
      title
      cardTitle
      cardSubtitle
      cardSummary
      oneLineSummary
    }
  }
`;

export const CONCEPT_PARAMS_QUERY = /* GraphQL */ `
  query ConceptParamsQuery($axis: Axis!) {
    concepts(axis: $axis) {
      axis
      slug
      title
      oneLineSummary
    }
  }
`;

export const FORMATTED_CONTENT_FRAGMENT = /* GraphQL */ `
  fragment FormattedContentFields on FormattedContent {
    __typename
    ... on PlainText {
      value
    }
    ... on StructuredContent {
      lead
      listType
      items {
        term
        desc
      }
      closing
    }
  }
`;

export const COMPARISON_CELL_FRAGMENT = /* GraphQL */ `
  fragment ComparisonCellFields on ComparisonCellContent {
    __typename
    ... on PlainText {
      value
    }
    ... on ComparisonCellItems {
      lead
      items
    }
  }
`;

export const CONCEPT_DETAIL_QUERY = /* GraphQL */ `
  ${FORMATTED_CONTENT_FRAGMENT}
  ${COMPARISON_CELL_FRAGMENT}

  query ConceptDetailQuery($axis: Axis!, $slug: String!) {
    concept(axis: $axis, slug: $slug) {
      slug
      axis
      title
      cardTitle
      cardSubtitle
      cardSummary
      oneLineSummary
      keywords
      diagramId
      comparisonNote
      sourceNote
      analogy {
        ...FormattedContentFields
      }
      comparisonTable {
        label
        common {
          ...ComparisonCellFields
        }
        left {
          ...ComparisonCellFields
        }
        right {
          ...ComparisonCellFields
        }
      }
      codeExamples {
        label
        version
        leftCode
        rightCode
        sourceProject
        highlights {
          id
          side
          match
        }
        keyPoints {
          id
          title
          left
          right
        }
      }
      pitfalls {
        question
        answer {
          ...FormattedContentFields
        }
      }
      sources {
        label
        url
      }
    }
  }
`;
