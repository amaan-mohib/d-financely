export const transactionsReducer = (state = true, action) => {
  switch (action.type) {
    case "reread":
      return !state;
    default:
      return state;
  }
};

// export const bankReducer = (state = "No data available", action) => {
//   switch (action.type) {
//     case "read":
//       return action.banks;
//     default:
//       return state;
//   }
// };
