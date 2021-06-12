import React, {Component} from 'react'
import toastr from 'cogo-toast';
import firebase from '../../firebase'

import DatePicker from "react-datepicker";

/*dropdown*/
import Dropdown, {
    MenuItem
} from '@trendmicro/react-dropdown';

import Checkbox from 'rc-checkbox';

class Edit extends Component
{
	constructor() {
		super();
		//--- Declare method for this component ---//
		this.state = {
			errors : [],
            id: '',
			name  : '',
            surname : '',
            gender : 'Male',
            DOB: new Date(),
            originalDate: '',
            address: '',
			mobile_no : '',
			email 	  : '',
            active : false,
            jmbg : '',
            degree: '',
            courseTypes: [],
            courses: [],
            /*data from other table*/
            courseTypesToSelect: [],
            coursesToSelect: []
		}
		//--- Declare method for this component ---//
		this.baseState = this.state
		this.hasErrorFor = this.hasErrorFor.bind(this);
		this.renderErrorFor = this.renderErrorFor.bind(this);
		this.handleUpdate = this.handleUpdate.bind(this);
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

        firebase.database().ref('course').once("value", snapshot => {
            if (snapshot && snapshot.exists()) {
                snapshot.forEach(element => {
                    this.setState({
                        coursesToSelect: [...this.state.coursesToSelect, element.val()]
                    });
                });
            }
        });
    }

