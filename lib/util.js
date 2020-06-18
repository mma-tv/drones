let uniqueId = 0;

const util = {
  uid: () => uniqueId++,
  sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),
  randomNumber: (min, max) => Math.floor(Math.random() * (max - min + 1) + min),
  randomItem: arr => arr[util.randomNumber(0, arr.length - 1)],
  randomString: (length, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz') =>
    [...Array(length)].map(() => chars.charAt(util.randomNumber(0, chars.length - 1))).join(''),
};

module.exports = util;
