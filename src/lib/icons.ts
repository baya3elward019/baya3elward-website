/* Inline SVG icons (24x24, stroke based unless noted). No icon font, no network request. */

export const icons: Record<string, string> = {
  github:
    '<path fill="currentColor" stroke="none" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/>',
  linkedin:
    '<path fill="currentColor" stroke="none" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/>',
  telegram:
    '<path d="m21.5 4.5-3 15.2c-.2 1-.9 1.3-1.7.8l-4.6-3.4-2.2 2.1c-.2.2-.5.4-.9.4l.3-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2L6.8 13.6 2.3 12.2c-1-.3-1-1 .2-1.5L20.2 3.9c.8-.3 1.5.2 1.3 1.6Z"/>',
  whatsapp:
    '<path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3.1 3.1L3.5 20.5Z"/><path d="M9 8.5c.3 2.6 2.4 5.2 5.3 6 .5.1 1.4-.4 1.6-.9l.2-.8-2-1-.8.9c-1-.4-2-1.4-2.4-2.4l.9-.8-1-2-.8.2c-.5.2-1 .9-1 1.4Z"/>',
  x: '<path d="M4 4l16 16M20 4 4 20"/>',
  twitter: '<path d="M4 4l16 16M20 4 4 20"/>',
  tryhackme:
    '<path d="M7 18a4 4 0 0 1-.6-7.96A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9H7Z"/><path d="M10 13.5h4M12 11.5v4"/>',
  hackthebox: '<path d="m12 2.5 8.5 4.9v9.2L12 21.5l-8.5-4.9V7.4L12 2.5Z"/><path d="m3.5 7.4 8.5 4.9 8.5-4.9M12 12.3v9.2"/>',
  youtube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10 9.5 5 2.5-5 2.5v-5Z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6"/>',
  facebook: '<path d="M14 21v-8h3l.5-3.5H14V7.6c0-1 .3-1.7 1.8-1.7h1.8V2.8a24 24 0 0 0-2.7-.1c-2.6 0-4.4 1.6-4.4 4.5v2.3H7.5V13h3v8"/>',
  medium: '<circle cx="7" cy="12" r="4.5"/><ellipse cx="16" cy="12" rx="2" ry="4.3"/><path d="M21 8v8"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6 8.5 7 8.5-7"/>',
  website: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
  shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6L12 3Z"/><path d="m9 12 2 2 4-4"/>',
  terminal: '<rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="m6.5 9 3 3-3 3M12 15h5"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>',
  file: '<path d="M14 3H6.5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V7.5L14 3Z"/><path d="M14 3v4.5h4.5M9 13h6M9 16.5h4"/>',
  share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 13.8-1.5 7.2 5-2.7 5 2.7-1.5-7.2"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="m21 16-5-5-9 9"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
};

export const socialLabel: Record<string, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  x: 'X',
  twitter: 'X',
  tryhackme: 'TryHackMe',
  hackthebox: 'Hack The Box',
  youtube: 'YouTube',
  instagram: 'Instagram',
  facebook: 'Facebook',
  medium: 'Medium',
  email: 'Email',
  website: 'Website',
};

export function iconFor(name: string): string {
  return icons[name] ?? icons.link;
}
