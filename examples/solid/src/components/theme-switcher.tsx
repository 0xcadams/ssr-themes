import {For, JSX} from 'solid-js';
import {useTheme} from '~/lib/theme';

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
  const deviceTheme = () =>
    theme.colorScheme() ?? 'dark';
  const suggestedTheme = () =>
    deviceTheme() === 'dark' ? 'light' : 'dark';
  const codeClass =
    'rounded bg-black/5 px-1 py-0.5 dark:bg-white/10';

  const handleChange: JSX.CustomEventHandlersCamelCase<HTMLSelectElement>['onChange'] =
    event => {
      theme.setTheme(
        event.currentTarget.value as ThemeName,
      );
    };

  return (
    <>
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
              selected={
                option.value === currentTheme()
              }
            >
              {option.label}
            </option>
          )}
        </For>
      </select>

      <p class="mx-auto max-w-lg text-sm leading-relaxed text-black/60 dark:text-white/60">
        Try{' '}
        <code class={codeClass}>
          {suggestedTheme()}
        </code>
        , refresh the page, and check that the select
        never briefly shows{' '}
        <code class={codeClass}>{deviceTheme()}</code>{' '}
        first.
      </p>
    </>
  );
}
