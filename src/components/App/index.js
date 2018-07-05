import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import Navigation from '../Navigation';
import LandingPage from '../Landing';
import SignUpPage from '../SignUp';
import SignInPage from '../SignIn';
import PasswordForgetPage from '../PasswordForget';
import HomePage from '../Home';
import AccountPage from '../Account';
import Invite from '../Invite';
import withAuthentication from '../Session/withAuthentication';
import * as routes from '../../constants/routes';

import './index.css';

const Workspace = (props) => {
 
   return (
      <div className="app">
      { !props.isWorkspace && <Navigation /> }
        {  props.children }
      </div>
   );
}

const App = () =>{
  const workspace = window.location.pathname;
  const isWorkspace = Object.keys(routes).filter(data => routes[data] === workspace);
  return <Router>
    <div>
       <Workspace isWorkspace={ !isWorkspace.length }>
        <Route exact path={routes.LANDING} component={() => <LandingPage />} />
        <Route exact path={routes.SIGN_UP} component={() => <SignUpPage />} />
        <Route exact path={routes.SIGN_IN} component={() => <SignInPage />} />
        <Route exact path={routes.PASSWORD_FORGET} component={() => <PasswordForgetPage />} />
        <Route exact path={routes.HOME} component={() => <HomePage />} />
        <Route exact path={routes.ACCOUNT} component={() => <AccountPage />} />
       </Workspace>
        <Route exact path={routes.Invite} component={() => <Invite />} />
      
      </div>
  </Router>
}

export default withAuthentication(App);