# Content Structure

## Source-Of-Truth Rule

The book PDF is the source of truth. Every generated chapter must map back to original chapter and section locations. If a concept is inferred from surrounding content rather than directly identified, label it as an inference.

## Book Model

Use a structured data model:

```js
{
  metadata: {
    title,
    subtitle,
    authors,
    language,
    edition,
    sourcePdf,
    diagnosis
  },
  parts: [
    { id, title, originalTitle, chapterIds, summary }
  ],
  chapters: [
    {
      id,
      slug,
      number,
      title,
      originalTitle,
      pageStart,
      pageEnd,
      partId,
      summary,
      coreProblem,
      learningGoals,
      prerequisites,
      positionInBook,
      difficulty,
      estimatedTime,
      sections,
      concepts,
      formulas,
      terms,
      misconceptions,
      examples,
      applications,
      relationships,
      keyTakeaways,
      checklist,
      feynmanPrompts,
      modernExtensions
    }
  ],
  formulas: [],
  terms: [],
  learningPaths: [],
  graphEdges: []
}
```

## Chapter Section Fields

For every original section:

```js
{
  number,
  title,
  pageStart,
  pageEnd,
  readingMode: "精读" | "略读" | "通读",
  why,
  mappedConceptIds
}
```

## Concept Fields

Every concept must include:

- original location: chapter/section/page where possible
- original problem: what the book is solving here
- plain-language explanation
- math or formal expression if applicable
- example or analogy
- relationship to other concepts in the same chapter
- relationship to later chapters
- common misconception
- Feynman prompt

Template:

```js
{
  id,
  title,
  originalLocation,
  originalProblem,
  intuition,
  formalExpression,
  example,
  relationsWithinChapter,
  relationsLater,
  misconception,
  feynmanPrompt,
  source: "原书核心" | "补充理解" | "现代延伸"
}
```

## Formula Fields

```js
{
  id,
  name,
  latex,
  chapter,
  section,
  symbols,
  intuition,
  useCase,
  commonMistake,
  relatedConcepts,
  source
}
```

## Term Fields

```js
{
  id,
  zh,
  en,
  chapter,
  section,
  shortDefinition,
  bookContext,
  relatedTerms,
  highFrequency,
  source
}
```

## Learning Path Fields

```js
{
  id,
  title,
  audience,
  sequence,
  skipAdvice,
  estimatedTime,
  stageGoals
}
```

## Relationship Graph

Generate graph edges only when there is a real dependency or conceptual relationship:

```js
{ fromChapter, toChapter, relation, reason }
```

Avoid decorative graphs with arbitrary links.

## Reading Priority Rules

Mark `精读` when a section:

- introduces a central concept
- contains definitions reused later
- contains key formulas or derivations
- connects multiple chapters
- is likely to cause misunderstanding

Mark `略读` when a section:

- is historical background
- is optional implementation detail
- is a catalog of examples
- is less relevant to the user's confirmed goal

Never mark sections as skippable if they are prerequisites for later core chapters.
