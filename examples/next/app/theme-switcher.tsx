'use client';

import {useTheme} from 'ssr-themes';

export default function ThemeSwitcher() {
  const {theme, setTheme, forcedTheme} = useTheme();

  const disabled = Boolean(forcedTheme);
  const value = theme ?? 'system';

  return (
    <select
      className="rounded border border-current bg-transparent px-3 py-2 text-2xl"
      value={value}
      onChange={event => setTheme(event.target.value)}
      disabled={disabled}
      aria-label="Theme"
      data-test-id="theme-selector"
    >
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
}
