import {For, JSX} from 'solid-js';
import {encodeVariant, useTheme} from '~/lib/theme';

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

const selectClass =
  'appearance-none rounded border border-current bg-transparent px-3 py-2 pr-10 text-xl';

export function ThemeSwitcher() {
  const theme = useTheme();
  const currentTheme = () =>
    theme.selected() ?? 'system';
  const deviceTheme = () => theme.system() ?? 'dark';
  const suggestedTheme = () =>
    deviceTheme() === 'dark' ? 'light' : 'dark';
  const cookieValue = () => {
    const selectedTheme = currentTheme();
    const systemTheme = deviceTheme();

    return (
      encodeVariant({
        selected: selectedTheme,
        resolved:
          selectedTheme === 'system'
            ? systemTheme
            : selectedTheme,
        system: systemTheme,
      }) ?? (systemTheme === 'dark' ? '~d' : '~l')
    );
  };
  const codeClass =
    'rounded bg-black/5 px-1 py-0.5 dark:bg-white/10';

  const handleChange: JSX.CustomEventHandlersCamelCase<HTMLSelectElement>['onChange'] =
    event => {
      theme.setSelected(
        event.currentTarget.value as ThemeName,
      );
    };

  return (
    <>
      <div class="relative mx-auto w-fit">
        <select
          id="theme-selector"
          class={selectClass}
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

        <span
          class="pointer-events-none absolute inset-y-0 right-3 flex items-center opacity-70"
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="m2.5 4.5 3.5 3.5 3.5-3.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </div>

      <p class="mx-auto max-w-lg text-sm leading-relaxed text-black/60 dark:text-white/60">
        The theme cookie is set to{' '}
        <code
          class={codeClass}
          data-test-id="theme-cookie-value"
        >
          {cookieValue()}
        </code>
        . Try{' '}
        <code
          class={codeClass}
          data-test-id="theme-suggested-theme"
        >
          {suggestedTheme()}
        </code>
        , refresh the page, and check that the select
        doesn't flash your system's{' '}
        <code
          class={codeClass}
          data-test-id="theme-system-setting"
        >
          {deviceTheme()}
        </code>{' '}
        setting first.
      </p>
    </>
  );
}
