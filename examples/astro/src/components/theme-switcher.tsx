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
  const {theme, setTheme, forcedTheme, colorScheme} =
    useTheme<LightOrDark>();

  const disabled = Boolean(forcedTheme);
  const value = theme ?? 'system';
  const deviceTheme = colorScheme ?? 'dark';
  const suggestedTheme =
    deviceTheme === 'dark' ? 'light' : 'dark';
  const codeClassName =
    'rounded bg-black/5 px-1 py-0.5 dark:bg-white/10';

  return (
    <>
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

      <p className="mx-auto max-w-lg text-sm leading-relaxed text-black/60 dark:text-white/60">
        Try{' '}
        <code className={codeClassName}>
          {suggestedTheme}
        </code>
        , refresh the page, and check that the select
        never briefly shows{' '}
        <code className={codeClassName}>
          {deviceTheme}
        </code>{' '}
        first.
      </p>
    </>
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
