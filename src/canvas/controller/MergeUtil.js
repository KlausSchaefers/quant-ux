/**
 * based on https://gomakethings.com/getting-the-differences-between-two-objects-with-vanilla-js/
 */

export function mergeDeep(target, source) {
    const isObject = (obj) => obj && typeof obj === 'object';

    if (!isObject(target) || !isObject(source)) {
      return source;
    }

    Object.keys(source).forEach(key => {
      const targetValue = target[key];
      const sourceValue = source[key];

      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        /**
         * We have a special case of primitives
         */
        console.debug(targetValue, sourceValue)
        console.debug(targetValue.filter(x => sourceValue.includes(x)))
        target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });

    return target;
  }

/*!
 * Find the differences between two objects and push to a new object
 * (c) 2019 Chris Ferdinandi & Jascha Brinkmann, MIT License, https://gomakethings.com & https://twitter.com/jaschaio
 * @param  {Object} obj1 The original object
 * @param  {Object} obj2 The object to compare against it
 * @return {Object}      An object of differences between the two
 */
export function diff (obj1, obj2) {

  if (!obj2 || Object.prototype.toString.call(obj2) !== '[object Object]') {
      return obj1;
  }
  let diffs = {};
  for (let key in obj1) {
      if (obj1.hasOwnProperty(key)) {
          compare(obj1[key], obj2[key], key, diffs);
      }
  }
  for (let key in obj2) {
      if (obj2.hasOwnProperty(key)) {
          if (!obj1[key] && obj1[key] !== obj2[key] ) {
              diffs[key] = obj2[key];
          }
      }
  }
  return diffs;
}

/**
 * Check if two arrays are equal
 * @param  {Array}   arr1 The first array
 * @param  {Array}   arr2 The second array
 * @return {Boolean}      If true, both arrays are equal
 */
function arraysMatch (arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

/**
 * Compare two items and push non-matches to object
 * @param  {*}      item1 The first item
 * @param  {*}      item2 The second item
 * @param  {String} key   The key in our object
 */
function compare (item1, item2, key, diffs) {

  var type1 = Object.prototype.toString.call(item1);
  var type2 = Object.prototype.toString.call(item2);
  if (type2 === '[object Undefined]') {
      diffs[key] = null;
      return;
  }
  if (type1 !== type2) {
      diffs[key] = item2;
      return;
  }
  if (type1 === '[object Object]') {
      var objDiff = diff(item1, item2);
      if (Object.keys(objDiff).length > 0) {
          diffs[key] = objDiff;
      }
      return;
  }
  if (type1 === '[object Array]') {
      if (!arraysMatch(item1, item2)) {
          diffs[key] = item2;
      }
      return;
  }
  if (type1 === '[object Function]') {
      if (item1.toString() !== item2.toString()) {
          diffs[key] = item2;
      }
  } else {
      if (item1 !== item2 ) {
          diffs[key] = item2;
      }
  }
}