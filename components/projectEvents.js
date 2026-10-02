// Lets other sections ask the projects slider to show the projects that use a
// skill. The slider listens for this event; see ProjectSlider.jsx.
export const SHOW_SKILL_EVENT = "portfolio:show-skill";

export function showProjectsUsing(skill) {
  window.dispatchEvent(new CustomEvent(SHOW_SKILL_EVENT, { detail: skill }));
}
