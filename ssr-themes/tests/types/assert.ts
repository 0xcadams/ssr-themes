export type AssertEqual<Actual, Expected> = [
  Actual,
  Expected,
] extends [Expected, Actual]
  ? true
  : false;

export declare const expectType: <
  T extends true,
>() => void;
