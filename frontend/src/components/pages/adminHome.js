import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import HeroSection from '../HeroSection';
import { Button, Form, Grid, Container, Header, Image, Tab, Icon, Label, Menu, Table,  Segment, Modal, Input } from 'semantic-ui-react'
import { getProfile, getWalletBalance, depositAmount, getWalletTransactions } from '../../api/blockchain';

export default class AdminHome extends Component  {

  constructor(props) {
    super(props);
    this.state = {
      errors: '',
      name: '',
      balance: '',
      walletTransactions: [],
      depositAmount: '',
      modalOpen: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.depositAmt = this.depositAmt.bind(this);
    this._getProfile();
    this._getWalletBalance();
    this._getWalletTransactions();
  }

  handleChange(e, key){
    let data = {}
    data[key] = e.target.value
    this.setState(data)
  }


  async _getProfile(){
    try {
      let response = await getProfile()
    
      if(response.status == 200)
      {
        this.setState({
          name: response.data.profile.FName + ' ' + response.data.profile.LName
        })
      }
    } catch (error) {
      this.props.history.push('/login')
    }
    
  }
  
  async _getWalletBalance(){
    let response = await getWalletBalance()
    
    //alert(JSON.stringify(response))
    this.setState({
			balance: response.data.balance
		})
  }

  async _getWalletTransactions(){
    let response = await getWalletTransactions()
    
    //alert(JSON.stringify(response.data.walletTransactions))
    this.setState({
			walletTransactions: response.data.walletTransactions
		})
  }

  renderWalletTransactions() {
    return this.state.walletTransactions.map((tx, index) => {
       const { RKEY, Type, Amount, DTDisp } = tx //destructuring
       return (
            <Table.Row>
              <Table.Cell>{DTDisp}</Table.Cell>
              <Table.Cell>{Amount}</Table.Cell>
              <Table.Cell>{Type}</Table.Cell>
            </Table.Row>
       )
    })
 }
  
  async depositAmt(){

    if(this.validateDeposit())
    {
      let payload = {
        amount: this.state.depositAmount
      }
      //alert(payload);
      let response = await depositAmount(payload)
      
      if(response.status == 201)
      {
          this.setState({ modalOpen: false })
          this._getWalletTransactions()
          this._getWalletBalance()
      }
    }

  }

  validateDeposit(){
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
                <Image src='https://react.semantic-ui.com/images/wireframe/image.png' />
              </Grid.Column>
              <Grid.Column width={9}>
                <Header as='h1' textAlign='left'>{this.state.name}</Header>
                <p>Your Wallet Value: ₱ {this.state.balance}</p>
                <Button as={Link} to='/browseCampaigns' primary size='large'>Browse Campaigns</Button>
                
              </Grid.Column>
              <Grid.Column width={4}>
                <div><Link to='logout'>LOGOUT</Link></div>
                <Modal
                  basic
                  open={this.state.modalOpen}
                  onClose={() => this.setState({ modalOpen: false }) }
                  onOpen={() => this.setState({ modalOpen: true }) }
                  size='small'
                  trigger={<Button primary>Add Funds to the Wallet</Button>}
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
                <Button secondary>Widthdraw Funds</Button>
              </Grid.Column>
            </Grid>
          </Container>
      </Segment>

      <Container >
        <Grid>
          <Grid.Row stretched>
            <Grid.Column width={16}>
                <Segment>
                <Tab panes={
                  [
                      { menuItem: 'Wallet Transaction', 
                        render: () => 
                          <Tab.Pane>
                            <Header as='h1' textAlign='left'>Your transactions in wallet</Header>
                            <Table striped>
                              <Table.Header>
                                <Table.Row>
                                  <Table.HeaderCell>Date of Transaction</Table.HeaderCell>
                                  <Table.HeaderCell>Amount</Table.HeaderCell>
                                  <Table.HeaderCell>Type of Transaction</Table.HeaderCell>
                                </Table.Row>
                              </Table.Header>
                              <Table.Body>
                                { this.renderWalletTransactions() }
                              </Table.Body>
                            </Table>
                            
                          </Tab.Pane>
                      },
                      { menuItem: 'Investment', 
                        render: () => 
                          <Tab.Pane>
                            <Header as='h1' textAlign='left'>Your investment</Header>
                            <Table striped>
                              <Table.Header>
                                <Table.Row>
                                  <Table.HeaderCell>Date of Investment</Table.HeaderCell>
                                  <Table.HeaderCell>Name of Campaign</Table.HeaderCell>
                                  <Table.HeaderCell>Amount Invested</Table.HeaderCell>
                                  <Table.HeaderCell>Status</Table.HeaderCell>
                                </Table.Row>
                              </Table.Header>
                              <Table.Body>
                                
                                <Table.Row>
                                  <Table.Cell>John Lilki</Table.Cell>
                                  <Table.Cell>September 14, 2013</Table.Cell>
                                  <Table.Cell>jhlilk22@yahoo.com</Table.Cell>
                                  <Table.Cell>No</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell>John Lilki</Table.Cell>
                                  <Table.Cell>September 14, 2013</Table.Cell>
                                  <Table.Cell>jhlilk22@yahoo.com</Table.Cell>
                                  <Table.Cell>No</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell>Jamie Harington</Table.Cell>
                                  <Table.Cell>January 11, 2014</Table.Cell>
                                  <Table.Cell>jamieharingonton@yahoo.com</Table.Cell>
                                  <Table.Cell>Yes</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell>Jill Lewis</Table.Cell>
                                  <Table.Cell>May 11, 2014</Table.Cell>
                                  <Table.Cell>jilsewris22@yahoo.com</Table.Cell>
                                  <Table.Cell>Yes</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell>John Lilki</Table.Cell>
                                  <Table.Cell>September 14, 2013</Table.Cell>
                                  <Table.Cell>jhlilk22@yahoo.com</Table.Cell>
                                  <Table.Cell>No</Table.Cell>
                                </Table.Row>
                              </Table.Body>
                            </Table>
                          </Tab.Pane>
                      },
                      { menuItem: 'Payment Claims', 
                        render: () => 
                          <Tab.Pane>
                            <Header as='h1' textAlign='left'>Your Payment Claims/Returns</Header>
                            <Table striped>
                              <Table.Header>
                                <Table.Row>
                                  <Table.HeaderCell>Date of Transaction</Table.HeaderCell>
                                  <Table.HeaderCell>Name of Campaign</Table.HeaderCell>
                                  <Table.HeaderCell>Amount</Table.HeaderCell>
                                </Table.Row>
                              </Table.Header>
                              <Table.Body>
                                
                                <Table.Row>
                                  <Table.Cell>11/20/2020</Table.Cell>
                                  <Table.Cell>Campaign Number 1</Table.Cell>
                                  <Table.Cell>500</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell>11/20/2020</Table.Cell>
                                  <Table.Cell>Campaign Number 1</Table.Cell>
                                  <Table.Cell>500</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell>11/20/2020</Table.Cell>
                                  <Table.Cell>Campaign Number 1</Table.Cell>
                                  <Table.Cell>500</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell>11/20/2020</Table.Cell>
                                  <Table.Cell>Campaign Number 1</Table.Cell>
                                  <Table.Cell>500</Table.Cell>
                                </Table.Row>
                    
                              </Table.Body>
                            </Table>
                          </Tab.Pane>
                      },
                      
                    ]
                  } />
                </Segment>
              </Grid.Column>
              </Grid.Row>
            </Grid>
            
          </Container>
  </div>
    );
  }
}

