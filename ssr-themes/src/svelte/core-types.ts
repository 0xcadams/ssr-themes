export interface CookieOptions {
  name?: string;
  path?: string;
  maxAge?: number;
  expires?: Date;
  sameSite?: 'lax' | 'strict' | 'none';
  domain?: string;
  secure?: boolean;
}

export type LightOrDarkTuple = readonly [
  'dark',
  'light',
];
export type LightOrDark = LightOrDarkTuple[number];

type DataAttribute = `data-${string}`;

export type Attribute = DataAttribute | 'class';

type ThemeValueMap<TTheme extends string> = Partial<
  Record<TTheme, string>
>;

export type WithSystem<
  TTheme extends string,
  TEnableSystem extends boolean = true,
> = TEnableSystem extends true
  ? TTheme | 'system'
  : TTheme;

export interface ThemeOptions<
  TTheme extends string = LightOrDark,
  TEnableSystem extends boolean = true,
> {
  themes?: readonly TTheme[] | undefined;
  forcedTheme?: TTheme | undefined;
  enableSystem?: TEnableSystem | undefined;
  enableColorScheme?: boolean | undefined;
  cookie?: CookieOptions | undefined;
  defaultTheme?:
    | WithSystem<TTheme, TEnableSystem>
    | undefined;
  attribute?: Attribute | Attribute[] | undefined;
  valueMap?: ThemeValueMap<TTheme> | undefined;
}
