import React, { Component } from 'react'
import { Button, Form, Input, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'
import { Link, Redirect  } from 'react-router-dom';
import { registerAccount } from '../../api/blockchain';

export default class Register extends Component  {
  
    constructor(props) {
      super(props);
      this.state = {
        errors: '',
        email: '',
        fName: '',
        lName: '',
        password: '',
        password2: ''
      };
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
      
    }

    async handleSubmit(){
      if(this.validate())
      {
        let payload = {
          fName: this.state.fName,
          lName: this.state.lName,
          email: this.state.email,
          password: this.state.password,
          password2: this.state.password2
        }
        let response = await registerAccount(payload)
        
        if(response.status == 201)
        {
          this.props.history.push('/login')
        }
      }

    }

    handleChange(e, key){
      let data = {}
      data[key] = e.target.value
      this.setState(data)
    }
  
    validate(){
      let fName = this.state.fName
      let lName = this.state.lName
      let email = this.state.email
      let password = this.state.password
      let password2 = this.state.password2

      let errors = {};
      let isValid = true;

      if (!fName) {
        isValid = false;
        errors["fname"] = "Please enter your first name.";
      }

      if (!lName) {
        isValid = false;
        errors["lname"] = "Please enter your last name.";
      }

      if (!password) {
        isValid = false;
        errors["password"] = "Please enter password.";
      }

      if (!password2) {
        isValid = false;
        errors["password2"] = "Please enter confirmed password.";
      }

      if (!email) {
        isValid = false;
        errors["email"] = "Please enter your email address.";
      }

      if (typeof email !== "undefined") {
        var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
        if (!pattern.test(email)) {
          isValid = false;
          errors["email"] = "Please enter valid email address.";
      }
    }

    this.setState({
      errors: errors
    });

    return isValid;
  }

  render() {

		return (
      <Grid style={{ minHeight:'90vh' }} verticalAlign='middle' textAlign='center'>
      <Grid.Column style={{ maxWidth: 550}}>
        <Header as='h1' textAlign='center'>
           Register
        </Header>
        <Form size='large'>
          <Segment stacked>
          <Form.Field required>
            <label>Email Address:</label>
            <Input placeholder='Enter email address' 
              value={this.state.email}
              ref="email"
              onChange={(e) => this.handleChange(e, 'email')}  />
              <div className="text-danger">{this.state.errors.email}</div>
          </Form.Field>
          <Form.Group widths='equal'>
            <Form.Field required>
              <label>First Name:</label>
              <Input placeholder='Enter First name'
                value={this.state.fName}
                ref="fName"
                onChange={(e) => this.handleChange(e, 'fName')} />
              <div className="text-danger">{this.state.errors.fname}</div>
            </Form.Field>
            <Form.Field required>
              <label>Last Name:</label>
              <Input placeholder='Enter Last name' 
                value={this.state.lName}
                ref="lName"
                onChange={(e) => this.handleChange(e, 'lName')} />
                <div className="text-danger">{this.state.errors.lname}</div>
            </Form.Field>
          </Form.Group>
          <Form.Field required>
            <label>Password:</label>
            <Input type='password' placeholder='Enter password'
                value={this.state.password}
                ref="password"
                onChange={(e) => this.handleChange(e, 'password')} />
                <div className="text-danger">{this.state.errors.password}</div>
          </Form.Field>
          <Form.Field required>
            <label>Confirmed Password:</label>
            <Input type='password' placeholder='Confirm password' 
              value={this.state.password2}
              ref="password2"
              onChange={(e) => this.handleChange(e, 'password2')}/>
              <div className="text-danger">{this.state.errors.password2}</div>
          </Form.Field>
            <Button type='submit' primary fluid size='large' onClick={ this.handleSubmit } >
              Sign me up!
            </Button>
            <Message>By signing up, you certify that you are of Philippines legal age (18 years old and above) and agree to our Terms & Conditions.</Message>
          </Segment>
        </Form>
        <Message>
          Already have an account? <a href='/login'>Login</a>
        </Message>
      </Grid.Column>
    </Grid>
		);
	}
}
