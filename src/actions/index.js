export const getAccList = (list) => {
  return {
    type: "get",
    accounts: list,
  };
};

export const transacUpdate = () => {
  return {
    type: "reread",
  };
};
