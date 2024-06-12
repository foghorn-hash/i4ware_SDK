import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";
import {ACCESS_TOKEN_NAME, API_BASE_URL} from "../../constants/apiConstants";
import axios from "axios";
import UserDataComponent from "../../components/UserDataComponent/UserDataComponent";

function Home() {

  return (
    <div className="mt-2">
      <UserDataComponent />
    </div>
  );
}

export default withRouter(Home);