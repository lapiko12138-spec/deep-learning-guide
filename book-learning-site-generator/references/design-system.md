# Design System

## Default Aesthetic

Use a restrained documentation/product style:

- Notion: calm document hierarchy and whitespace.
- Linear: crisp borders, subtle surfaces, focused panels.
- Vercel Docs: strong navigation and code/formula readability.
- Apple Developer: polished typography and low visual noise.

## Layout

Required:

- left sidebar chapter navigation
- sticky top search
- reading progress indicator
- responsive desktop and iPad-first layout
- mobile fallback with collapsible navigation
- dark mode

Avoid:

- marketing-style landing pages
- decorative blobs/orbs
- oversized cards inside cards
- gradients as the main visual identity
- visual effects that distract from reading

## Components

Use these components when relevant:

- Hero: book title, subtitle, author, recommended next action.
- Book map: parts/chapters/sections.
- Chapter card: title, summary, difficulty, time, keywords.
- Formula card: LaTeX, intuition, symbols, usage, mistakes.
- Term row/card: bilingual terms and source context.
- Concept card: original location, problem, explanation, formalism.
- Checklist: mastery checks.
- Feynman box: restatement input.
- Knowledge graph: dependency edges with labels.
- Progress panel: reading and checklist completion.
- Memory panel: local notes/review/favorites if enabled.

## Visual Tokens

Use a neutral palette:

- background: white / near-white
- surface: white
- soft surface: light gray
- text: near black
- muted text: slate gray
- accent: blue, green, or black depending on book
- warning: amber

Dark mode:

- background: near black
- surface: dark slate
- text: near white
- muted text: slate
- preserve accent contrast

## Typography

- Prefer system UI fonts.
- Use Chinese-friendly fallbacks such as `Noto Sans SC`.
- Keep letter spacing normal.
- Do not scale body font with viewport width.
- Use large type only for real heroes.
- Keep dense learning UI headings compact.

## Interactions

Keep interactions useful and quiet:

- hover lift: subtle
- transitions: 120-220ms
- scroll reveal: optional and restrained
- formula modals: focus on meaning, symbols, use cases
- visualizations: simple controls, clear caption, no playful styling

## Math And Code

- Use MathJax or KaTeX.
- Use Prism or highlight.js for code.
- Ensure formulas do not overflow their cards on tablet widths.
- Add horizontal scroll for long formulas.

## Persistence

If memory is enabled in a static site:

- use `localStorage`
- include export/import JSON
- clearly state that memory is local to the browser

If cloud sync is requested:

- recommend Supabase/Firebase/custom API
- add authentication and privacy considerations
- do not store user notes in GitHub Pages alone
