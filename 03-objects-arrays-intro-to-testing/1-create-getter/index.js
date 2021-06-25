/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const arrPath = path.split(".");

  return function (obj) {
    let result;

    for (let itemPath of arrPath) {
      result = typeof result === "object" ? result[itemPath] : obj[itemPath];
    }
    return result;
  };
}
