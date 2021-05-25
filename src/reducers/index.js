import { combineReducers } from "redux";
import accListReducer from "./accountList";
import { transactionsReducer } from "./transactionsCash";

const allReducers = combineReducers({
  accounts: accListReducer,
  transactions: transactionsReducer,
});

export default allReducers;
