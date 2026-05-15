# Onboarding Flow

## Goal

Use AI-tutor-style onboarding. The user should provide the book PDF, not fill a long form. First analyze the book, then recommend a configuration, then wait for confirmation.

## Step 1: PDF Understanding

Inspect the PDF in this order:

1. Metadata and filename for title/author clues.
2. PDF outline/bookmarks.
3. Table of contents.
4. Preface, introduction, or "how to use this book" sections.
5. One early representative chapter.
6. One middle representative chapter.
7. One late representative chapter.
8. Formula/table/figure density from sampled pages.

If the PDF has no outline, extract table-of-contents pages and infer chapter boundaries conservatively. Clearly state uncertainty.

## Book Diagnosis Output

Return a short analysis with:

- title, author, language
- structure: parts, chapters, sections
- book type: theory, practice, tool/reference, exam, research, or mixed
- learner profile
- density: low/medium/high
- formula load
- figure/table/case load
- likely hard chapters
- suitable interaction modules
- whether modern extension is appropriate
- recommended reading rhythm

## Recommendation Logic

Choose learning goal:

- `系统读书`: default for concept-heavy textbooks.
- `考试复习`: if chapters contain exercises, definitions, theorem-like material, or exam signals.
- `面试准备`: if content maps to industry concepts and common interview topics.
- `项目实践`: if book is tool/framework/project oriented.
- `研究入门`: if book is theory/research-paper oriented.
- `快速扫盲`: if user asks for speed or book is introductory.
- `长期知识库`: if book is broad, reference-like, or the user wants durable memory.

Choose content depth:

- `入门版`: fewer formulas, more analogies, for dense books and beginner users.
- `标准版`: default; concepts + formulas + applications + checks.
- `深度版`: for mathematical/research books; include derivation map and chapter relationships.
- `面试版`: for applied CS/ML/business books; include high-frequency questions and traps.

Choose page structure:

- `严格按章节划分`: default for textbooks and original-book reading.
- `按主题划分`: only if the book itself is topic/reference oriented.
- `按学习路径划分`: for non-linear reference books.
- `章节 + 主题混合`: when strict reading and later retrieval are both important.

Choose interaction modules:

- Formula cards: formula-heavy books.
- Concept flip cards: definition-heavy books.
- Knowledge graph: books with strong dependency structure.
- Progress/checklists: always useful for long books.
- Self-tests: exam/interview/concept books.
- Interactive visualizations: math, ML, physics, algorithms, statistics, finance, systems.
- Timeline: history, strategy, biography, social science.
- Comparison tables: taxonomy-heavy books.
- Feynman restatement: default for long-term learning.

Choose modern extension strategy:

- `不加入现代延伸`: if the book is current, historical, literary, or exam-bound.
- `章节末尾补充理解`: if small clarifications help reading.
- `独立现代延伸页`: if the field has moved substantially after the book.
- `只在必要时补充`: default for most books.

## Confirmation Panel

Always show:

```text
默认推荐：
- 学习目标：
- 内容深度：
- 页面结构：
- 交互模块：
- 视觉风格：
- 现代延伸：
- 记忆储存：

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

Do not generate full site code before the user confirms.

## If The User Wants No Questions

If the user explicitly says "直接生成" or "不要问我", use the default recommendation and state that assumption before implementation.
