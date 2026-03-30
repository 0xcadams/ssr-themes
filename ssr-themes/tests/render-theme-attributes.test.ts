import {describe, expect, test} from 'vitest';

import {renderThemeAttributes} from '../src';

describe('renderThemeAttributes', () => {
  test('serializes html theme attributes', () => {
    expect(
      renderThemeAttributes({
        attribute: ['class', 'data-theme'],
        className: 'app-shell',
        initialTheme: 'dark',
        style: {
          '--accent': '#fff',
        },
      }),
    ).toBe(
      'class="app-shell dark" style="--accent:#fff;color-scheme:dark" data-theme="dark"',
    );
  });

  test('escapes attribute values', () => {
    expect(
      renderThemeAttributes({
        attribute: 'class',
        className: 'quote"test',
        initialTheme: 'light',
        style: {
          '--content': '<tag>&"',
        },
      }),
    ).toBe(
      'class="quote&quot;test light" style="--content:&lt;tag&gt;&amp;&quot;;color-scheme:light"',
    );
  });
});
