import {For, JSX} from 'solid-js';
import {useTheme} from 'ssr-themes/solid';

const options = [
  {
    value: 'system',
    label: 'System',
  },
  {
    value: 'dark',
    label: 'Dark',
  },
  {
    value: 'light',
    label: 'Light',
  },
] as const;

type ThemeName = (typeof options)[number]['value'];

export function ThemeSwitcher() {
  const theme = useTheme();
  const currentTheme = () => theme.theme() ?? 'system';

  const handleChange: JSX.CustomEventHandlersCamelCase<HTMLSelectElement>['onChange'] =
    event => {
      theme.setTheme(
        event.currentTarget.value as ThemeName,
      );
    };

  return (
    <select
      id="theme-selector"
      class="rounded border border-current bg-transparent px-3 py-2 text-xl"
      value={currentTheme()}
      onChange={handleChange}
      data-test-id="theme-selector"
    >
      <For each={options}>
        {option => (
          <option
            value={option.value}
            selected={option.value === currentTheme()}
          >
            {option.label}
          </option>
        )}
      </For>
    </select>
  );
}
