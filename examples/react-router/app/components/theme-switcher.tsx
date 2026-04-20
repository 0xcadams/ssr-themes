import {useTheme} from '../lib/theme';

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
  const {selected, setSelected, system} = useTheme();
  const value = selected ?? 'system';
  const deviceTheme = system ?? 'dark';
  const suggestedTheme =
    deviceTheme === 'dark' ? 'light' : 'dark';
  const codeClassName =
    'rounded bg-black/5 px-1 py-0.5 dark:bg-white/10';

  return (
    <>
      <select
        id="theme-selector"
        className="rounded border border-current bg-transparent px-3 py-2 text-xl"
        value={value}
        onChange={event =>
          setSelected(event.target.value as ThemeName)
        }
        aria-label="Theme"
        data-test-id="theme-selector"
      >
        {options.map(option => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
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
