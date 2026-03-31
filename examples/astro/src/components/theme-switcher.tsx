import type {
  LightOrDark,
  WithSystem,
} from 'ssr-themes';
import {
  ThemeProvider,
  useTheme,
} from 'ssr-themes/react';

type ThemeName = WithSystem<LightOrDark>;

type ThemeSwitcherProps = {
  selectedTheme?: ThemeName;
};

function ThemeSelect() {
  const {theme, setTheme, forcedTheme} =
    useTheme<LightOrDark>();

  const disabled = Boolean(forcedTheme);
  const value = theme ?? 'system';

  return (
    <select
      id="theme-selector"
      className="rounded border border-current bg-transparent px-3 py-2 text-2xl"
      value={value}
      onChange={event =>
        setTheme(event.target.value as ThemeName)
      }
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

export default function ThemeSwitcher({
  selectedTheme,
}: ThemeSwitcherProps) {
  return (
    <ThemeProvider selectedTheme={selectedTheme}>
      <ThemeSelect />
    </ThemeProvider>
  );
}
