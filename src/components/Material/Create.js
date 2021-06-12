import React, {Component} from 'react'
import toastr from 'cogo-toast';
import firebase from '../../firebase'

import DatePicker from "react-datepicker";

import Checkbox from 'rc-checkbox';

class Create extends Component
{
	constructor() {
		super();
		//--- Declare state variable for this component ---//
		this.state = {
			errors : [],
			authorName  : '',
            authorSurname : '',
            publisher : '',
            date: new Date(),
            publisherCity: '',
            courseTypes: [],
			courseTypesToSelect: [],
		}
		//--- Declare method for this component ---//
		this.baseState = this.state
		this.hasErrorFor = this.hasErrorFor.bind(this);
		this.renderErrorFor = this.renderErrorFor.bind(this);
		this.handleInsert = this.handleInsert.bind(this);
		this.handleInputFieldChange = this.handleInputFieldChange.bind(this);
        this.fetchData();
	}

    fetchData(){
        firebase.database().ref('course_type').once("value", snapshot => {
            if (snapshot && snapshot.exists()) {
                snapshot.forEach(element => {
                    this.setState({
                        courseTypesToSelect: [...this.state.courseTypesToSelect, element.val()]
                    });
                });
            }
        });
    }

	//--- Update state variable value while input field change ---//
	handleInputFieldChange(e) {
		this.setState({
			[e.target.name] : e.target.value
		});
	}

	//--- Insert new user in users state array by props method ---//
	handleInsert(e) {
		e.preventDefault();
		const data = {
            id : '_' + Math.random().toString(36).substr(2, 9),
            authorName  : this.state.authorName,
            authorSurname : this.state.authorSurname,
            publisher : this.state.publisher,
            originalDate: ''+this.state.date,
            date: ''+this.state.date.toLocaleDateString("en-GB"),
            publisherCity: this.state.publisherCity,
            courseTypes: Array.from(new Set(this.state.courseTypes)),
		}
        data.courseTypes.forEach(item => {
            delete item.material; //removing material from courseType in material table 
        });
		if( !this.checkValidation(data) ) {
            const firestore = firebase.database().ref('/material');
            firestore.push(data);
			this.reset();
			this.props.updateState(data, 0);
			document.getElementById("closeAddModal").click();
			toastr.success('New material added successfully!', {position : 'top-right', heading: 'Done'});
		}
	}
	//--- Validate all input field ---//
    checkValidation(fields) {
    	var error = {};
    	if(fields.authorName.length === 0) {
    		error.authorName = ['This field is required!'];
    	}
        if(fields.authorSurname.length === 0) {
    		error.authorSurname = ['This field is required!'];
    	}
        if(fields.publisher.length === 0) {
    		error.publisher = ['This field is required!'];
    	}
    	if(fields.publisherCity.length === 0) {
    		error.publisherCity = ['This field is required!'];
    	}
		this.setState({
			errors : error
		})
		if(fields.authorName.length === 0 || fields.authorSurname.length === 0 || fields.publisher.length === 0 || fields.publisherCity.length === 0) {
			return true;
		} else {
			return false;
		}
    }
    //--- Reset all state variable while insert new user ---//
    reset() {
        this.setState(this.baseState);
        document.getElementById("form").reset();
        this.fetchData();
    }
    //--- Check that any validation errors occure for input field ---//
	hasErrorFor(fieldName) {
		return !!this.state.errors[fieldName];
	}
	//--- Render error for specific validation fail input field ---//
	renderErrorFor(fieldName) {
    	if (this.hasErrorFor(fieldName)) {
	        return (
	        	<em className="error invalid-feedback"> {this.state.errors[fieldName][0]} </em>
	        )
      	}
    }

    render() {
      return(
			<div className="modal fade" id="addModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
			  	<div className="modal-dialog" role="document">
			    	<div className="modal-content">
			      		<div className="modal-header">
			        		<h5 className="modal-title">New material</h5>
			        		<button type="button" className="close" data-dismiss="modal" aria-label="Close">
			          			<span aria-hidden="true">&times;</span>
			        		</button>
			      		</div>
			        <form id="form" onSubmit={this.handleInsert}>
			      		<div className="modal-body">
			          		<div className="form-group">
			            		<label htmlFor="authorName" className="col-form-label">Author name:</label>
			            		<input type="text" className={`form-control form-control-sm ${this.hasErrorFor('authorName') ? 'is-invalid' : ''}`}
			            		 id="authorName" name="authorName" placeholder="Author name" onChange={this.handleInputFieldChange} value={this.state.authorName}/>
			            		{this.renderErrorFor('authorName')}
			         	 	</div>
                            <div className="form-group">
			            		<label htmlFor="authorSurname" className="col-form-label">Author surname:</label>
			            		<input type="text" className={`form-control form-control-sm ${this.hasErrorFor('authorSurname') ? 'is-invalid' : ''}`}
			            		 id="authorSurname" name="authorSurname" placeholder="Author surname" onChange={this.handleInputFieldChange} value={this.state.authorSurname}/>
			            		{this.renderErrorFor('authorSurname')}
			         	 	</div>
                            <div className="form-group">
                                <label htmlFor="date" className="col-form-label" style={{display: 'block'}}>Date:</label>
                                <DatePicker selected={this.state.date} onChange={
                                        (date) => this.setState({
                                            date : date
                                        })
                                    } />
			         	 	</div>    
                            <div className="form-group">
			            		<label htmlFor="publisher" className="col-form-label">Publisher:</label>
			            		<input type="text" className={`form-control form-control-sm ${this.hasErrorFor('publisher') ? 'is-invalid' : ''}`}
			            		 id="publisher" name="publisher" placeholder="Publisher" onChange={this.handleInputFieldChange} value={this.state.publisher}/>
			            		{this.renderErrorFor('publisher')}
			         	 	</div>
			          		<div className="form-group">
			            		<label htmlFor="publisherCity" className="col-form-label">Publisher city:</label>
			            		<input type="text" className={`form-control form-control-sm ${this.hasErrorFor('publisherCity') ? 'is-invalid' : ''}`}
			            		 id="publisherCity" name="publisherCity" placeholder="Publisher city" onChange={this.handleInputFieldChange} value={this.state.publisherCity}/>
			            		{this.renderErrorFor('publisherCity')}
			          		</div>
                            <div className="form-group" style={{marginBottom: '5px'}}>
                                <label htmlFor="courseTypes" className="col-form-label">Course types:</label>
                                        {this.state.courseTypesToSelect.map((item,index) => (
                                            <label style={{marginLeft: '10px'}}>
                                                <Checkbox
                                                onChange={(e) => {
                                                    if(e.target.checked){
                                                        this.setState({
                                                            courseTypes: [...this.state.courseTypes, item]
                                                        });
                                                    } else {
                                                        this.setState({
                                                            courseTypes : this.state.courseTypes.filter(course => {
                                                                course.name !== item.name;
                                                            })
                                                        });
                                                    }
                                                }}
                                                />
                                                {item.name} &nbsp;
                                            </label>   
                                        ))}
                                {this.renderErrorFor('courseTypes')}
                            </div>
			      		</div>
			      		<div className="modal-footer">
			        		<button type="button" id="closeAddModal" className="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
			        		<button type="submit" className="btn btn-primary btn-sm">Save Material</button>
			      		</div>
			   		</form>
			    	</div>
			  	</div>
			</div>
        )
    }
}
export default Create