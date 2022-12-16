export const addHoursToDate = (dateObj, hours) => {
  return new Date(dateObj.getTime() + hours * 60 * 60 * 1000);
};

export const formatDate = (date) => {
  // dd/mm/yyyy date format is expected
  if (!date) {
    return null;
  }
  const dateSplit = date.split("/");
  return new Date(dateSplit[2], dateSplit[1], dateSplit[0]);
};
