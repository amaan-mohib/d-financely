export const accountList = [
  {
    accountName: "Cash",
    balance: 0,
    index: 0,
    initialBalanace: 0,
    updatedAt: "Never",
  },
];

const accListReducer = (state = accountList, action) => {
  switch (action.type) {
    case "get":
      return action.accounts;
    default:
      return state;
  }
};

export default accListReducer;
