import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { compose } from 'recompose';

import { PasswordForgetForm } from '../PasswordForget';
import PasswordChangeForm from '../PasswordChange';
import withAuthorization from '../Session/withAuthorization';
import { db } from '../../firebase/firebase';

    const its = db.child('its');

   its.on('child_changed', snap => { 
        const key = snap.val().id;
        console.log('--------ky-------------', key);
   });

class AccountPage extends Component {
  state = {
    workspace:'',
    token: '',
  }

  handleSubmit = (e) => {
    e.preventDefault();
    console.log(this.state);
    its.push().set({
      userId: this.props.sessionStore.authUser.uid,
      token: this.state.token,
      workspace: this.state.workspace
    });
    this.setState({
      workspace: '',
      token: ''
    });
  }
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
    <form onSubmit={this.handleSubmit}>
      workspace: <input type="text" name="workspace" value={this.state.workspace} onChange={this.onChange}/>
      token: <input type="text" name="token" value={this.state.token} onChange={this.onChange}/>
      <button type="submit">Add</button>
      
    </form>
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