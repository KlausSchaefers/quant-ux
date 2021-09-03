
/*!
 * diff() based on work from 2019 Chris Ferdinandi & Jascha Brinkmann, MIT License, https://gomakethings.com & https://twitter.com/jaschaio
 * mergeDeep() based on https://gomakethings.com/getting-the-differences-between-two-objects-with-vanilla-js/
 *
 */

export function getDelta(a, b) {
    return diff(a,b)
}

export function applyDelta(a, delta) {
    return mergeDeep(a, delta)
}

function mergeDeep(target, source) {


    if (!isObject(target) || !isObject(source)) {
      return source;
    }

    Object.keys(source).forEach(key => {
      const targetValue = target[key];
      const sourceValue = source[key];


      if (isObject(sourceValue) && sourceValue.added && sourceValue.removed && Array.isArray(targetValue)) {
        target[key] = applyArrayDelta(targetValue, sourceValue)
      } else if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {

        /**
         * This diff produces for arrays the updated version. Take a look at compare
         */
        target[key] = sourceValue
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });

    return target;
  }


export function diff (obj1, obj2) {

  if (!obj2 || getType(obj2) !== '[object Object]') {
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


function compare (item1, item2, key, diffs) {

    const type1 = getType(item1);
    const type2 = getType(item2);

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

    if (Array.isArray(item1)) {
        if (!arraysMatch(item1, item2)) {
            if (arrayPrimitive(item1) && arrayPrimitive(item2)) {
                diffs[key] = getArrayDelta(item1, item2);
            } else {
                diffs[key] = item2
            }
        }
        return;
    }

    if (item1 !== item2 ) {
        diffs[key] = item2;
    }

}

function getType(obj) {
    return Object.prototype.toString.call(obj);
}

function applyArrayDelta (item, delta) {
    let result = item.filter(x => !delta.removed.includes(x))
    result = result.concat(delta.added)
    return result
}


function arraysMatch (arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

function arrayPrimitive (arr) {
    for (let i=0; i < arr.length; i++) {
        let value = arr[i]
        if (isObject(value) || Array.isArray(value)) {
            return false
        }
    }
    return true
}

function getArrayDelta (item1, item2) {
    let result = {
        added: [],
        removed: [],
        value: item2
    }

    // check which things are added
    item2.filter(a => {
        if (!item1.includes(a)) {
            result.added.push(a)
        }
    })


    // check which things are added
    item1.filter(a => {
        if (!item2.includes(a)) {
            result.removed.push(a)
        }
    })

    return result
}

function isObject (obj) {
    return obj && typeof obj === 'object';
}