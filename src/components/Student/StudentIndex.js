import React, {Component} from 'react'
import toastr from 'cogo-toast';
import StudentCreate from './StudentCreate'
import StudentEdit from './StudentEdit'

import firebase from '../../firebase'

import "react-datepicker/dist/react-datepicker.css";
import '@trendmicro/react-buttons/dist/react-buttons.css';
import '@trendmicro/react-dropdown/dist/react-dropdown.css';

var deleted = false; //da li se radi o brisanju
var edit = false; //da li se radi o editovanju
var userLoggedIn = false;

class StudentIndex extends Component
{
	constructor() {
		super();
		//--- Declare state variable for this component ---//
		this.state = {
			editUser : {},
            studentData : []
		}
		//--- Declare method for this component ---//
		this.handleUpdateState = this.handleUpdateState.bind(this);
	}

    componentDidMount() {
        if (firebase.auth().currentUser) {
            userLoggedIn = true;
        } else {
            userLoggedIn = false;
        }
        this.fetchBlogs();
    }

    fetchBlogs(){
        firebase.database().ref('student').once("value", snapshot => {
            console.log("FireB ",snapshot)
            if (snapshot && snapshot.exists()) {
                snapshot.forEach(element => {
                        this.setState({
                            studentData: [...this.state.studentData, element.val()]
                        });
                });
            }});
        console.log(this.state.studentData);
    }

	//--- Update state variable while any user insert or update ---//
	handleUpdateState(data, operation) {
		//--- 'operation==1' means update user ---//
        console.log('dataaa'+operation)
		if(operation === 1) {
			this.setState(prevState => ({
				studentData : prevState.studentData.filter(user => {
					if(user.id === data.id)
						return Object.assign(user, data);
					else
						return user;
				})
			}));
			return;
		}
		//--- 'operation==0' means insert user ---//
		var new_users = this.state.studentData.concat(data);
		this.setState({
			studentData : new_users
		})
	}

    handleDeleted() {
        deleted = false;
    }

	//--- Find editable user and update state variable ---//
	handleEditUser(userId) {
        edit = true;
		this.setState({
			editUser : this.state.studentData.find(x => x.id === userId)
		});
	}
	//--- Delete user and update state ---//
	handleDeleteUser(itemToDelete) {
        deleted = true;
        var referenceToDelete = firebase.database().ref('student').orderByChild('id').equalTo(itemToDelete.id);
        referenceToDelete.once('value',function(snapshot){
                snapshot.forEach(function(child) {
                console.log(child.ref);
                child.ref.remove();
            });
        });
		this.setState(prevState => ({
			studentData : prevState.studentData.filter((user, i) => {
				return i !== itemToDelete.position;
			})
		}));
        console.log(itemToDelete);

        toastr.error('Student has been deleted successfully!', {position : 'top-right', heading: 'Done'});
	}

    render() {
      return(
          	<div className="card mt-4">
			    <div className="card-header">
			        <h4 className="card-title"> Students </h4>
                    {userLoggedIn &&
                        <button type="button" className="btn btn-primary btn-sm pull-right" data-toggle="modal" data-target="#addModal" onClick={this.handleDeleted()}> Add Student </button>
                    }
			    </div>
			    <div className="card-body">
			        <div className="col-md-12">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th> Full Name </th>
                                    <th> Gender </th>
                                    <th> DOB </th>
                                    <th> Address </th>
                                    <th> Mobile No </th>
                                    <th> Email </th>
                                    <th> Active </th>
                                    <th> Courses </th>
                                    <th> Actions </th>
                                </tr>
                            </thead>
                            <tbody>
                            {this.state.studentData.map((user, i) => (
                                <tr key={i}>
                                    <td> {user.name + ' ' + user.surname} </td>
                                    <td> {user.gender} </td>
                                    <td> {user.DOB} </td>
                                    <td> {user.address} </td>
                                    <td> {user.mobile_no} </td>
                                    <td> {user.email} </td>
                                    <td> {user.active == false ? 'No' : 'Yes'} </td>
                                    <td>
                                        {typeof user.courses !== 'undefined' &&
                                            user.courses.map((courseIndividual, i) => (
                                                <span>{(i+1)+'.'+courseIndividual.name+' '}</span>
                                            ))
                                        }
                                    </td>
                                    {userLoggedIn &&
                                        <td>
                                            <button className="btn btn-info btn-sm mr-2" onClick={this.handleEditUser.bind(this, user.id)} data-toggle="modal" data-target="#editModal"> Edit </button>
                                            <button className="btn btn-danger btn-sm" onClick={this.handleDeleteUser.bind(this, {position: i, id: user.id})}> Delete </button>
                                        </td>
                                    }
                                </tr>
                            ))}
                            </tbody>
                        </table>
			        </div>
			    </div>
			    <StudentCreate updateState = {this.handleUpdateState} />
			    <StudentEdit updateState = {this.handleUpdateState} studentData = {this.state.editUser} />
			</div>
        )
    }
}
export default StudentIndex