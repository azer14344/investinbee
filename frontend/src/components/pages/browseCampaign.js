import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import Cards from '../Cards';
import { Button, Form, Container, Header, Card, Image, Tab, Icon, Label, Menu, Table,  Segment, CardContent, Input } from 'semantic-ui-react'
import { getProfile, getWalletBalance, getAvailableCampaigns } from '../../api/blockchain';


export default class BrowseCampaign extends Component  {

  constructor(props) {
    super(props);
    this.state = {
      errors: '',
      items: [],
      modalOpen: false
    };
    this.handleChange = this.handleChange.bind(this);
    this._getAvailableCampaigns();
    this._getProfile();
  }

  componentDidMount() {
    
  }

  handleChange(e, key){
    let data = {}
    data[key] = e.target.value
    this.setState(data)
  }

  async _getAvailableCampaigns(){
    let response = await getAvailableCampaigns()
    
    //alert(JSON.stringify(response.data.campaigns))
    let cc = [];
    response.data.campaigns.map(function (item, index) {
      let dest = '/investingpage/' + item.RKEY;
      cc.push({
        image: 'https://react.semantic-ui.com/images/avatar/large/daniel.jpg',
        header: item.Name,
        meta: item.Status,
        description:
          <div>
              <p>{ item.Description}.<br/>{item.Location}</p>
              <br />
              <Label textAlign='center' size='huge' color='yellow'>TARGET: { item.TargetFund.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') }</Label>                        
              
          </div>,
        extra:<Button as={Link} to={ dest } primary fluid size='large' >Invest</Button>
      })
    })
    this.setState({
			items: cc
		})
  }

  async _getProfile(){
    try {
      let response = await getProfile()
    } catch (error) {
      this.props.history.push('/login')
    }
    
  }

  render() {
    return (
      <div>
        <Segment>
        <Header as='h1' textAlign='center'>Browsing Campaigns</Header>
          <Container >
              <Card.Group centered
                  items={this.state.items} 
              />
          </Container>
        </Segment>
      </div>
    );
  }
}