const { test, expect, describe } = require('@jest/globals');
const shuffle = require('../src/js/shuffle');

describe("shuffle", () => {
  it("should shuffle an array", () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffledArr = shuffle([...arr]);
    expect(shuffledArr).not.toEqual(arr);
    expect(shuffledArr.sort()).toEqual(arr.sort());
  });

  it("should maintain the same array length", () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffledArr = shuffle([...arr]);
    expect(shuffledArr.length).toEqual(arr.length);
  });
});