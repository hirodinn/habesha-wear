export function setUser(user) {
  return {
    type: "SET_USER",
    payload: user,
  };
}

export function toggleDarkMode() {
  return {
    type: "TOGGLE_DARK_MODE",
  };
}
