import React, { Component } from 'react';
import './UserDataComponent.css';
import Axios from 'axios';
import {API_BASE_URL, ACCESS_TOKEN_NAME} from '../../constants/apiConstants';
import request from '../../utils/Request';

class UserDataComponent extends Component {
        
		constructor(props) {
			super(props);
			this.state = {
				successMessage: null
			};
		};
		
		async componentDidMount() {
			var message = "";
			await request().get(API_BASE_URL+'/api/users/userdata', { headers: { 'Authorization': 'Bearer '+localStorage.getItem(ACCESS_TOKEN_NAME) }})
				.then(function (response) {
					if(response.status !== 200){
					  //redirectToLogin()
					  message = "you're unauthorized!";
					} else {
					  message = response.data.name;
					}
				})
				.catch(function (error) {
				  //redirectToLogin()
				  message = "you're unauthorized!";
				});
				
			this.setState({successMessage: message});
		};
		
		render() {
	  
			return (
                <div className="userMessage">			
			        Welcome, {this.state.successMessage}
                </div>				
			);
		};
		
}

export default UserDataComponent;
