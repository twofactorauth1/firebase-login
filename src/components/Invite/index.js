import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { compose } from 'recompose';
import withAuthorization from '../Session/withAuthorization';
import axios from 'axios';
import { db } from '../../firebase/firebase';

const its = db.child('its');


var SLACK_TOKEN = 'my-slack-token-xxx';
var SLACK_INVITE_ENDPOINT = 'https://slack.com/api/users.admin.invite';
var SLACK_USERS_ENDPOINT = 'https://slack.com/api/users.list';

class Invite extends Component {
    state = {
        email: '',
        token: null,
        workspace: null,
        onlineUsers: null,
        totalUsers:null ,
        isActive: true,
    }
    handleChange = (e) => {
       this.setState({email: e.target.value});
    }
    
    componentDidMount(){
       const workspace = window.location.pathname.substr(1);
       let start_time = new Date().getTime();
    //    db.child('its/-LGdR5BivnQWbDpFL3tX').on('value', snap => console.log(snap.val()));
       its.orderByChild('workspace').equalTo(workspace).on('child_added', snap => {          
        var QUERY_PARAMS = `token=${snap.val().token}&presence=true`;

        axios.get(`${SLACK_USERS_ENDPOINT}?${QUERY_PARAMS}`)
        .then(({data}) => {
            const { members } = data;
            let totalUsers = 0;
            let onlineUsers = 0;
            members.forEach((user) => {
                if( user.id != 'USLACKBOT' && !user.is_bot && !user.deleted){
                   totalUsers++;
                   if(user.presence === 'active'){
                       onlineUsers++;
                   }
                }
            });
           this.setState({
               token: snap.val().token,
               workspace: snap.val().workspace,
               onlineUsers,
               totalUsers,
               isActive: false,
           });
           let request_time = new Date().getTime() - start_time;
           console.log('------request_time-',request_time/1000);
        })
        .catch((err) => console.log('err',err));
       });

        
    }

    handleSubmit = (e) => {
        e.preventDefault();
        console.log(this.state);
        var QUERY_PARAMS = `email=${this.state.email}&token=${this.state.token}&set_active=true`;

        axios.get(`${SLACK_INVITE_ENDPOINT}?${QUERY_PARAMS}`)
            .then((data) => console.log('success',data))
            .catch((err) => console.log('err',err));
    }
    render(){        
        if(this.state.isActive){
            return (<div id="divLoadings"> </div>);
        }
        return(
            <div>
               <form onSubmit={(e) => this.handleSubmit(e)}>
                   <span>{this.state.onlineUsers} Users online of total { this.state.totalUsers }</span><br/>
                   <input type="test" value={this.state.email} onChange={this.handleChange} />
                   <button type="submit">Invite</button>
               </form>
            </div>
        );
    }
}

const authCondition = (authUser) => !!authUser;

export default compose(
  withAuthorization(authCondition),
  inject('userStore'),
  observer
)(Invite);