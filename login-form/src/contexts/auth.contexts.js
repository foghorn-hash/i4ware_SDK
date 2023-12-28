/* eslint-disable default-case */
import React, {useReducer} from "react";
import { ACCESS_TOKEN_NAME, ACCESS_USER_DATA } from "../constants/apiConstants";

const reducer = (state, action) => {
  console.log(action.payload);
  switch (action.type) {
    case AUTH_STATE_CHANGED:
      return {
        user: action.payload.user,
        token: action.payload.token,
        isLogged: action.payload.isLogged,
      };
  }
  return state;
};

export const AUTH_STATE_CHANGED = "AUTH_STATE_CHANGED";

const AuthContext = React.createContext();

const AuthProvider = props => {
  let user = null;
  if(localStorage.getItem(ACCESS_USER_DATA)){
    user = JSON.parse(localStorage.getItem(ACCESS_USER_DATA))
  }
  const [authState, dispatch] = useReducer(reducer, {
    user: localStorage.getItem(ACCESS_USER_DATA)?user:null,
    token: localStorage.getItem(ACCESS_TOKEN_NAME),
    isLogged: localStorage.getItem(ACCESS_TOKEN_NAME)?true:false,
  });

  const actions = {
    authStateChanged: user => {
      dispatch({type: AUTH_STATE_CHANGED, payload: user});
    },
  };

  return (
    <AuthContext.Provider
      value={{
        authState: authState,
        authActions: actions,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export {AuthProvider, AuthContext};
