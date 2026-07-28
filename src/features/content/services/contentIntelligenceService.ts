import { ARTICLES_REGISTRY, TOPIC_HUBS } from '../data/contentEngineData';

export interface PageQualityAudit {
  slug: string;
  title: string;
  type: string;
  qualityScore: number; // 0 - 100
  aiCitationScore: number; // 0 - 100
  entityCoverageScore: number; // 0 - 100
  internalLinkCount: number;
  faqCount: number;
  recommendations: string[];
}

export interface TopicAuthorityScore {
  topicId: string;
  topicName: string;
  coveragePercent: number;
  totalAssets: number;
  missingGaps: string[];
}

export function auditAllContentPages(): PageQualityAudit[] {
  const articles = Object.values(ARTICLES_REGISTRY);

  return articles.map((art) => {
    let quality = 70;
    let aiCitation = 65;
    let entityCoverage = 75;

    // Positive scoring criteria
    if (art.quickAnswer) { aiCitation += 15; quality += 5; }
    if (art.definition) { aiCitation += 10; entityCoverage += 10; }
    if (art.keyTakeaways && art.keyTakeaways.length >= 3) { aiCitation += 10; quality += 10; }
    if (art.faqs && art.faqs.length >= 2) { quality += 10; aiCitation += 10; }
    if (art.sections && art.sections.length >= 3) { quality += 10; }

    const internalLinks = (art.relatedSlugs?.length || 0) + 4; // base links to mindgym, course, home, quiz

    const recommendations: string[] = [];
    if (!art.definition) recommendations.push('Add canonical definition block for LLM citations');
    if ((art.faqs?.length || 0) < 3) recommendations.push('Expand FAQ count to 4+ for Featured Snippets');
    if (internalLinks < 6) recommendations.push('Increase internal link count to 8+ related entities');

    return {
      slug: art.slug,
      title: art.title,
      type: art.type,
      qualityScore: Math.min(100, quality),
      aiCitationScore: Math.min(100, aiCitation),
      entityCoverageScore: Math.min(100, entityCoverage),
      internalLinkCount: internalLinks,
      faqCount: art.faqs?.length || 0,
      recommendations,
    };
  });
}

export function analyzeTopicalAuthority(): TopicAuthorityScore[] {
  const topics = Object.values(TOPIC_HUBS);

  return topics.map((hub) => {
    const totalAssets = hub.featuredArticleSlugs.length + hub.featuredGlossarySlugs.length + hub.featuredVideoIds.length;
    const coverage = Math.min(100, Math.round((totalAssets / 6) * 100));

    const missingGaps: string[] = [];
    if (hub.featuredVideoIds.length < 2) missingGaps.push('Needs 1 additional YouTube Masterclass embed');
    if (hub.featuredGlossarySlugs.length < 3) missingGaps.push('Needs 2 additional Glossary Term definitions');

    return {
      topicId: hub.id,
      topicName: hub.name,
      coveragePercent: coverage,
      totalAssets,
      missingGaps,
    };
  });
}
