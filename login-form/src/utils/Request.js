import axios from "axios";
import {ACCESS_TOKEN_NAME, ACCESS_USER_DATA, API_BASE_URL} from "./../constants/apiConstants";

const request = () => {
  const axiosObj = axios.create({
    baseURL: API_BASE_URL,
    timeout: 1000,
    headers: {
      "X-Custom-Header": "foobar",
      Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
    },
  });
  axiosObj.interceptors.response.use((success)=>{
    // success
    return success;
  },(error)=>{
    // on error
    if(error){
      if(error.response && error.response.status === 401){
        localStorage.removeItem(ACCESS_TOKEN_NAME);
        localStorage.removeItem(ACCESS_USER_DATA);
        window.location.reload();
      }
    }
  })
  return axiosObj;
}

export default request;
