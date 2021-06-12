import React, {Component} from 'react'
import toastr from 'cogo-toast';
import Create from './Create'
import Edit from './Edit'

import firebase from '../../firebase'

import "react-datepicker/dist/react-datepicker.css";
import '@trendmicro/react-buttons/dist/react-buttons.css';
import '@trendmicro/react-dropdown/dist/react-dropdown.css';

var deleted = false; //da li se radi o brisanju
var edit = false; //da li se radi o editovanju
var userLoggedIn = false;

class Index extends Component
{
	constructor() {
		super();
		//--- Declare state variable for this component ---//
		this.state = {
			editData : {},
            originalData : []
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
        firebase.database().ref('course_type').once("value", snapshot => {
            console.log("FireB ",snapshot)
            if (snapshot && snapshot.exists()) {
                snapshot.forEach(element => {
                        this.setState({
                            originalData: [...this.state.originalData, element.val()]
                        });
                });
            }});
        //console.log(this.state.originalData);
    }

	//--- Update state variable while any user insert or update ---//
	handleUpdateState(data, operation) {
		//--- 'operation==1' means update user ---//
        console.log('dataaa'+operation)
		if(operation === 1) {
			this.setState(prevState => ({
				originalData : prevState.originalData.filter(filter => {
					if(filter.id === data.id)
						return Object.assign(filter, data);
					else
						return filter;
				})
			}));
			return;
		}
		//--- 'operation==0' means insert user ---//
		var new_data = this.state.originalData.concat(data);
		this.setState({
			originalData : new_data
		})
	}

    handleDeleted() {
        deleted = false;
    }

	//--- Find editable user and update state variable ---//
	handleEditData(dataId) {
        edit = true;
		this.setState({
			editData : this.state.originalData.find(x => x.id === dataId)
		});
	}
	//--- Delete user and update state ---//
	handleDelete(itemToDelete) {
        deleted = true;
        var referenceToDelete = firebase.database().ref('course_type').orderByChild('id').equalTo(itemToDelete.id);
        referenceToDelete.once('value',function(snapshot){
                snapshot.forEach(function(child) {
                child.ref.remove();
            });
        });
		this.setState(prevState => ({
			originalData : prevState.originalData.filter((user, i) => {
				return i !== itemToDelete.position;
			})
		}));
        console.log(itemToDelete);

        toastr.error('Course type has been deleted successfully!', {position : 'top-right', heading: 'Done'});
	}

    render() {
      return(
          	<div className="card mt-4">
			    <div className="card-header">
			        <h4 className="card-title"> Course Types </h4>
                    {userLoggedIn &&
                        <button type="button" className="btn btn-primary btn-sm pull-right" data-toggle="modal" data-target="#addModal" onClick={this.handleDeleted()}> Add Course Type </button>
                    }
			    </div>
			    <div className="card-body">
			        <div className="col-md-12">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th> Name </th>
                                    <th> Price </th>
                                    <th> Number of classes </th>
                                    <th> Level </th>
                                    <th> Language </th>
                                    <th> Intensity </th>
                                    <th> Materials </th>
                                    <th> Teachers </th>
                                    <th> Actions </th>
                                </tr>
                            </thead>
                            <tbody>
                            {this.state.originalData.map((data, i) => (
                                <tr key={i}>
                                    <td> {data.name} </td>
                                    <td> {data.price} </td>
                                    <td> {data.classes} </td>
                                    <td> {data.level.label} </td>
                                    <td> {data.language.language} </td>
                                    <td> {data.intensity.name} </td>
                                    <td>
                                        {data.materials.map((materialIndividual, i) => (
                                            <span>{(i+1)+'.'+materialIndividual.publisher+' ('+materialIndividual.authorName+') '}</span>
                                        ))}
                                    </td>
                                    <td>
                                        {data.teachers.map((teacherIndividual, i) => (
                                            <span>{(i+1)+'.'+teacherIndividual.name+' '+teacherIndividual.surname}</span>
                                        ))}
                                    </td>
                                    {userLoggedIn &&
                                        <td>
                                            <button className="btn btn-info btn-sm mr-2" onClick={this.handleEditData.bind(this, data.id)} data-toggle="modal" data-target="#editModal"> Edit </button>
                                            <button className="btn btn-danger btn-sm" onClick={this.handleDelete.bind(this, {position: i, id: data.id})}> Delete </button>
                                        </td>
                                    }
                                </tr>
                            ))}
                            </tbody>
                        </table>
			        </div>
			    </div>
			    <Create updateState = {this.handleUpdateState} />
			    <Edit updateState = {this.handleUpdateState} originalData = {this.state.editData} />
			</div>
        )
    }
}
export default Index