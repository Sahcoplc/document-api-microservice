/**
 * Test if a value matches a regex expression
 * @param {Regex} regex
 * @param {string} valueToTest
 * @returns {boolean}
 */
export function testRegex(regex, valueToTest) {
    return regex.test(valueToTest);
}  