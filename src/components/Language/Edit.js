import React, {Component} from 'react'
import toastr from 'cogo-toast';
import firebase from '../../firebase'

class Edit extends Component
{
	constructor() {
		super();
		//--- Declare method for this component ---//
		this.state = {
			errors : [],
            id: '',
			language  : ''
		}
		//--- Declare method for this component ---//
		this.baseState = this.state
		this.hasErrorFor = this.hasErrorFor.bind(this);
		this.renderErrorFor = this.renderErrorFor.bind(this);
		this.handleUpdate = this.handleUpdate.bind(this);
		this.handleInputFieldChange = this.handleInputFieldChange.bind(this);
	}
	//--- Receive props while update modal open ---//
	UNSAFE_componentWillReceiveProps(recived_data) {
        console.log(recived_data)
		this.setState({
			id   : recived_data.originalData.id,
			language  : recived_data.originalData.language
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
		const data = {
            id : this.state.id,
            language  : this.state.language
		}
		if( !this.checkValidation(data) ) {
            var referenceToEdit = firebase.database().ref('language').orderByChild('id').equalTo(this.state.id);
            referenceToEdit.once('value',function(snapshot){
                    snapshot.forEach(function(child) {
                        child.ref.child('language').set(data.language);
                });
            });
			this.reset();
			this.props.updateState(data, 1);
			document.getElementById("closeEditModal").click();
			toastr.warn('Language updated successfully!', {position : 'top-right', heading: 'Done'});
        }
	}
    //--- Validate all input field ---//
    checkValidation(fields) {
    	var error = {};
    	if(fields.language.length === 0) {
    		error.name = ['This field is required!'];
    	}
		this.setState({
			errors : error
		})
		if(fields.language.length === 0) {
			return true;
		} else {
			return false;
		}
    }
    //--- Reset all state variable while update user ---//
	reset() {
        this.setState(this.baseState);
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
			        		<h5 className="modal-title">Update language information</h5>
			        		<button type="button" className="close" data-dismiss="modal" aria-label="Close">
			          			<span aria-hidden="true">&times;</span>
			        		</button>
			      		</div>
			        <form onSubmit={this.handleUpdate}>
			      		<div className="modal-body">
                          <div className="form-group">
			            		<label htmlFor="language" className="col-form-label">Language:</label>
			            		<input type="text" className={`form-control form-control-sm ${this.hasErrorFor('language') ? 'is-invalid' : ''}`}
			            		 id="language" name="language" placeholder="Language" onChange={this.handleInputFieldChange} value={this.state.language}/>
			            		{this.renderErrorFor('language')}
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