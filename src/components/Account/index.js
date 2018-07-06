import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { compose } from 'recompose';
import axios from 'axios';
import { PasswordForgetForm } from '../PasswordForget';
import PasswordChangeForm from '../PasswordChange';
import withAuthorization from '../Session/withAuthorization';
import { db ,firebase} from '../../firebase/firebase';
import FileUploader from "react-firebase-file-uploader";

        console.log('--------firebase-------------', firebase);


class AccountPage extends Component {
  state = {
    workspace:'',
    token: '',
    workspace_image: null,
    isPublished: false,
    workspace_background:null,
    progress:0,
  }

  publish = () => {
    console.log('--------p0blshy',this.state);
    axios.post('http://localhost:3001/api/workspace',{
      userId: this.props.sessionStore.authUser.uid,
      token: this.state.token,
      workspace: this.state.workspace,
      workspace_image: this.state.workspace_image,
      workspace_background:this.state.workspace_background,
      
    }).then((data, status) => {
      if(status === 200){
        this.setState({
          workspace_image:null,
          isPublished: true,
        })
      }
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    axios.get(`https://slack.com/api/team.info?token=${this.state.token}`).then(({ data }) => {
            console.log('-------------workspaceinto',data);
      
         if(data.ok){
           const { team : {domain, icon: {  image_230 }} } = data;
          this.setState({
            workspace: domain,
            workspace_image: image_230,
          });
           console.log(image_230,'-------------workspaceinto',domain);

         }
    });

    console.log(this.state);
    
  }
  handleUploadStart = () => this.setState({ isUploading: true, progress: 0 });
  handleProgress = progress => this.setState({ progress });
  handleUploadError = error => {
    this.setState({ isUploading: false });
    console.error(error);
  };
  handleUploadSuccess = filename => {
    firebase
      .storage()
      .ref("images")
      .child(filename)
      .getDownloadURL()
      .then(url => this.setState({ workspace_background: url, progress: 100, isUploading: false }));
  };

  onChange = (e) => {
    const key = `${e.target.name}`;
    const value = `${e.target.value}`;
    const obj = {};
    obj[key] = value;
    this.setState(obj);

  }
 render(){
  return (
  <div>
    <p>Account: {JSON.stringify(this.props.sessionStore.authUser.uid, undefined, 2) }</p>
    { !this.state.workspace_image && 
      <div>
        { this.state.isPublished && <span>Workspace successully publshed. visit it <a href={this.state.workspace}>here</a></span>}
        <form onSubmit={this.handleSubmit}>
          
          token: <input type="text" name="token" value={this.state.token} onChange={this.onChange}/>
          <button type="submit">Add</button>
          
        </form>
      </div>
    }
    {
      this.state.workspace_image && (
        <div>
          <img src={this.state.workspace_image}/>
          workspace: { this.state.workspace}
          <FileUploader
            accept="image/*"
            name="workspace_background"
            randomizeFilename
            storageRef={firebase.storage().ref("images")}
            onUploadStart={this.handleUploadStart}
            onUploadError={this.handleUploadError}
            onUploadSuccess={this.handleUploadSuccess}
            onProgress={this.handleProgress}
          />
          <span>progress: { this.state.progress}%</span>
          <button type="button" onClick={this.publish}>Publish</button>
        </div>
      )
    }
    {/*<PasswordForgetForm />*/}
    {/*<PasswordChangeForm />*/}
  </div>
)}
};

const authCondition = (authUser) => !!authUser;

export default compose(
  withAuthorization(authCondition),
  inject('sessionStore'),
  observer
)(AccountPage);