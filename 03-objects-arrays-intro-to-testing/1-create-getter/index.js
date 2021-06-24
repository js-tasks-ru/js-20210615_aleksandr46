/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return function (obj) {
    const arrPath = path.split(".");
    let result;

    for (let i = 0; i < arrPath.length; i++) {
      result =
        typeof result === "object" ? result[arrPath[i]] : obj[arrPath[i]];
    }
    return result;
  };
}
