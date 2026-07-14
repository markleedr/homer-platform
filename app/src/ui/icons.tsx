// Line-icon system (PRD 8e): a single inline SVG sprite, 24px grid, 1.75px
// stroke, round caps and joins, fill none, currentColor throughout so icons
// inherit the surrounding tint. Tabler-derived paths, matching the reference
// prototype. No emoji, no icon fonts, no mixed stroke weights.
//
// Usage: render <IconSprite /> once near the app root, then <Icon name="home" />
// anywhere. Size and colour come from font-size and color on an ancestor.

export type IconName =
  | "home"
  | "calendar"
  | "chat"
  | "tool"
  | "alert"
  | "plug"
  | "shield"
  | "flame"
  | "file"
  | "plan"
  | "palette"
  | "key"
  | "user"
  | "phone"
  | "lock"
  | "check"
  | "map"
  | "send"
  | "mic"
  | "camera"
  | "cloud"
  | "recycle"
  | "list"
  | "back"
  | "mail"
  | "logout";

// Path data per symbol. Kept as fragments so the sprite and any standalone use
// share one definition.
const PATHS: Record<IconName, string> = {
  home: '<path d="M3 9.5L12 3l9 6.5V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20z"/><path d="M9 21.5V13h6v8.5"/>',
  calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5z"/>',
  tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  plug: '<path d="M9 3v6"/><path d="M15 3v6"/><path d="M6 9h12v3a6 6 0 0 1-12 0z"/><path d="M12 18v3"/>',
  shield: '<path d="M12 3l8 3v6c0 4.6-3.4 7.6-8 9-4.6-1.4-8-4.4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  flame: '<path d="M12 3c2.2 3.2 5 5.4 5 9a5 5 0 1 1-10 0c0-1.9.9-3.4 2.1-4.9.4 1.5 1.4 2.3 1.4 2.3C10.7 7.4 12 3 12 3z"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  plan: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
  palette: '<path d="M12 21a9 9 0 1 1 9-9c0 2.2-1.6 3-3 3h-2a2 2 0 0 0-2 2c0 1 .6 1.4.6 2.4S13.4 21 12 21z"/><path d="M7.5 10.5h.01M12 7.5h.01M16.5 10.5h.01"/>',
  key: '<circle cx="7.5" cy="15.5" r="4"/><path d="M10.3 12.7L21 2"/><path d="M15 8l3 3"/><path d="M18 5l2 2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  map: '<path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
  mic: '<rect x="9" y="1.5" width="6" height="13" rx="3"/><path d="M19 10v1.5a7 7 0 0 1-14 0V10"/><path d="M12 18.5v4"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  cloud: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
  recycle: '<path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/><path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  list: '<path d="M9 6h12"/><path d="M9 12h12"/><path d="M9 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
};

const NAMES = Object.keys(PATHS) as IconName[];

// Render this once near the root. It defines every symbol; icons reference them.
export function IconSprite() {
  return (
    <svg
      width={0}
      height={0}
      aria-hidden="true"
      style={{ position: "absolute" }}
    >
      <defs>
        {NAMES.map((name) => (
          <symbol
            key={name}
            id={`i-${name}`}
            viewBox="0 0 24 24"
            dangerouslySetInnerHTML={{ __html: PATHS[name] }}
          />
        ))}
      </defs>
    </svg>
  );
}

export function Icon({
  name,
  title,
}: {
  name: IconName;
  title?: string;
}) {
  return (
    <svg className="icon" aria-hidden={title ? undefined : true} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <use href={`#i-${name}`} />
    </svg>
  );
}
