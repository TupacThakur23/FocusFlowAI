

export const VIEWS = {
  LAUNCHER: "launcher",
  AIDE: "aide", 
  RESEARCH_HUB: "research"
};

export const VIEW_LABELS = {
  [VIEWS.LAUNCHER]: "Launcher",
  [VIEWS.AIDE]: "Aide Dashboard",
  [VIEWS.RESEARCH_HUB]: "Research Hub"
};

export const isValidView = (view) => {
  return Object.values(VIEWS).includes(view);
};

export const getViewLabel = (view) => {
  return VIEW_LABELS[view] || view;
};
