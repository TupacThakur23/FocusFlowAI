const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "are", "was", "were", "has", "have", "had", "into", "about",
  "your", "you", "their", "they", "will", "would", "could", "should", "page", "content", "research", "summary",
  "notes", "source", "sources", "article", "which", "what", "when", "where", "how", "why", "can", "also"
]);

const clean = value => String(value || "").toLowerCase().replace(/https?:\/\/\S+/g, " ").replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();

export const extractContextTerms = (text = "", title = "", tags = []) => {
  const source = clean(`${title} ${tags.join(" ")} ${text}`);
  const words = source.split(/\s+/).filter(word => word.length > 2 && !STOP_WORDS.has(word));
  const counts = new Map();
  words.forEach(word => counts.set(word, (counts.get(word) || 0) + 1));
  const capitalEntities = String(`${title} ${text}`).match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\b/g) || [];
  capitalEntities.forEach(entity => {
    const key = clean(entity);
    if (key && !STOP_WORDS.has(key)) counts.set(key, (counts.get(key) || 0) + 3);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18).map(([term]) => term);
};

export const similarity = (termsA = [], termsB = []) => {
  const a = new Set(termsA);
  const b = new Set(termsB);
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  a.forEach(term => {
    if (b.has(term)) overlap++;
  });
  return overlap / Math.sqrt(a.size * b.size);
};

export const buildContextFingerprint = ({ title = "", text = "", summary = "", notes = "", tags = [] } = {}) => {
  const terms = extractContextTerms(`${summary} ${notes} ${text}`.slice(0, 12000), title, tags);
  const primary = terms[0] || clean(title).split(/\s+/)[0] || "context";
  const secondary = terms[1] || terms[2] || "general";
  const seed = `${primary}_${secondary}`.replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 48) || "context_general";
  return {
    id: `context_${seed}`,
    terms,
    label: terms.slice(0, 3).join(" "),
    title
  };
};

export const assignContextCluster = (item, existingItems = [], threshold = 0.28) => {
  const fingerprint = buildContextFingerprint({
    title: item.topic || item.title,
    summary: item.summary,
    notes: item.notes,
    text: item.outputs?.selectedText,
    tags: item.tags || item.outputs?.tags || []
  });
  let best = { score: 0, contextId: fingerprint.id };
  existingItems.forEach(existing => {
    const existingTerms = existing.contextTerms?.length ? existing.contextTerms : buildContextFingerprint({
      title: existing.topic,
      summary: existing.summary,
      notes: existing.notes,
      text: existing.outputs?.selectedText,
      tags: existing.tags || []
    }).terms;
    const score = similarity(fingerprint.terms, existingTerms);
    if (score > best.score) best = { score, contextId: existing.contextId || existing.contextFingerprint || fingerprint.id };
  });
  const contextId = best.score >= threshold ? best.contextId : `${fingerprint.id}_${Date.now().toString(36)}`;
  return {
    contextId,
    contextFingerprint: fingerprint.id,
    contextTerms: fingerprint.terms,
    contextSimilarity: best.score
  };
};

export const filterToActiveContext = (items = [], requestedContextId = null) => {
  if (!items.length) return items;
  const contextId = requestedContextId || items[0]?.contextId;
  if (!contextId) return items;
  return items.filter(item => item.contextId === contextId);
};

export const hasEnoughContext = (items = [], query = "") => {
  if (!items.length) return false;
  const queryTerms = extractContextTerms(query);
  if (!queryTerms.length) return items.some(item => String(item.summary || item.notes || "").length > 180);
  const itemTerms = extractContextTerms(items.map(item => `${item.topic} ${item.summary} ${item.notes} ${(item.tags || []).join(" ")}`).join(" "));
  return similarity(queryTerms, itemTerms) >= 0.18 || items.some(item => String(`${item.summary} ${item.notes}`).length > 700);
};
