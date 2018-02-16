export interface AnyObject {
  [x: string]: any;
}

export function parse(string: string): AnyObject {
  if (string.startsWith('?')) {
    string = string.slice(1);
  }

  return string
    .split('&')
    .map(kv => kv.split('='))
    .reduce((obj, [key, value]) => Object.assign(obj, { [key]: value }), {});
}

export function stringify(object: AnyObject): string {
  return Object.keys(object).reduce((rest, key, index) => {
    const amp = index === 0 ? '' : '&';
    return `${rest}${amp}${key}=${object[key]}`;
  }, '?');
}
