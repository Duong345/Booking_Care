export enum KeyCode {
  UP = 38,
  DOWN = 40,
  TAB = 9,
  ENTER = 13,
  E = 69,
  ESCAPE = 27,
}

export const isNavigation = (e: number): boolean => {
  return (
    (e >= 33 && e <= 40) ||
    e === 9 ||
    e === 8 ||
    e === 46 ||
    e === 14 ||
    e === 13
  );
};

export const isNumeric = (e: number): boolean => {
  return (e >= 48 && e <= 57) || (e >= 96 && e <= 105);
};

export const isAlphabetic = (e: number): boolean => {
  return e >= 65 && e <= 90;
};

export const isDecimal = (e: number): boolean => {
  return e === 190 || e === 188 || e === 108 || e === 110;
};

export const isDash = (e: number): boolean => {
  return e === 109 || e === 189;
};

export const KeyCodeUtils = {
  UP: KeyCode.UP,
  DOWN: KeyCode.DOWN,
  TAB: KeyCode.TAB,
  ENTER: KeyCode.ENTER,
  E: KeyCode.E,
  ESCAPE: KeyCode.ESCAPE,
  isNavigation,
  isNumeric,
  isAlphabetic,
  isDecimal,
  isDash,
};
