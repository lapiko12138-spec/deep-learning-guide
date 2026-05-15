---
name: book-learning-site-generator
description: Generate a book-specific learning guide website from a provided book PDF. Use when the user uploads or references a book PDF and wants a structured, original-book-aligned reading site, Feynman-style study platform, formula/term guide, chapter navigator, long-term learning dashboard, or reusable workflow for turning books into Notion/Linear/Vercel-style learning websites.
---

# Book Learning Site Generator

## Purpose

Create a high-quality learning website for one specific book PDF. The website must help the user read the original book, not replace it.

Always preserve the book's original structure, chapter order, terminology, and conceptual sequence. Use clearer explanations, Feynman-style prompts, visual structure, and interactive modules only to support reading.

## Core Rules

- Treat the PDF as the source of truth.
- Align pages to original parts, chapters, sections, and concepts.
- Do not invent chapters, concepts, formulas, or claims not supported by the book.
- Do not turn the output into a generic encyclopedia or broad course site.
- Mark anything outside the book as `补充理解` or `现代延伸`.
- Before generating full site code, first analyze the PDF and ask the user to confirm the recommended configuration.
- Prefer static, maintainable, data-driven sites unless the user asks for a framework.
- Verify the generated site in a browser when possible.

## Required Workflow

### 1. Understand The Book

Use the PDF skill when working with the book file. Inspect:

- PDF outline/bookmarks when available
- table of contents
- preface/introduction
- representative chapters from the beginning, middle, and end
- formula-heavy, figure-heavy, or case-heavy sections

Produce an initial book diagnosis:

- book title, author, language
- part/chapter/section structure
- knowledge density and learning difficulty
- formula, figure, table, exercise, and case-study ratio
- theory/practice/tool/reference/exam/research orientation
- suitable learners
- recommended study style and rhythm
- chapters to read carefully, skim, visualize, or convert to tables

For detailed onboarding behavior, read `references/onboarding-flow.md`.

### 2. Recommend A Configuration

Do not start full implementation yet. Recommend a default configuration with reasons:

- learning goal
- content depth
- page structure
- interaction modules
- visual style
- modern extension strategy
- persistence/memory strategy
- technology stack

Then show a compact confirmation panel:

```text
默认推荐：
- 学习目标：系统读书
- 内容深度：标准版
- 页面结构：严格按章节划分
- 交互模块：公式卡片 + 知识图谱 + 章节 checklist + 搜索
- 视觉风格：Notion + Linear
- 现代延伸：仅放在独立模块，不混入原书内容

请选择：
A. 直接使用推荐配置
B. 调整学习目标
C. 调整内容深度
D. 调整页面结构
E. 调整交互模块
F. 调整视觉风格
G. 调整现代延伸策略
H. 补充特殊要求
```

Wait for the user's confirmation before building the full site.

For recommendation logic, read `references/onboarding-flow.md`.

### 3. Build The Knowledge Structure

After confirmation, create a structured book model:

- metadata
- parts
- chapters
- sections
- concepts
- formulas
- terms
- learning paths
- dependency graph
- intensive/skim recommendations
- chapter relationships
- Feynman prompts

For the data model and required content fields, read `references/content-structure.md`.

### 4. Generate The Website

Generate a complete project with:

- homepage
- independent chapter pages
- formula reference page
- glossary page
- learning paths page
- modern extension page if enabled
- global CSS
- global JS
- reusable components
- site configuration/data files
- local learning memory if requested or useful

Every chapter page must include:

- original chapter number and title
- original section structure
- one-sentence summary
- the problem this chapter solves
- learning goals
- prerequisites
- this chapter's position in the book
- core concepts with original locations
- formulas and symbol explanations
- intuitive explanation
- examples or analogies
- common misconceptions
- relation to previous and future chapters
- Key Takeaways
- reading checklist
- Feynman restatement area when persistence is enabled

For templates, read `references/page-templates.md`.

### 5. Design The Interface

Default to a minimal, premium documentation style:

- Notion/Linear/Vercel Docs/Apple Developer inspiration
- white/light gray base with dark mode
- left chapter navigation
- top search
- reading progress
- restrained cards
- strong typography
- low-distraction reading
- responsive desktop and iPad layouts first

For design rules and component patterns, read `references/design-system.md`.

### 6. Apply Feynman Learning

Use Feynman learning as the content organization method, not as decorative copy:

- Ask what problem each concept solves.
- Explain with plain language after showing original location.
- Include "teach it back" prompts.
- Include misconception checks.
- Include short self-tests or checklist items.
- Encourage the user to write their own restatement after reading.

For details, read `references/feynman-learning-method.md`.

### 7. Validate Quality

Before delivery:

- Confirm all pages are reachable.
- Confirm chapter count matches the PDF outline/TOC.
- Confirm modern additions are clearly labeled.
- Run syntax checks for generated JS.
- Run local server and browser checks for layout when possible.
- Check no major horizontal overflow on desktop and tablet.
- Check formulas render when MathJax/KaTeX is used.
- Check interactive modules are nonblank and relevant.

For the full checklist, read `references/quality-checklist.md`.

## Recommended File Structure For Generated Sites

```text
book-guide-site/
├── index.html
├── formulas.html
├── glossary.html
├── learning-paths.html
├── modern-extensions.html
├── chapters/
│   └── chapter-01-*.html
├── assets/
│   ├── css/styles.css
│   └── js/
│       ├── book-data.js
│       ├── components.js
│       ├── app.js
│       └── visualizations.js
├── components/
│   └── README.md
├── README.md
└── .nojekyll
```

If the user wants Next.js or another framework, preserve the same conceptual data model and page requirements.

## Optional Utilities

Use `scripts/optional-generation-utils.js` for deterministic helper logic such as slugifying chapter names, estimating reading time, and generating basic config scaffolds. Patch it if project-specific needs arise.

Use `assets/starter-template/` only as a lightweight structural starter. Prefer adapting to the user's confirmed configuration rather than blindly copying the template.
