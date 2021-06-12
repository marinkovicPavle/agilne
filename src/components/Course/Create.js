import React, {Component} from 'react'
import toastr from 'cogo-toast';
import firebase from '../../firebase'

import DatePicker from "react-datepicker";

/*dropdown*/
import Dropdown, {
    MenuItem
} from '@trendmicro/react-dropdown';

import Checkbox from 'rc-checkbox';

class Create extends Component
{
	constructor() {
		super();
		//--- Declare state variable for this component ---//
		this.state = {
			errors : [],
			name  : '',
            capacity : '',
            dateOfStart : new Date(),
            students : [],
            teachers: [],
            courseType: {},
            /*data from other tables*/
            courseTypeToSelect: [],
            studentsToSelect: [],
            teachersToSelect: []
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
                        courseTypeToSelect: [...this.state.courseTypeToSelect, element.val()]
                    });
                });
            }
        });

        firebase.database().ref('teacher').once("value", snapshot => {
            if (snapshot && snapshot.exists()) {
                snapshot.forEach(element => {
                    this.setState({
                        teachersToSelect: [...this.state.teachersToSelect, element.val()]
                    });
                });
            }
        });

        firebase.database().ref('student').once("value", snapshot => {
            if (snapshot && snapshot.exists()) {
                snapshot.forEach(element => {
                    this.setState({
                        studentsToSelect: [...this.state.studentsToSelect, element.val()]
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
            name  : this.state.name,
            capacity : this.state.capacity,
            originalDate: ''+this.state.dateOfStart,
            dateOfStart: ''+this.state.dateOfStart.toLocaleDateString("en-GB"),
            courseType: this.state.courseType,
            students : Array.from(new Set(this.state.students)),
            teachers: Array.from(new Set(this.state.teachers))
		}
        data.students.forEach(item => {
            delete item.courses; //removing courseTypes from material in courseType table 
        });
        data.teachers.forEach(item => {
            delete item.courseTypes; //removing courseTypes from material in courseType table 
            delete item.courses;
        });
		if( !this.checkValidation(data) ) {
            const firestore = firebase.database().ref('/course');
            firestore.push(data);
			this.reset();
			this.props.updateState(data, 0);
			document.getElementById("closeAddModal").click();
			toastr.success('New course added successfully!', {position : 'top-right', heading: 'Done'});
		}
	}
	//--- Validate all input field ---//
    checkValidation(fields) {
    	var error = {};
    	if(fields.name.length === 0) {
    		error.name = ['This field is required!'];
    	}
        if(fields.capacity.length === 0) {
    		error.capacity = ['This field is required!'];
    	}
        if(Object.keys(this.state.courseType).length === 0){
            error.courseType = ['You must select course type!'];
        }
        if(this.state.students.length === 0){
            error.students = ['You must select at least one student!'];
        }
        if(this.state.teachers.length === 0){
            error.teachers = ['You must select at least one teacher!'];
        }
		this.setState({
			errors : error
		})
		if(fields.name.length === 0 || fields.capacity.length === 0 || this.state.teachers.length === 0 || this.state.students.length === 0 || Object.keys(this.state.courseType).length === 0) {
			return true;
		} else {
			return false;
		}
    }
    //--- Reset all state variable while insert new user ---//
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
			<div className="modal fade" id="addModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
			  	<div className="modal-dialog" role="document">
			    	<div className="modal-content">
			      		<div className="modal-header">
			        		<h5 className="modal-title">New course</h5>
			        		<button type="button" className="close" data-dismiss="modal" aria-label="Close">
			          			<span aria-hidden="true">&times;</span>
			        		</button>
			      		</div>
			        <form onSubmit={this.handleInsert}>
			      		<div className="modal-body">
			          		<div className="form-group">
			            		<label htmlFor="name" className="col-form-label">Name:</label>
			            		<input type="text" className={`form-control form-control-sm ${this.hasErrorFor('name') ? 'is-invalid' : ''}`}
			            		 id="name" name="name" placeholder="Name" onChange={this.handleInputFieldChange} value={this.state.name}/>
			            		{this.renderErrorFor('name')}
			         	 	</div>
                            <div className="form-group">
			            		<label htmlFor="capacity" className="col-form-label">Capacity:</label>
			            		<input type="text" className={`form-control form-control-sm ${this.hasErrorFor('capacity') ? 'is-invalid' : ''}`}
			            		 id="capacity" name="capacity" placeholder="Capacity" onChange={this.handleInputFieldChange} value={this.state.capacity}/>
			            		{this.renderErrorFor('capacity')}
			         	 	</div>
                            <div className="form-group" style={{marginBottom: '5px'}}>
                                <label htmlFor="courseType" className="col-form-label">Course type:</label>
                                <Dropdown style={{marginLeft: "10px", marginTop: "3px"}} className={`${this.hasErrorFor('courseType') ? 'is-invalid' : ''}`}>
                                    <Dropdown.Toggle title={Object.keys(this.state.courseType).length === 0 ? 'Course Type' : this.state.courseType.name} btnStyle="link"/>
                                    <Dropdown.Menu>
                                        {this.state.courseTypeToSelect.map(item => (
                                            <MenuItem eventKey={item} onSelect={(eventKey) => {
                                                this.setState({
                                                    courseType : eventKey
                                                });
                                            }}>
                                                {item.name} 
                                            </MenuItem>
                                            ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                                {this.renderErrorFor('courseType')}
                            </div>
                            <div className="form-group">
                                <label htmlFor="dateOfStart" className="col-form-label" style={{display: 'block'}}>Date of start:</label>
                                <DatePicker selected={this.state.dateOfStart} onChange={
                                        (date) => this.setState({
                                            dateOfStart : date
                                        })
                                    } />
			         	 	</div>  
                            <div className="form-group" style={{marginBottom: '5px'}}>
                                <label htmlFor="students" className="col-form-label">Students:</label>
                                        {this.state.studentsToSelect.map((item,index) => (
                                            <label style={{marginLeft: '10px'}} className={`${this.hasErrorFor('students') ? 'is-invalid' : ''}`}>
                                                <Checkbox
                                                onChange={(e) => {
                                                    if(e.target.checked){
                                                        this.setState({
                                                            students: [...this.state.students, item]
                                                        });
                                                    } else {
                                                        this.setState({
                                                            students : this.state.students.filter(student => {
                                                                student.name !== item.name;
                                                            })
                                                        });
                                                    }
                                                }}
                                                />
                                                {item.name +' '+item.surname} &nbsp;
                                            </label>   
                                        ))}
                                {this.renderErrorFor('students')}
                            </div>
                            <div className="form-group" style={{marginBottom: '5px'}}>
                                <label htmlFor="teachers" className="col-form-label">Teachers:</label>
                                        {this.state.teachersToSelect.map((item,index) => (
                                            <label style={{marginLeft: '10px'}} className={`${this.hasErrorFor('teachers') ? 'is-invalid' : ''}`}>
                                                <Checkbox
                                                onChange={(e) => {
                                                    if(e.target.checked){
                                                        this.setState({
                                                            teachers: [...this.state.teachers, item]
                                                        });
                                                    } else {
                                                        this.setState({
                                                            teachers : this.state.teachers.filter(teacher => {
                                                                teacher.name !== item.name;
                                                            })
                                                        });
                                                    }
                                                }}
                                                />
                                                {item.name +' '+item.surname} &nbsp;
                                            </label>   
                                        ))}
                                {this.renderErrorFor('teachers')}
                            </div>
			      		</div>
			      		<div className="modal-footer">
			        		<button type="button" id="closeAddModal" className="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
			        		<button type="submit" className="btn btn-primary btn-sm">Save Course Type</button>
			      		</div>
			   		</form>
			    	</div>
			  	</div>
			</div>
        )
    }
}
export default Create