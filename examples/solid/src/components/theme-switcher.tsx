import {
  createMemo,
  createSignal,
  For,
  JSX,
  onMount,
} from 'solid-js';
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
  const [mounted, setMounted] = createSignal(false);
  const suggestedTheme = createMemo(() => {
    if (!mounted()) return undefined;

    const value = theme.colorScheme();
    return value === 'dark'
      ? 'light'
      : value === 'light'
        ? 'dark'
        : undefined;
  });
  const flashedTheme = createMemo(() => {
    const value = suggestedTheme();
    return value === 'dark'
      ? 'light'
      : value === 'light'
        ? 'dark'
        : undefined;
  });
  const codeClass =
    'rounded bg-black/5 px-1 py-0.5 dark:bg-white/10';

  const handleChange: JSX.CustomEventHandlersCamelCase<HTMLSelectElement>['onChange'] =
    event => {
      theme.setTheme(
        event.currentTarget.value as ThemeName,
      );
    };

  onMount(() => {
    setMounted(true);
  });

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
        {suggestedTheme() && flashedTheme() ? (
          <>
            Try{' '}
            <code class={codeClass}>
              {suggestedTheme()}
            </code>
            , refresh the page, and watch whether the
            select briefly flashes{' '}
            <code class={codeClass}>
              {flashedTheme()}
            </code>{' '}
            before settling on{' '}
            <code class={codeClass}>
              {suggestedTheme()}
            </code>
            .
          </>
        ) : (
          <>
            Try the theme opposite your device setting,
            refresh the page, and watch whether the
            select briefly flashes the wrong value
            before settling on your choice.
          </>
        )}
      </p>
    </>
  );
}
