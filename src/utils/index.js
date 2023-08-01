export const fancyDateNoTime = date => {
    const date_ = new Date(date)
      .toLocaleString()
      .replace(/\//g, '-')
      .split(',')[0].split('-').reverse().join('-');
    
    return `${date_}`;
};

export const _showTimeStamp = timeStamp => {
  const date = new Date(timeStamp).toLocaleDateString().replace(/\//g, '-');
  const newTime = new Date(timeStamp).toLocaleTimeString().split(':');
  let hour = parseInt(newTime[0]) - 1;
  // const ampm = hour >= 12 ? 'PM' : 'AM';
  let time = `${hour}:${newTime[1]}`;
  return { date, time };
};

/**
 *
 * @param {Object} obj
 * @param {Array<String>} properties
 * @returns {Object}
 */
export const removePropertiesFromObject = (obj, properties) => {
  return properties.reduce((fields, key) => {
      delete fields[key];
      return fields;
  }, obj);
};

export const _joinArr = (arr = [], ellipsis = false) => {
  if (arr.length < 2) {
      return arr.join(" and ");
  } else if (ellipsis) {
      const array = arr.slice(0, -1);
      return `${array.join(", ")}, ${arr[arr.length - 1]}...`;
  }
  const array = arr.slice(0, -1);
  return `${array.join(", ")} and ${arr[arr.length - 1]}`;
};

export const _arrayObjectToString = (arr, label) => {
  if (arr) {
      const temp = arr.map((arrayObject) => arrayObject[label]);
      return _joinArr(temp);
  }
};
