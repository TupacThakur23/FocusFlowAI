import api from "../services/api";

const sourceDomain = url => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "web";
  }
};

const faviconFor = url => `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(url)}`;
const clean = value => String(value || "").replace(/\s+/g, " ").trim();

const fallbackSources = (query, title = "") => {
  const slug = clean(title || query).split(" ").filter(Boolean).slice(0, 6).join("_");
  return slug ? [{
    title: title || query,
    description: "Direct Wikipedia article candidate for the active topic.",
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(slug)}`,
    type: "Wikipedia"
  }] : [];
};
const isDirectSourceUrl = url => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (["google.com", "scholar.google.com"].includes(host)) return false;
    if (parsed.pathname === "/search" || parsed.pathname.includes("/Special:Search")) return false;
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

const normalize = sources => {
  const seen = new Set();
  return (sources || []).filter(Boolean).map(source => ({
    title: source.title || source.name || "Related source",
    description: source.description || source.desc || "Related reference for the active research context.",
    url: source.url,
    type: source.type || "Reference",
    domain: source.domain || sourceDomain(source.url),
    favicon: source.favicon || faviconFor(source.url)
  })).filter(source => {
    if (!source.url || !isDirectSourceUrl(source.url) || seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
};

const fetchWikipediaSources = async query => {
  const response = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=4&namespace=0&format=json&origin=*`);
  const data = await response.json();
  return (data?.[1] || []).map((title, index) => ({
    title,
    description: data?.[2]?.[index] || "Wikipedia result",
    url: data?.[3]?.[index],
    type: "Wikipedia"
  }));
};

const fetchCrossrefSources = async query => {
  const response = await fetch(`https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=3`);
  const data = await response.json();
  return (data?.message?.items || []).map(item => {
    const url = item.URL || item.link?.[0]?.URL;
    if (!url) return null;
    return {
      title: item.title?.[0] || "Research paper",
      description: [item["container-title"]?.[0], item.published?.["date-parts"]?.[0]?.[0]].filter(Boolean).join(" - ") || "Research paper",
      url,
      type: "Research paper"
    };
  }).filter(Boolean);
};

export const getSemanticSources = async ({ title = "", query = "", context = "", dominantEntities = [], topicKeywords = [] } = {}) => {
  const entityQuery = [...dominantEntities, ...topicKeywords].filter(Boolean).slice(0, 10).join(" ");
  const searchQuery = clean(`${title} ${entityQuery} ${query || context}`.slice(0, 320));
  if (!searchQuery) return [];
  let sources = [];
  try {
    const [wikiResults, crossrefResults] = await Promise.all([
      fetchWikipediaSources(searchQuery).catch(() => []),
      fetchCrossrefSources(searchQuery).catch(() => [])
    ]);
    sources = normalize([...wikiResults, ...crossrefResults]);
  } catch {}
  if (sources.length < 6) {
    try {
      const res = await api.post("/api/ai/related-sources", {
        title,
        query: searchQuery,
        context,
        dominantEntities,
        topicKeywords
      });
      const backendSources = normalize(res.data?.sources || []);
      const seen = new Set(sources.map(s => s.url));
      backendSources.forEach(s => { if (!seen.has(s.url)) { sources.push(s); seen.add(s.url); } });
    } catch {}
  }
  if (sources.length === 0) {
    sources = normalize(fallbackSources(searchQuery, title));
  }
  return sources.slice(0, 10);
};


