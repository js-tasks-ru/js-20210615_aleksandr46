/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  const localeSort = "ru";
  const optionsSort = {
    caseFirst: "upper",
  };

  return arr
    .slice(0)
    .sort((a, b) =>
      param === "asc"
        ? a.localeCompare(b, localeSort, optionsSort)
        : b.localeCompare(a, localeSort, optionsSort)
    );
}
