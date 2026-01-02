const initialValue = { user: null, darkMode: false };

export const userReducer = (state = initialValue, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "TOGGLE_DARK_MODE":
      return { ...state, darkMode: !state.darkMode };
    default:
      return state;
  }
};
