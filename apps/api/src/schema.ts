export const typeDefs = `#graphql
  enum Axis {
    REACT_VUE
    VUE2_VUE3
    NUXT_NEXT
  }

  enum Side {
    LEFT
    RIGHT
  }

  enum ListType {
    ORDERED
    BULLET
  }

  type PlainText {
    value: String!
  }

  type StructuredItem {
    term: String
    desc: String!
  }

  type StructuredContent {
    lead: String
    listType: ListType!
    items: [StructuredItem!]!
    closing: String
  }

  union FormattedContent = PlainText | StructuredContent

  type ComparisonCellItems {
    lead: String
    items: [String!]!
  }

  union ComparisonCellContent = PlainText | ComparisonCellItems

  type ComparisonRow {
    label: String!
    left: ComparisonCellContent
    right: ComparisonCellContent
    common: ComparisonCellContent
  }

  type CodeHighlight {
    side: Side!
    match: String!
    id: Int!
  }

  type KeyPoint {
    id: Int!
    title: String!
    left: String!
    right: String!
  }

  type CodeExample {
    label: String!
    version: String!
    leftCode: String!
    rightCode: String!
    sourceProject: String
    highlights: [CodeHighlight!]
    keyPoints: [KeyPoint!]
  }

  type Pitfall {
    question: String!
    answer: FormattedContent!
  }

  type Source {
    label: String!
    url: String!
  }

  type AxisInfo {
    axis: Axis!
    title: String!
    subtitle: String!
    description: String!
    badge: String!
    leftFramework: String!
    rightFramework: String!
  }

  type Concept {
    slug: String!
    axis: Axis!
    title: String!
    cardTitle: String!
    cardSubtitle: String
    cardSummary: String!
    oneLineSummary: String!
    keywords: [String!]!
    analogy: FormattedContent
    comparisonNote: String
    comparisonTable: [ComparisonRow!]!
    codeExamples: [CodeExample!]!
    diagramId: String
    pitfalls: [Pitfall!]!
    sources: [Source!]!
    sourceNote: String
  }

  type Query {
    axes: [AxisInfo!]!
    concepts(axis: Axis): [Concept!]!
    concept(axis: Axis!, slug: String!): Concept
    search(query: String!): [Concept!]!
  }
`;
