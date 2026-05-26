export function initials(name: string) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function truncate(input: string, max = 80) {
  if (!input) return "";
  return input.length > max ? `${input.slice(0, max)}…` : input;
}
