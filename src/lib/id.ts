export function uid(prefix = "id") {
  return `${prefix}_${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`
}