# Quality Checklist

## Source Alignment

- Chapter count matches PDF outline or table of contents.
- Part/chapter/section order matches the original book.
- Every chapter page has original chapter number and title.
- Every core concept has an original location.
- Modern or external material is labeled `补充理解` or `现代延伸`.
- No invented chapters, formulas, or claims are presented as original content.

## Content Quality

- Each chapter states the problem it solves.
- Explanations use plain language without losing correctness.
- Formulas include symbols, intuition, and use cases.
- Common misconceptions are specific, not generic.
- Key Takeaways are short and memorable.
- Reading checklist checks understanding, not trivia.
- Intensive/skim recommendations include reasons.

## Feynman Quality

- Each major concept includes a teach-back prompt.
- Each chapter includes a restatement area if memory is enabled.
- Self-tests ask the user to explain, connect, or apply concepts.
- Analogies support the original idea and do not replace it.

## Design Quality

- Layout is calm and readable.
- Navigation is clear on desktop and tablet.
- Text does not overflow cards or buttons.
- Formulas scroll or wrap safely.
- No incoherent overlap.
- Dark mode works.
- Cards are not nested inside decorative cards.

## Technical Quality

- All generated pages are reachable.
- Relative paths work from chapter subdirectories.
- JS passes syntax checks.
- CSS has no obvious broken selectors.
- Search returns chapters, formulas, and terms.
- Progress/checklist state persists if enabled.
- Export/import works if local memory is enabled.
- MathJax/KaTeX renders formulas.
- Code highlighting loads when code blocks exist.

## Browser Verification

When possible:

1. Start a local server.
2. Open homepage.
3. Open at least one chapter page.
4. Open formula page and glossary page.
5. Check one interactive module.
6. Check desktop width.
7. Check tablet width.
8. Confirm no horizontal overflow.
9. Confirm console has no serious runtime errors.

## Final Delivery

Tell the user:

- where the project was created
- how to run it
- which pages were generated
- what was verified
- any limitations or uncertain source extraction
- whether memory is local-only or cloud-synced
