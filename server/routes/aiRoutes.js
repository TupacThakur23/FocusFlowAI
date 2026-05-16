import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Research from "../models/Research.js";
import { buildContextFingerprint, filterToActiveContext, hasEnoughContext } from "../services/ContextIsolation.js";
dotenv.config();
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const cleanText = (text = "") => String(text).replace(/\s+/g, " ").trim();
const sentences = (text = "") => cleanText(text).split(/(?<=[.!?])\s+/).filter(Boolean);
const makeLocalSummary = (parts = [], title = "this page") => {
  const useful = parts.filter(part => cleanText(part).length > 40).slice(0, 4);
  if (useful.length) return useful.join(" ");
  return `Saved research context from ${title}.`;
};
const extractTopics = (text = "", title = "") => {
  const source = `${title} ${text}`.toLowerCase();
  const candidates = [["AI", ["ai", "artificial intelligence", "model", "machine learning", "neural"]], ["Research", ["research", "study", "paper", "analysis"]], ["Learning", ["learn", "student", "education", "revision"]], ["Technology", ["software", "browser", "extension", "web", "system"]], ["Ethics", ["ethic", "alignment", "safety", "risk"]]];
  const found = candidates.filter(([, keys]) => keys.some(key => source.includes(key))).map(([label]) => label);
  return [...new Set(found), "Context", "Knowledge"].slice(0, 5);
};
const localAnalysis = ({
  text = "",
  title = "Untitled",
  url = ""
}) => {
  const parts = sentences(text);
  const topics = extractTopics(text, title);
  return {
    summary: makeLocalSummary(parts, title),
    keyPoints: (parts.length ? parts : [`${title} is ready for research review.`]).slice(0, 6),
    topics,
    contentType: url ? "article" : "other",
    complexity: "intermediate",
    sentiment: "analytical"
  };
};
const workbookItems = async (workbook, contextId = null) => {
  const items = await Research.find({
    workbook: workbook || "Research Workbook"
  }).sort({
    date: -1
  });
  return filterToActiveContext(items, contextId);
};
const withTimeout = (promise, ms = 8000) => Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("AI request timed out")), ms))]);
const safeJson = text => {
  try {
    return JSON.parse(String(text || "").replace(/```json/g, "").replace(/```/g, "").trim());
  } catch {
    return null;
  }
};
const sourceDomain = url => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "web";
  }
};
const faviconFor = url => `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(url)}`;
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
const sourceTerms = ({ query = "", title = "", context = "", dominantEntities = [], topicKeywords = [] } = {}) => {
  const weighted = [title, ...dominantEntities, ...topicKeywords, query, cleanText(context).slice(0, 360)].filter(Boolean).join(" ");
  return cleanText(weighted).split(/\s+/).filter(word => word.length > 2).slice(0, 28).join(" ");
};
const fallbackRelatedSources = (query, title = "") => {
  const slug = cleanText(title || query).split(" ").filter(Boolean).slice(0, 6).join("_");
  const sources = slug ? [{
    title: title || query,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(slug)}`,
    description: "Direct Wikipedia article candidate for the active research topic.",
    type: "Wikipedia"
  }] : [];
  return sources.map(source => ({
    ...source,
    domain: sourceDomain(source.url),
    favicon: faviconFor(source.url)
  }));
};
const extractDuckDuckGoUrl = href => {
  if (!href) return null;
  try {
    const normalized = href.startsWith("//") ? `https:${href}` : href;
    const parsed = new URL(normalized, "https://duckduckgo.com");
    const uddg = parsed.searchParams.get("uddg");
    return uddg ? decodeURIComponent(uddg) : parsed.href;
  } catch {
    return null;
  }
};
const stripHtml = value => cleanText(String(value || "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'"));
const fetchDuckDuckGoSources = async query => {
  try {
    const response = await withTimeout(fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 FocusFlowAI/1.0"
      }
    }), 6000);
    const html = await response.text();
    const results = [];
    const pattern = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    let match;
    while ((match = pattern.exec(html)) && results.length < 5) {
      const url = extractDuckDuckGoUrl(match[1]);
      if (!isDirectSourceUrl(url)) continue;
      results.push({
        title: stripHtml(match[2]),
        description: stripHtml(match[3]) || "Related webpage for the active research context.",
        url,
        type: "Web"
      });
    }
    return results;
  } catch (error) {
    console.warn("Web related source lookup failed:", error.message);
    return [];
  }
};
const scoreSource = (source, terms) => {
  const haystack = `${source.title || ""} ${source.description || ""} ${source.url || ""}`.toLowerCase();
  const uniqueTerms = [...new Set(cleanText(terms).toLowerCase().split(/\s+/).filter(word => word.length > 2))];
  const overlap = uniqueTerms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
  const typeBoost = source.type === "Wikipedia" ? 3 : source.type === "Research paper" ? 2 : 1;
  return overlap + typeBoost;
};
const fetchRelatedSources = async ({ query = "", title = "", context = "", dominantEntities = [], topicKeywords = [] } = {}) => {
  const searchQuery = sourceTerms({ query, title, context, dominantEntities, topicKeywords });
  if (!searchQuery) return [];
  const sources = [];
  try {
    const wikiRes = await withTimeout(fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}&gsrlimit=4&prop=extracts|info&exintro=1&explaintext=1&inprop=url&format=json&origin=*`), 5000);
    const wiki = await wikiRes.json();
    Object.values(wiki?.query?.pages || {}).forEach(page => {
      sources.push({
        title: page.title,
        description: cleanText(page.extract || "Wikipedia reference related to the active topic.").slice(0, 220),
        url: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(String(page.title || "").replace(/ /g, "_"))}`,
        type: "Wikipedia"
      });
    });
  } catch (error) {
    console.warn("Wikipedia related source lookup failed:", error.message);
  }
  try {
    const crossrefRes = await withTimeout(fetch(`https://api.crossref.org/works?query=${encodeURIComponent(searchQuery)}&rows=3`), 5000);
    const crossref = await crossrefRes.json();
    (crossref?.message?.items || []).forEach(item => {
      const url = item.URL || item.link?.[0]?.URL;
      if (!url) return;
      sources.push({
        title: item.title?.[0] || "Related research paper",
        description: [item["container-title"]?.[0], item.published?.["date-parts"]?.[0]?.[0]].filter(Boolean).join(" - ") || "Research paper related to the active topic.",
        url,
        type: "Research paper"
      });
    });
  } catch (error) {
    console.warn("Crossref related source lookup failed:", error.message);
  }
  sources.push(...await fetchDuckDuckGoSources(searchQuery));
  const deduped = [];
  const seen = new Set();
  [...sources, ...fallbackRelatedSources(searchQuery, title)].sort((a, b) => scoreSource(b, searchQuery) - scoreSource(a, searchQuery)).forEach(source => {
    if (!source.url || !isDirectSourceUrl(source.url) || seen.has(source.url)) return;
    seen.add(source.url);
    deduped.push({
      title: source.title,
      description: source.description || "Related reference for the active research context.",
      url: source.url,
      type: source.type || "Reference",
      domain: sourceDomain(source.url),
      favicon: faviconFor(source.url)
    });
  });
  return deduped.slice(0, 5);
};
router.post("/summarize", async (req, res) => {
  try {
    const {
      text
    } = req.body;
    if (!text) return res.status(400).json({
      error: "Text is required"
    });
    if (!process.env.GEMINI_API_KEY) return res.json({
      summary: localAnalysis({
        text
      }).summary
    });
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite"
    });
    const result = await model.generateContent(text);
    res.json({
      summary: (await result.response).text()
    });
  } catch (error) {
    console.error("AI ROUTE ERROR:", error);
    res.json({
      summary: localAnalysis({
        text: req.body.text
      }).summary
    });
  }
});
router.post("/extract", async (req, res) => {
  try {
    const {
      text,
      url,
      title
    } = req.body;
    if (!text) return res.status(400).json({
      error: "Text is required"
    });
    const cleanedText = String(text).replace(/\n\s*\n/g, "\n\n").replace(/ +/g, " ").trim();
    res.json({
      cleanedText,
      url,
      title,
      wordCount: cleanedText.split(/\s+/).length,
      contextFingerprint: buildContextFingerprint({
        title,
        text: cleanedText
      })
    });
  } catch (error) {
    console.error("EXTRACT ROUTE ERROR:", error);
    res.status(500).json({
      error: "Extraction processing failed"
    });
  }
});
router.post("/ask", async (req, res) => {
  try {
    const {
      context,
      question,
      title,
      dominantEntities = [],
      topicKeywords = []
    } = req.body;
    if (!question) return res.status(400).json({
      error: "Question is required"
    });
    let augmentedContext = context || "";
    let webSources = [];
    const contextText = cleanText(context).toLowerCase();
    const questionTerms = cleanText(question).toLowerCase().split(/\s+/).filter(term => term.length > 3);
    const matchingTerms = questionTerms.filter(term => contextText.includes(term)).length;
    const hasEnoughPageContext = contextText.length > 700 && matchingTerms >= Math.min(2, questionTerms.length);
    if (!hasEnoughPageContext) {
      webSources = await fetchRelatedSources({
        query: question,
        title,
        context,
        dominantEntities,
        topicKeywords
      });
      augmentedContext = `${context || ""}\n\nRelated web references:\n${webSources.map(source => `${source.title}: ${source.description} (${source.url})`).join("\n")}`.trim();
    }
    const fallback = augmentedContext ? `Based on the saved context, the strongest answer is: ${localAnalysis({
      text: augmentedContext
    }).summary}` : `I need extracted page or workbook context to answer: ${question}`;
    if (!process.env.GEMINI_API_KEY) return res.json({
      answer: fallback
    });
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite"
    });
    const prompt = augmentedContext ? `Based on the following active context only, answer clearly. If web references are included, use them only as fallback support.\n\nContext:\n${augmentedContext.substring(0, 15000)}\n\nQuestion: ${question}` : question;
    const result = await model.generateContent(prompt);
    res.json({
      answer: (await result.response).text(),
      fallbackSources: webSources
    });
  } catch (error) {
    console.error("AI ASK ERROR:", error);
    res.json({
      answer: `I could not reach the AI model, but your saved context is available. Try again after checking the API key.`
    });
  }
});
router.post("/workbook-chat", async (req, res) => {
  try {
    const {
      workbook,
      query,
      contextId
    } = req.body;
    if (!query) return res.status(400).json({
      error: "Query is required"
    });
    const researchItems = await workbookItems(workbook, contextId);
    const usedWebFallback = !hasEnoughContext(researchItems, query);
    const webSources = usedWebFallback ? await fetchRelatedSources({
      query,
      title: workbook,
      context: researchItems.map(item => `${item.topic} ${item.summary}`).join(" ")
    }) : [];
    const fallback = {
      introText: researchItems.length ? `I found ${researchItems.length} saved item${researchItems.length === 1 ? "" : "s"} in ${workbook || "Research Workbook"}.` : "This workbook has no saved items yet.",
      insights: researchItems.slice(0, 5).map((item, index) => ({
        title: item.topic,
        desc: item.summary || item.notes || "Saved from Aide.",
        sources: item.link ? `Source ${index + 1}` : "Saved note",
        color: ["bg-emerald-500/20 text-emerald-400", "bg-blue-500/20 text-blue-400", "bg-violet-500/20 text-violet-400"][index % 3]
      }))
    };
    if (!process.env.GEMINI_API_KEY || researchItems.length === 0) {
      return res.json({
        ...fallback,
        fallbackSources: webSources
      });
    }
    let contextString = `WORKBOOK CONTEXT FOR: "${workbook || "Research Workbook"}"\n\n`;
    researchItems.forEach((item, index) => {
      contextString += `--- SOURCE ${index + 1} ---\nTopic: ${item.topic}\nURL: ${item.link || "N/A"}\nSummary: ${item.summary || ""}\nNotes: ${item.notes || ""}\nTags: ${(item.tags || []).join(", ")}\n\n`;
    });
    if (webSources.length) {
      contextString += `--- FALLBACK WEB SOURCES ---\n${webSources.map(source => `${source.title}\n${source.description}\n${source.url}`).join("\n\n")}\n\n`;
    }
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "Answer using only the active context cluster. If FALLBACK WEB SOURCES exist, use them only to fill missing facts and cite them in sources. Return JSON only: { \"introText\": string, \"insights\": [ { \"title\": string, \"desc\": string, \"sources\": string, \"color\": string } ] }."
    });
    const result = await model.generateContent(`Context:\n${contextString}\n\nUser Query: ${query}`);
    const responseText = await result.response.text();
    try {
      res.json({
        ...JSON.parse(responseText.replace(/```json/g, "").replace(/```/g, "").trim()),
        fallbackSources: webSources
      });
    } catch {
      res.json(fallback);
    }
  } catch (error) {
    console.error("WORKBOOK CHAT ERROR:", error);
    res.status(500).json({
      error: "Failed to generate workbook response"
    });
  }
});
router.get("/workbook-insights", async (req, res) => {
  try {
    const workbook = req.query.workbook || "Research Workbook";
    const researchItems = await workbookItems(workbook, req.query.contextId || null);
    if (researchItems.length === 0) return res.json({
      keyInsights: [],
      topEntities: []
    });
    const fallback = {
      keyInsights: researchItems.slice(0, 3).map((item, index) => ({
        title: ["Emerging Theme", "Knowledge Gap", "Strong Focus"][index] || "Insight",
        desc: item.summary || item.topic,
        type: ["trend", "gap", "focus"][index] || "focus",
        color: ["text-emerald-400", "text-orange-400", "text-violet-400"][index] || "text-blue-400",
        chartColor: ["border-emerald-500", "border-orange-500", "border-violet-500"][index] || "border-blue-500"
      })),
      topEntities: Object.entries(researchItems.reduce((acc, item) => {
        [...(item.tags || []), ...(item.saveOptions || []), item.workbook].filter(Boolean).forEach(label => {
          acc[label] = (acc[label] || 0) + 1;
        });
        return acc;
      }, {})).slice(0, 5).map(([label, count], index) => ({
        label,
        count,
        color: ["text-blue-500", "text-emerald-500", "text-violet-500", "text-orange-500"][index % 4]
      }))
    };
    if (!process.env.GEMINI_API_KEY) return res.json(fallback);
    let contextString = `WORKBOOK CONTEXT FOR: "${workbook}"\n\n`;
    researchItems.forEach(item => {
      contextString += `Topic: ${item.topic}\nSummary: ${item.summary || ""}\nNotes: ${item.notes || ""}\n\n`;
    });
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "Analyze only the active context cluster. Do not use unrelated saved pages. Return JSON only: { \"keyInsights\": [ { \"title\": string, \"desc\": string, \"type\": \"trend\" | \"gap\" | \"focus\", \"color\": string, \"chartColor\": string } ], \"topEntities\": [ { \"label\": string, \"count\": number, \"color\": string } ] }."
    });
    let result;
    try {
      result = await withTimeout(model.generateContent(contextString));
    } catch (error) {
      console.warn("WORKBOOK INSIGHTS AI FALLBACK:", error.message);
      return res.json(fallback);
    }
    const responseText = await result.response.text();
    try {
      res.json(JSON.parse(responseText.replace(/```json/g, "").replace(/```/g, "").trim()));
    } catch {
      res.json(fallback);
    }
  } catch (error) {
    console.error("WORKBOOK INSIGHTS ERROR:", error);
    res.status(500).json({
      error: "Failed to generate workbook insights"
    });
  }
});
router.post("/deep-analysis", async (req, res) => {
  try {
    const {
      text,
      title,
      url,
      wordCount
    } = req.body;
    if (!text) return res.status(400).json({
      error: "Text content is required"
    });
    const fallback = localAnalysis({
      text,
      title,
      url
    });
    if (!process.env.GEMINI_API_KEY) return res.json(fallback);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: "Analyze the main webpage article/body. Ignore headers, navigation, sidebars, language menus, boilerplate, and unrelated directory text. Return raw JSON only with summary, keyPoints, topics, contentType, complexity, sentiment. The summary must be useful and specific, around 4 to 6 sentences. Return 5 to 7 keyPoints as concise study bullets. Keep the response clear English when the source page is English."
    });
    const prompt = `Webpage Title: "${title || "Unknown"}"\nURL: ${url || "N/A"}\nWord Count: ${wordCount || "Unknown"}\n\nAnalyze the main article/body. Ignore headers, navigation, sidebars, language menus, boilerplate, and unrelated directory text. Write a specific 4 to 6 sentence summary and 5 to 7 useful key points.\n\n--- CONTENT ---\n${String(text).substring(0, 10000)}`;
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    try {
      res.json(JSON.parse(responseText.replace(/```json/g, "").replace(/```/g, "").trim()));
    } catch {
      res.json(fallback);
    }
  } catch (error) {
    console.error("DEEP ANALYSIS ERROR:", error);
    res.json(localAnalysis(req.body || {}));
  }
});
router.post("/related-sources", async (req, res) => {
  try {
    const {
      query,
      title,
      context,
      dominantEntities = [],
      topicKeywords = []
    } = req.body || {};
    const sources = await fetchRelatedSources({
      query,
      title,
      context,
      dominantEntities,
      topicKeywords
    });
    res.json({
      sources
    });
  } catch (error) {
    console.error("RELATED SOURCES ERROR:", error);
    res.json({
      sources: fallbackRelatedSources(req.body?.query || req.body?.title || "research", req.body?.title)
    });
  }
});
export default router;









