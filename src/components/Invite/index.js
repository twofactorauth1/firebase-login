import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { compose } from 'recompose';
import withAuthorization from '../Session/withAuthorization';
import Recaptcha from 'react-recaptcha';
import axios from 'axios';

var SLACK_INVITE_ENDPOINT = 'https://slack.com/api/users.admin.invite';
var SLACK_USERS_ENDPOINT = 'https://slack.com/api/users.list';

class Invite extends Component {
    state = {
        email: '',
        token: null,
        workspace: null,
        onlineUsers: null,
        totalUsers:null ,
        isAvailable: false,
    }
    handleChange = (e) => {
       this.setState({email: e.target.value});
    }
    
    componentDidMount(){
       const workspace = window.location.pathname.substr(1);
       let start_time = new Date().getTime();
       axios.get(`https://invite2slack.herokuapp.com/api/get/${workspace}`).then(({data, status}) => {
         if(status === 200){
             if(data.length !== 0){
               
             const token = data[0].token;
             const workspace = data[0].workspace;
             const workspace_image = data[0].workspace_image;
             const workspace_background = data[0].workspace_background;
           let request_time = new Date().getTime() - start_time;
             
           console.log('------request_time-',request_time/1000);
 
        var QUERY_PARAMS = `token=${token}&presence=true`;

        axios.get(`${SLACK_USERS_ENDPOINT}?${QUERY_PARAMS}`)
        .then(({data}) => {
            const { members } = data;
            let totalUsers = 0;
            let onlineUsers = 0;
            members.forEach((user) => {
                if( user.id !== 'USLACKBOT' && !user.is_bot && !user.deleted){
                   totalUsers++;
                   if(user.presence === 'active'){
                       onlineUsers++;
                   }
                }
            });
           this.setState({
               token,
               workspace,
               onlineUsers,
               totalUsers,
               isAvailable: true,
               workspace_image,
               workspace_background,
           });
        })
        .catch((err) => console.log('err',err));
    }
             else{
               this.setState({isAvailable: false});
             }
         }
       })
        
    }

    handleSubmit = (e) => {
        e.preventDefault();
        console.log(this.state);
        var QUERY_PARAMS = `email=${this.state.email}&token=${this.state.token}&set_active=true`;

        axios.get(`${SLACK_INVITE_ENDPOINT}?${QUERY_PARAMS}`)
            .then((data) => console.log('success',data))
            .catch((err) => console.log('err',err));
    }

    callback = () => {
        console.log('capthy onoad')
    }

    verifyCallback = (resp) => {
        console.log('-----------respi',resp);
    }
    render(){        
        if(!this.state.isAvailable){
            return (<div id="divLoadings">NOt found </div>);
        }
        return(
            <div style={{backgroundImage: `url(${this.state.workspace_background})`, backgroundSize: 'cover', backgroundRepeat:'no-repeat',
             backgroundPosition:'left top'}}>
               <form onSubmit={(e) => this.handleSubmit(e)}>
                   <img src={this.state.workspace_image}/>
                   <span>{ this.state.totalUsers ? this.state.totalUsers : 0  } users are registered so far.</span><br/>
                   <input type="test" value={this.state.email} onChange={this.handleChange} />
                   <Recaptcha
                    sitekey="6LdjnmIUAAAAANV5YeKhsO8dL7YfkhK0xgGaG_Xz"
                    verifyCallback={this.verifyCallback}
                    render="explicit"
                    onloadCallback={this.callback}
                   />
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