	//--- Receive props while update modal open ---//
	UNSAFE_componentWillReceiveProps(recived_data) {
        console.log(recived_data)
		this.setState({
			id   : recived_data.originalData.id,
			name  : recived_data.originalData.name,
            surname  : recived_data.originalData.surname,
            gender  : recived_data.originalData.gender,
            originalDate: Date.parse(recived_data.originalData.originalDate),
            DOB  : recived_data.originalData.DOB,
            address  : recived_data.originalData.address,
			mobile_no : recived_data.originalData.mobile_no,
			email     : recived_data.originalData.email,
            active : recived_data.originalData.active,
            jmbg : recived_data.originalData.jmbg,
            degree: recived_data.originalData.degree
		})
	}
	//--- Update state variable value while input field change ---//
	handleInputFieldChange(e) {
		this.setState({
			[e.target.name] : e.target.value
		})
	}
	//--- Update state users variable by props method ---//
	handleUpdate(e) {
		e.preventDefault();
		//--- Declare state variable for this component ---//
        var date = ''+this.state.DOB.toLocaleString("en-GB");
		const data = {
            id : this.state.id,
            name  : this.state.name,
            surname : this.state.surname,
            gender : this.state.gender,
            originalDate: ''+this.state.DOB,
            DOB: date.substr(0,10),
            address: this.state.address,
			mobile_no : this.state.mobile_no,
			email 	  : this.state.email,
            active : this.state.active,
            jmbg : this.state.jmbg,
            degree: this.state.degree,
            courseTypes: this.state.courseTypes,
            courses: this.state.courses
		}
		if( !this.checkValidation(data) ) {
            var referenceToEdit = firebase.database().ref('teacher').orderByChild('id').equalTo(this.state.id);
            referenceToEdit.once('value',function(snapshot){
                    snapshot.forEach(function(child) {
                        child.ref.child('name').set(data.name);
                        child.ref.child('surname').set(data.surname);
                        child.ref.child('gender').set(data.gender);
                        child.ref.child('DOB').set(data.DOB);
                        if (data.originalDate != data.DOB) {
                            child.ref.child('originalDate').set(data.originalDate);
                        }
                        child.ref.child('address').set(data.address);
                        child.ref.child('mobile_no').set(data.mobile_no);
                        child.ref.child('email').set(data.email);
                        child.ref.child('active').set(data.active);
                        child.ref.child('jmbg').set(data.jmbg);
                        child.ref.child('degree').set(data.degree);
                        child.ref.child('courseTypes').set(data.courseTypes);
                        child.ref.child('courses').set(data.courses);
                });
            });
			this.reset();
			this.props.updateState(data, 1);
			document.getElementById("closeEditModal").click();
			toastr.warn('Teacher updated successfully!', {position : 'top-right', heading: 'Done'});
        }
	}
    //--- Validate all input field ---//
    checkValidation(fields) {
    	var error = {};
    	if(fields.name.length === 0) {
    		error.name = ['This field is required!'];
    	}
        if(fields.surname.length === 0) {
    		error.surname = ['This field is required!'];
    	}
        if(fields.address.length === 0) {
    		error.address = ['This field is required!'];
    	}
    	if(fields.mobile_no.length === 0) {
    		error.mobile_no = ['This field is required!'];
    	}
    	if(fields.email.length === 0) {
    		error.email = ['This field is required!'];
    	}
        if(fields.jmbg.length === 0) {
    		error.jmbg = ['This field is required!'];
    	}
        if(fields.degree.length === 0) {
    		error.degree = ['This field is required!'];
    	}
		this.setState({
			errors : error
		})
		if(fields.name.length === 0 || fields.mobile_no.length === 0 || fields.email.length === 0 || fields.surname.length === 0 || fields.address.length === 0 || fields.address.degree === 0 || fields.address.jmbg === 0) {
			return true;
		} else {
			return false;
		}
    }
    //--- Reset all state variable while update user ---//
	reset() {
        this.setState(this.baseState);
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
			<div className="modal fade" id="editModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
			  	<div className="modal-dialog" role="document">
			    	<div className="modal-content">
			      		<div className="modal-header">
			        		<h5 className="modal-title">Update teacher information</h5>
			        		<button type="button" className="close" data-dismiss="modal" aria-label="Close">
			          			<span aria-hidden="true">&times;</span>
			        		</button>
			      		</div>
			        <form onSubmit={this.handleUpdate}>
			      		<div className="modal-body">
                          <div className="form-group">
			            		<label htmlFor="name" className="col-form-label">Name:</label>
			            		<input type="text" className={`form-control form-control-sm ${this.hasErrorFor('name') ? 'is-invalid' : ''}`}
			            		 id="name" name="name" placeholder="Name" onChange={this.handleInputFieldChange} value={this.state.name}/>
			            		{this.renderErrorFor('name')}
			         	 	</div>
                            <div className="form-group">
			            		<label htmlFor="surname" className="col-form-label">Surname:</label>
			            		<input type="text" className={`form-control form-control-sm ${this.hasErrorFor('surname') ? 'is-invalid' : ''}`}
			            		 id="surname" name="surname" placeholder="Surname" onChange={this.handleInputFieldChange} value={this.state.surname}/>
			            		{this.renderErrorFor('surname')}
			         	 	</div>
                            <div className="form-group" style={{marginBottom: '5px'}}>
                            <label htmlFor="gender" className="col-form-label">Gender:</label>
                                <Dropdown style={{marginLeft: "10px", marginTop: "3px"}}>
                                    <Dropdown.Toggle title={this.state.gender == 'Male' ? 'Male' : 'Female'} btnStyle="link"/>
                                    <Dropdown.Menu>
                                        <MenuItem onSelect={() => {
                                                this.setState({
                                                    gender : 'Male'
                                                })
                                            }}>
                                            Male
                                        </MenuItem>
                                        <MenuItem onSelect={() => {
                                                this.setState({
                                                    gender : 'Female'
                                                })
                                            }}>
                                            Female
                                        </MenuItem>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                            <div className="form-group">
                                <label htmlFor="DOB" className="col-form-label" style={{display: 'block'}}>Date of birth:</label>
                                <DatePicker selected={this.state.originalDate} onChange={
                                        (date) => this.setState({
                                            DOB : date,
                                            originalDate: date
                                        })
                                    } />
			         	 	</div>    
                            <div className="form-group">
			            		<label htmlFor="address" className="col-form-label">Address:</label>
			            		<input type="text" className={`form-control form-control-sm ${this.hasErrorFor('address') ? 'is-invalid' : ''}`}
			            		 id="address" name="address" placeholder="Address" onChange={this.handleInputFieldChange} value={this.state.address}/>
			            		{this.renderErrorFor('address')}
			         	 	</div>
			          		<div className="form-group">
			            		<label htmlFor="mobile_no" className="col-form-label">Mobile:</label>
			            		<input type="number" className={`form-control form-control-sm ${this.hasErrorFor('mobile_no') ? 'is-invalid' : ''}`}
			            		 id="mobile_no" name="mobile_no" placeholder="Mobile no" onChange={this.handleInputFieldChange} value={this.state.mobile_no}/>
			            		{this.renderErrorFor('mobile_no')}
			          		</div>
			          		<div className="form-group">
			            		<label htmlFor="email" className="col-form-label">Email:</label>
			            		<input type="email" className={`form-control form-control-sm ${this.hasErrorFor('email') ? 'is-invalid' : ''}`}
			            		 id="email" name="email" placeholder="Email" onChange={this.handleInputFieldChange} value={this.state.email}/>
			            		{this.renderErrorFor('email')}
			          		</div>
                              <div className="form-group">
			            		<label htmlFor="jmbg" className="col-form-label">JMBG:</label>
			            		<input type="text" className={`form-control form-control-sm ${this.hasErrorFor('jmbg') ? 'is-invalid' : ''}`}
			            		 id="jmbg" name="jmbg" placeholder="JMBG" onChange={this.handleInputFieldChange} value={this.state.jmbg}/>
			            		{this.renderErrorFor('jmbg')}
			         	 	</div>
                            <div className="form-group">
			            		<label htmlFor="degree" className="col-form-label">Degree:</label>
			            		<input type="text" className={`form-control form-control-sm ${this.hasErrorFor('degree') ? 'is-invalid' : ''}`}
			            		 id="degree" name="degree" placeholder="Degree" onChange={this.handleInputFieldChange} value={this.state.degree}/>
			            		{this.renderErrorFor('degree')}
			         	 	</div>
                            <div className="form-group" style={{marginBottom: '5px'}}>
                                <label htmlFor="active" className="col-form-label">Active:</label>
                                <Dropdown style={{marginLeft: "10px", marginTop: "3px"}}>
                                    <Dropdown.Toggle btnStyle="link" title={this.state.active ? "Yes" : "No"}/>
                                    <Dropdown.Menu>
                                        <MenuItem onSelect={() => {
                                                this.setState({
                                                    active : true
                                                })
                                            }}>
                                            Yes
                                        </MenuItem>
                                        <MenuItem onSelect={() => {
                                                this.setState({
                                                    active : false
                                                })
                                            }}>
                                            No
                                        </MenuItem>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                            <div className="form-group" style={{marginBottom: '5px'}}>
                                <label htmlFor="coursTypes" className="col-form-label">Course types:</label>
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
                                                            courseTypes : this.state.courseTypes.filter(courseType => {
                                                                courseType.name !== item.name;
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
                            <div className="form-group" style={{marginBottom: '5px'}}>
                                <label htmlFor="coursTypes" className="col-form-label">Courses:</label>
                                        {this.state.coursesToSelect.map((item,index) => (
                                            <label style={{marginLeft: '10px'}}>
                                                <Checkbox
                                                onChange={(e) => {
                                                    if(e.target.checked){
                                                        this.setState({
                                                            courses: [...this.state.courses, item]
                                                        });
                                                    } else {
                                                        this.setState({
                                                            courses : this.state.courses.filter(course => {
                                                                course.name !== item.name;
                                                            })
                                                        });
                                                    }
                                                }}
                                                />
                                                {item.name} &nbsp;
                                            </label>   
                                        ))}
                                {this.renderErrorFor('courses')}
                            </div>
			      		</div>
			      		<div className="modal-footer">
			        		<button type="button" id="closeEditModal" className="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
			        		<button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
			      		</div>
			   		</form>
			    	</div>
			  	</div>
			</div>
        )
    }
}
export default Edit