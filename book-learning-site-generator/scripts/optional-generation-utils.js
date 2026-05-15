function slugify(input) {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'untitled';
}

function chapterSlug(number, title) {
  return `chapter-${String(number).padStart(2, '0')}-${slugify(title)}`;
}

function estimateReadingTime(sectionCount, density = 'medium') {
  const base = Math.max(1, Number(sectionCount) || 1);
  const multiplier = { low: 0.5, medium: 0.8, high: 1.2, extreme: 1.6 }[density] || 0.8;
  const hours = Math.max(1, Math.round(base * multiplier));
  return `${hours}-${hours + 2} 小时`;
}

function readingMode(section) {
  const text = `${section.title || ''} ${section.notes || ''}`.toLowerCase();
  if (/definition|theorem|formula|proof|核心|定义|公式|推导|关键/.test(text)) return '精读';
  if (/history|appendix|case|example|历史|附录|案例|示例/.test(text)) return '略读';
  return '通读';
}

function createSiteConfig(metadata, chapters) {
  return {
    metadata,
    generatedAt: new Date().toISOString(),
    chapters: chapters.map((chapter, index) => ({
      id: index + 1,
      slug: chapter.slug || chapterSlug(index + 1, chapter.title),
      title: chapter.title,
      sections: chapter.sections || []
    }))
  };
}

module.exports = {
  slugify,
  chapterSlug,
  estimateReadingTime,
  readingMode,
  createSiteConfig
};
