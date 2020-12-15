import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import Cards from '../Cards';
import { Button, Form, Container, Header, Card, Image, Tab, Icon, Label, Menu, Table,  Segment, Modal, Input, Grid } from 'semantic-ui-react'
import { getProfile, getWalletBalance, getCampaignDetails,  investAmount } from '../../api/blockchain';



export default class InvestingPage extends Component  {

  constructor(props) {
    super(props);
    this.state = {
      errors: '',
      investAmount: '',
      name: '',
      description: '',
      targetFund: '',
      modalOpen: false
    };
    this.handleChange = this.handleChange.bind(this);
    //this._getProfile();
    this._getCampaignDetails();
  }

  handleChange(e, key){
    let data = {}
    data[key] = e.target.value
    this.setState(data)
  }

  async _getCampaignDetails(){
    try {
      let response = await getCampaignDetails(this.props.match.params.id)
    
      if(response.status == 200)
      {
        this.setState({
          name: response.data.campaign[0].Name,
          description: response.data.campaign[0].Description,
          targetFund: response.data.campaign[0].TargetFund.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
        })
      }
    } catch (error) {
      this.props.history.push('/login')
    }
    
  }

  async _getProfile(){
    try {
      let response = await getProfile()
    } catch (error) {
      this.props.history.push('/login')
    }
    
  }

  async investAmt(){

    if(this.validateInvest())
    {
      let payload = {
        amount: this.state.investAmount,
        campaignId: this.props.match.params.id
      }
      //alert(payload);
      let response = await investAmount(payload)
      
      if(response.status == 201)
      {
        this.props.history.push('/adminHome')
      }
    }

  }

  validateInvest(){
    let amount = this.state.depositAmount

    let errors = '';
    let isValid = true;

    if (!amount) {
      isValid = false;
      errors = "Please enter deposit amount";
    }

    this.setState({
      errors: errors
    });

    return isValid;
  }

  render() {
    return (
      <div>
          <Segment>
            <Container >
              <Grid>
                <Grid.Column width={3}>
                  <Image src='https://react.semantic-ui.com/images/avatar/large/daniel.jpg' />
                </Grid.Column>
                <Grid.Column width={9}>
                  <Header as='h1' textAlign='left'>{this.state.name}</Header>
                  <Header as='h3' textAlign='left'>{this.state.description}</Header>
                  <Header as='h1' textAlign='left'>Target Fund: {this.state.targetFund}</Header>
                  <Modal
                      basic
                      open={this.state.modalOpen}
                      onClose={() => this.setState({ modalOpen: false }) }
                      onOpen={() => this.setState({ modalOpen: true }) }
                      size='small'
                      trigger={<Button primary>Invest</Button>} >
                      <Header icon>
                        <Icon name='user circle' />
                        Enter amount to invest
                      </Header>
                      <Modal.Content>
                        <p className='input-modal'>
                          <Input placeholder='Enter Amount'
                          value={this.state.investAmount}
                          ref="investAmount"
                          onChange={(e) => this.handleChange(e, 'investAmount')} />
                        </p>
                      </Modal.Content>
                      <Modal.Actions>
                        <center>
                        <Button basic color='red' inverted onClick={ () => {
                          this.setState({ modalOpen: false })
                        } }  >
                          <Icon name='remove' /> Cancel
                        </Button>
                        <Button color='green' inverted onClick={ this.depositAmt }> 
                          <Icon name='checkmark' /> Confirm
                        </Button>
                        </center>
                      </Modal.Actions>
                    </Modal>
                    <Button secondary>Cancel</Button>
                </Grid.Column>
                <Grid.Column width={4}>
                  
                </Grid.Column>
              </Grid>
            </Container>
        </Segment>
        <Modal
          basic
          modalOpen={this.state.modalOpen}
          onClose={() => this.setState({ modalOpen: false }) }
          onOpen={() => this.setState({ modalOpen: true }) }
          size='small'
        >
          <Header icon>
            <Icon name='user circle' />
            Add funds to wallet
          </Header>
          <Modal.Content>
            <p className='input-modal'>
              <Input placeholder='Enter Amount'
              value={this.state.depositAmount}
              ref="depositAmount"
              onChange={(e) => this.handleChange(e, 'depositAmount')} />
            </p>
          </Modal.Content>
          <Modal.Actions>
            <center>
            <Button basic color='red' inverted onClick={ () => {
              this.setState({ modalOpen: false })
            } }  >
              <Icon name='remove' /> Cancel
            </Button>
            <Button color='green' inverted onClick={ this.depositAmt }> 
              <Icon name='checkmark' /> Confirm
            </Button>
            </center>
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}
