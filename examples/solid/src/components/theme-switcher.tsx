import {useTheme} from 'ssr-themes/solid';

type ThemeName = 'system' | 'dark' | 'light';

export function ThemeSwitcher() {
  const theme = useTheme();
  const value = () => theme.theme() ?? 'system';

  const handleChange = (
    event: Event & {
      currentTarget: HTMLSelectElement;
    },
  ) => {
    theme.setTheme(
      event.currentTarget.value as ThemeName,
    );
  };

  return (
    <select
      id="theme-selector"
      class="rounded border border-current bg-transparent px-3 py-2 text-xl"
      value={value()}
      onChange={handleChange}
      data-test-id="theme-selector"
    >
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
}
