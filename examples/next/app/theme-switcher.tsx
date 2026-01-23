'use client';

import {useEffect, useState} from 'react';
import {useTheme} from 'ssr-themes';

export default function ThemeSwitcher() {
  const {theme, setTheme, forcedTheme} = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const disabled = Boolean(forcedTheme);
  const value = mounted && theme ? theme : 'system';

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
      {mounted && (
        <>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </>
      )}
    </select>
  );
}
