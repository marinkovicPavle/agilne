import React, { Component } from 'react'
import toastr from 'cogo-toast';
import firebase from '../../firebase'

import DatePicker from "react-datepicker";

import Checkbox from 'rc-checkbox';

class Edit extends Component {
    constructor() {
        super();
        //--- Declare method for this component ---//
        this.state = {
            errors: [],
            authorName: '',
            authorSurname: '',
            publisher: '',
            date: new Date(),
            publisherCity: '',
            courseTypes: [],
            courseTypesToSelect: [],
        }
        //--- Declare method for this component ---//
        this.baseState = this.state
        this.hasErrorFor = this.hasErrorFor.bind(this);
        this.renderErrorFor = this.renderErrorFor.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.handleInputFieldChange = this.handleInputFieldChange.bind(this);
        this.fetchData();
    }

    fetchData() {
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

    //--- Receive props while update modal open ---//
    UNSAFE_componentWillReceiveProps(recived_data) {
        console.log(recived_data)
        this.setState({
            id: recived_data.originalData.id,
            authorName: recived_data.originalData.authorName,
            authorSurname: recived_data.originalData.authorSurname,
            publisher: recived_data.originalData.publisher,
            originalDate: Date.parse(recived_data.originalData.originalDate),
            date: recived_data.originalData.date,
            publisherCity: recived_data.originalData.publisherCity,
            //courseTypes: recived_data.originalData.courseTypes
        })
    }
    //--- Update state variable value while input field change ---//
    handleInputFieldChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    //--- Update state users variable by props method ---//
    handleUpdate(e) {
        e.preventDefault();
        //--- Declare state variable for this component ---//
        var date = '' + this.state.date.toLocaleString("en-GB");
        const data = {
            id: this.state.id,
            authorName: this.state.authorName,
            authorSurname: this.state.authorSurname,
            publisher: this.state.publisher,
            originalDate: '' + this.state.date,
            date: date.substr(0, 10),
            publisherCity: this.state.publisherCity,
            courseTypes: Array.from(new Set(this.state.courseTypes))
        }
        data.courseTypes.forEach(item => {
            delete item.material; //removing material from courseType in material table 
        });
        if (!this.checkValidation(data)) {
            var referenceToEdit = firebase.database().ref('material').orderByChild('id').equalTo(this.state.id);
            referenceToEdit.once('value', function (snapshot) {
                snapshot.forEach(function (child) {
                    child.ref.child('authorName').set(data.authorName);
                    child.ref.child('authorSurname').set(data.authorSurname);
                    child.ref.child('publisher').set(data.publisher);
                    child.ref.child('date').set(data.date);
                    if (data.originalDate != data.date) {
                        child.ref.child('originalDate').set(data.originalDate);
                    }
                    child.ref.child('publisherCity').set(data.publisherCity);
                    child.ref.child('courseTypes').set(data.courseTypes);
                });
            });
            this.reset();
            this.props.updateState(data, 1);
            document.getElementById("closeEditModal").click();
            toastr.warn('Material updated successfully!', { position: 'top-right', heading: 'Done' });
        }
    }
    //--- Validate all input field ---//
    checkValidation(fields) {
        var error = {};
        if (fields.authorName.length === 0) {
            error.authorName = ['This field is required!'];
        }
        if (fields.authorSurname.length === 0) {
            error.authorSurname = ['This field is required!'];
        }
        if (fields.publisher.length === 0) {
            error.publisher = ['This field is required!'];
        }
        if (fields.publisherCity.length === 0) {
            error.publisherCity = ['This field is required!'];
        }
        this.setState({
            errors: error
        })
        if (fields.authorName.length === 0 || fields.authorSurname.length === 0 || fields.publisher.length === 0 || fields.publisherCity.length === 0) {
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

    /*checkIfContainCourseType(item) {
        if (typeof this.state.courseTypes !== 'undefined'){
            console.log('PROVERAVAAM')
            this.state.courseTypes.forEach(element => {
                if (element.name == item.name) {
                    console.log('sad sam true')
                    return true;
                }
                console.log('sad sam false')
                return false;
            });
        }
        return true;
    }*/

    render() {
        return (
            <div className="modal fade" id="editModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Update material information</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <form onSubmit={this.handleUpdate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="authorName" className="col-form-label">Author name:</label>
                                    <input type="text" className={`form-control form-control-sm ${this.hasErrorFor('authorName') ? 'is-invalid' : ''}`}
                                        id="authorName" name="authorName" placeholder="Author name" onChange={this.handleInputFieldChange} value={this.state.authorName} />
                                    {this.renderErrorFor('authorName')}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="authorSurname" className="col-form-label">Author surname:</label>
                                    <input type="text" className={`form-control form-control-sm ${this.hasErrorFor('authorSurname') ? 'is-invalid' : ''}`}
                                        id="authorSurname" name="authorSurname" placeholder="Author surname" onChange={this.handleInputFieldChange} value={this.state.authorSurname} />
                                    {this.renderErrorFor('authorSurname')}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="date" className="col-form-label" style={{ display: 'block' }}>Date:</label>
                                    <DatePicker selected={this.state.originalDate} onChange={
                                        (date) => this.setState({
                                            date: date,
                                            originalDate: date
                                        })
                                    } />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="publisher" className="col-form-label">Publisher:</label>
                                    <input type="text" className={`form-control form-control-sm ${this.hasErrorFor('publisher') ? 'is-invalid' : ''}`}
                                        id="publisher" name="publisher" placeholder="Publisher" onChange={this.handleInputFieldChange} value={this.state.publisher} />
                                    {this.renderErrorFor('publisher')}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="publisherCity" className="col-form-label">Publisher city:</label>
                                    <input type="text" className={`form-control form-control-sm ${this.hasErrorFor('publisherCity') ? 'is-invalid' : ''}`}
                                        id="publisherCity" name="publisherCity" placeholder="Publisher city" onChange={this.handleInputFieldChange} value={this.state.publisherCity} />
                                    {this.renderErrorFor('publisherCity')}
                                </div>
                                <div className="form-group" style={{ marginBottom: '5px' }}>
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