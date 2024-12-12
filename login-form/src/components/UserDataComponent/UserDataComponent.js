import React, { Component } from 'react';
import './UserDataComponent.css';
import Axios from 'axios';
import {API_BASE_URL, ACCESS_TOKEN_NAME} from '../../constants/apiConstants';
import request from '../../utils/Request';
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
	en: {
	  welcome: "Welcome",
	  unauthorized: "You're unauthorized!"
	},
	fi: {
	   welcome: "Tervetuloa",
	   unauthorized: "Olet luvaton käyttäjä!"
	},
	sv: {
	   welcome: "Välkomna",
	   unauthorized: "Du är obehörig!"
	}
  });

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
					  message = strings.unauthorized;
					} else {
					  message = response.data.name;
					}
				})
				.catch(function (error) {
				  //redirectToLogin()
				  message = strings.unauthorized;
				});
				
			this.setState({successMessage: message});
		};
		
		render() {
	  
			return (
                <div className="userMessage">			
			        {strings.welcome}, {this.state.successMessage}
                </div>				
			);
		};
		
}

export default UserDataComponent;
