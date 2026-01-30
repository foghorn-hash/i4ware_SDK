import React, { Component } from 'react';
import './VerificationComponent.css';
import Axios from 'axios';
import {API_BASE_URL, ACCESS_TOKEN_NAME} from '../../constants/apiConstants';
import { withRouter } from 'react-router-dom';

function parse_query_string(query) {
  var vars = query.split("&");
  var query_string = {};
  for (var i = 0; i < vars.length; i++) {
	var pair = vars[i].split("=");
	var key = decodeURIComponent(pair.shift());
	var value = decodeURIComponent(pair.join("="));
	// If first entry with this name
	if (typeof query_string[key] === "undefined") {
	  query_string[key] = value;
	  // If second entry with this name
	} else if (typeof query_string[key] === "string") {
	  var arr = [query_string[key], value];
	  query_string[key] = arr;
	  // If third or later entry with this name
	} else {
	  query_string[key].push(value);
	}
  }
  return query_string;
}

class VerificationComponent extends Component {
        
	constructor(props) {
		super(props);
		this.state = {
			successMessage: null,
			status: null
		};
	}
	
	componentDidMount() {
		var url_string = this.props.location.search.substring(1);
		var url = parse_query_string(url_string);
		var status = url.status || 'error';
		var message = url.message || 'Email verification status unknown.';
		console.log('Status:', status, 'Message:', message);
		this.setState({
			successMessage: message,
			status: status
		});
	}
	
	render() {
		return (
			<div className={`successMessage ${this.state.status === 'success' || this.state.status === 'already-verified' ? 'success' : 'error'}`}>
				{this.state.successMessage}
			</div>
		);
	}
		
}

export default  withRouter(VerificationComponent);