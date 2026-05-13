# Component Structure

This project is a no-build static site. Reusable UI is implemented as JavaScript render functions so every chapter can stay as an independent HTML entry while sharing one source of truth.

- `assets/js/book-data.js`: original-book-aligned data, formulas, chapter sections, reading priorities, concept summaries, routes, and graph edges.
- `assets/js/components.js`: layout, sidebar, search results, chapter cards, formula cards, chapter page sections, source comparison tables, and modal markup.
- `assets/js/visualizations.js`: native Canvas learning modules for linear algebra, Bayes, gradient descent, feedforward networks, convolution, and RNN unrolling.
- `assets/js/app.js`: page bootstrapping, dark mode, search, formula filtering, local reading progress, modals, MathJax, and icon hydration.
- `assets/css/styles.css`: global design system, responsive layout, dark theme, cards, tables, formulas, and visualization panels.

To deepen any chapter, edit the corresponding object in `assets/js/book-data.js`; the chapter page updates automatically.
