export const valuesFromReqArr = (id, arr) => {
  return arr.map((element) => {
    return [id, element];
  });
};
