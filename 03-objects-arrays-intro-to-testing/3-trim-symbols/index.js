/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (!isFinite(size)) {
    return string;
  }

  if (size < 1) {
    return "";
  }

  let result = "";
  let symbolsCount = 0;

  for (let i = 0; i < string.length; i++) {
    if (symbolsCount < size - 1 && string[i + 1] === string[i]) {
      result += string[i];
      symbolsCount++;
    } else if (string[i + 1] !== string[i]) {
      result += string[i];
      symbolsCount = 0;
    }
  }

  return result;
}
