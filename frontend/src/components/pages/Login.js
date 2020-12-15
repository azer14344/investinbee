import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'
import { Login, Logout } from '../../api/blockchain';
import Session from 'react-session-api'

export default class LoginAccount extends Component  {
  
  constructor(props) {
    super(props);
    this.state = {
      errors: '',
      email: '',
      password: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this._logOut();
  }

  componentDidMount() {
    
  }

  async handleSubmit(){
    if(this.validate())
    {
      let payload = {
        email: this.state.email,
        password: this.state.password
      }
      let response = await Login(payload)
      
      if(response.status == 200)
      {
        this.props.history.push('/adminHome')
      }else
      {
        this.setState({
          errors: 'Invalid login credentials'
        });
      }
    }

  }

  handleChange(e, key){
    let data = {}
    data[key] = e.target.value
    this.setState(data)
  }

  async _logOut(){
    let response = await Logout()
  }

  validate(){
    let email = this.state.email
    let password = this.state.password

    let errors = '';
    let isValid = true;

    if (!email) {
      isValid = false;
      errors = "Please enter your email address.";
    }

    if (typeof email !== "undefined") {
      var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
      if (!pattern.test(email)) {
        isValid = false;
        errors = "Please enter valid email address.";
    }

    if (!password) {
      isValid = false;
      errors = "Please enter password.";
    }
  }

    this.setState({
      errors: errors
    });

    return isValid;
  }

  render() {

    return (
      <Grid textAlign='center' style={{ height: '70vh' }} verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as='h1' textAlign='center'>    
            Log-in to your account
          </Header>
          <Form size='large'>
            <Segment stacked>
            
              <Form.Input fluid icon='user' iconPosition='left' placeholder='E-mail address' 
                value={this.state.email}
                ref="email"
                onChange={(e) => this.handleChange(e, 'email')}/>
          
              <Form.Input
                fluid
                icon='lock'
                iconPosition='left'
                placeholder='Password'
                type='password' 
                value={this.state.password}
                ref="password"
                onChange={(e) => this.handleChange(e, 'password')}/>
                <div className="text-danger">{this.state.errors}</div>
              <Button primary fluid size='large' onClick={ this.handleSubmit }>
                Login
              </Button>
            </Segment>
          </Form>
          <Message>
            New to investinBEE? <a href='/sign-up'>Sign Up</a>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}
