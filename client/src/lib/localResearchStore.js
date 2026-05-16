const STORAGE_KEY = "focusflow_local_research_v1";
const WORKBOOKS_KEY = "focusflow_local_workbooks_v1";

const hasChromeStorage = () => typeof chrome !== "undefined" && chrome.storage?.local;

const readChrome = keys =>
  new Promise(resolve => {
    chrome.storage.local.get(keys, data => resolve(data || {}));
  });

const writeChrome = data =>
  new Promise(resolve => {
    chrome.storage.local.set(data, () => resolve(true));
  });

const readJson = async key => {
  if (hasChromeStorage()) {
    const data = await readChrome([key]);
    const raw = data[key];
    return typeof raw === "string" ? JSON.parse(raw) : raw || null;
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeJson = async (key, value) => {
  if (hasChromeStorage()) {
    await writeChrome({ [key]: JSON.stringify(value) });
    return value;
  }
  localStorage.setItem(key, JSON.stringify(value));
  return value;
};

export const listLocalResearch = async (workbook = null) => {
  const items = (await readJson(STORAGE_KEY)) || [];
  const filtered = workbook ? items.filter(item => (item.workbook || "Research Workbook") === workbook) : items;
  return [...filtered].sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
};

export const listLocalWorkbooks = async () => {
  const items = (await readJson(STORAGE_KEY)) || [];
  const workbooks = new Set(["Research Workbook"]);
  items.forEach(item => {
    if (item.workbook) workbooks.add(item.workbook);
  });
  const storedWorkbooks = (await readJson(WORKBOOKS_KEY)) || [];
  storedWorkbooks.forEach(name => workbooks.add(name));
  return [...workbooks];
};

export const saveLocalResearchItem = async item => {
  const current = (await readJson(STORAGE_KEY)) || [];
  const record = {
    ...item,
    _id: item._id || `local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    date: item.date || new Date().toISOString(),
    createdAt: item.createdAt || new Date().toISOString()
  };
  const existingIndex = current.findIndex(entry => String(entry._id) === String(record._id) || (entry.link && record.link && entry.link === record.link && entry.topic === record.topic));
  if (existingIndex >= 0) current[existingIndex] = record; else current.unshift(record);
  await writeJson(STORAGE_KEY, current);
  const workbooks = new Set([...(await readJson(WORKBOOKS_KEY)) || [], "Research Workbook", record.workbook || "Research Workbook"]);
  await writeJson(WORKBOOKS_KEY, [...workbooks]);
  return record;
};

export const saveLocalWorkbook = async name => {
  const workbooks = new Set([...(await readJson(WORKBOOKS_KEY)) || [], "Research Workbook", name].filter(Boolean));
  await writeJson(WORKBOOKS_KEY, [...workbooks]);
  return [...workbooks];
};

export const clearLocalResearchStore = async () => {
  if (hasChromeStorage()) {
    await writeChrome({ [STORAGE_KEY]: JSON.stringify([]), [WORKBOOKS_KEY]: JSON.stringify(["Research Workbook"]) });
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(WORKBOOKS_KEY);
};
