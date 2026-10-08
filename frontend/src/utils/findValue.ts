export function getKeyByValue<T extends Record<string, string>>(object: T, value: string) {
  return Object.keys(object).find(key => object[key] === value);
}
