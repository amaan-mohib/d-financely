export const API =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://d-financely-api.herokuapp.com";
export const key = "5b2702249a7dfe702efbfdf28b32d460";
