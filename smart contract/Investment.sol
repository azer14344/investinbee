pragma solidity 0.7.0;

import './IInvestment.sol';
import './SafeMath.sol';

contract Investment is IInvestment {
    
    using SafeMath for uint256;
    
    enum CampaignStatus { Nonexistent, Open, Closed, Completed, Cancelled }
    
    // ERC20 VARIABLES
    uint256 _totalSupply;
    mapping (address => uint256) _balances;
    mapping (address => mapping(address => uint256)) _allowances;
    
    // INVESTMENT VARIABLES
    
    address _contractOwner;
    
    // OWNER => CAMPAIGN ID => AMOUNT
    mapping (address => mapping(uint256 => uint256)) _investments;
    
    // CAMPAIGN ID => AMOUNT
    mapping (uint256 => uint256) _funds;
    
    // CAMPAIGN ID => CampaignStatus
    mapping(uint256 => CampaignStatus) _campaignStatus;
    
    constructor(uint256 supply) {
        _totalSupply = supply;
        _balances[msg.sender] = supply;
        _contractOwner = msg.sender;
    }
    
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) public view override returns (uint256) {
         return _balances[account];
    }
    

    function allowance(address owner, address spender) public view override returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        require(msg.sender != address(0), 'Invalid Sender Address');
        require(recipient != address(0), 'Invalid Recipient Address');
        require(_balances[msg.sender] >= amount, 'Insufficient Balance');
        
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(msg.sender, recipient, amount);
    }


    function approve(address spender, uint256 amount) public override returns (bool) {
        // validate the address
        // adjust the allowance of the spender
        // don't validate the balances
        require(msg.sender != address(0), 'Invalid Owner Address');
        require(spender != address(0), 'Invalid Spender Address');
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
    }


    // called by the spender
    function transferFrom(address sender, address recipient, uint256 amount) public  override returns (bool) {
        // validate address
        // check the allowance >= amount
        // adjust balances 
        // deduct from the spender's allowance
        // emit Transfer event
        // emit Approval event
        require(msg.sender != address(0), 'Invalid Spender Address');
        require(sender != address(0), 'Invalid Owner Address');
        require(recipient != address(0), 'Invalid Recipient Address');
        require(_allowances[sender][msg.sender] >= amount, 'Insufficient Allowance');
        
        _balances[sender] = _balances[sender].sub(amount);
        _balances[recipient] = _balances[recipient].add(amount);
        _allowances[sender][msg.sender] = _allowances[sender][msg.sender].sub(amount);
        
        emit Transfer(sender, recipient, amount);
        emit Approval(sender, msg.sender, _allowances[sender][msg.sender]);
    }


    // _investments
    
    function contractOwner() public view returns (address) {
        return _contractOwner;
    }
    
    function getCampaignStatus(uint256 campaignID) public view returns (CampaignStatus) {
        return _campaignStatus[campaignID];
    }
    
    function totalInvestments(uint256 campaignID) public view returns (uint256) {
        return _investments[msg.sender][campaignID];
    }
    
    function totalCampaignFunds(uint256 campaignID) public view returns (uint256) {
        return _funds[campaignID];
    }
    
    function setCampaignStatus(uint256 campaignID, CampaignStatus campaignStatus) public returns (bool){
        require(msg.sender != address(0), 'Invalid Sender Address');
        require(msg.sender == _contractOwner, 'Not authorized to perform action');
        
        
        _campaignStatus[campaignID] = campaignStatus;
    }
    
    function invest(uint256 campaignID, uint256 amount) public returns (bool){
        require(msg.sender != address(0), 'Invalid Sender Address');
        require(_balances[msg.sender] >= amount, 'Insufficient Balance');
        require(_campaignStatus[campaignID] == CampaignStatus.Open, 'Campaign is not open for investment');
        require(amount % 100 == 0, 'Invalid Amount: Should be divisible by 100');
        
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        _funds[campaignID] = _funds[campaignID].add(amount);
        _investments[msg.sender][campaignID] = _investments[msg.sender][campaignID].add(amount);
        
        emit Invest(msg.sender, campaignID, amount);
    }

    function refundInvestment(uint256 campaignID) public returns (bool){
        require(msg.sender != address(0), 'Invalid Sender Address');
        require(_investments[msg.sender][campaignID] > 0, 'No investment found');
        require(_campaignStatus[campaignID] == CampaignStatus.Open, 'Campaign is no longer open');
        
        uint256 amt = _investments[msg.sender][campaignID];
        
        _funds[campaignID] = _funds[campaignID].sub(amt);
        _investments[msg.sender][campaignID] = _investments[msg.sender][campaignID].sub(amt);
        _balances[msg.sender] = _balances[msg.sender].add(amt);
        
        emit RefundInvestment(msg.sender, campaignID, amt);
    }
    
    function getPayout(uint256 campaignID) public returns (bool){
        require(msg.sender != address(0), 'Invalid Sender Address');
        require(_investments[msg.sender][campaignID] > 0, 'No investment found');
        require(_campaignStatus[campaignID] == CampaignStatus.Completed, 'Campaign is not yet completed');
        
        
        uint256 amt = _investments[msg.sender][campaignID];
        uint percentage = 12;
        uint interest = amt.div(100).mul(percentage);
        uint256 payOut = amt.add(interest);
        
        _funds[campaignID] = _funds[campaignID].sub(amt);
        _investments[msg.sender][campaignID] = _investments[msg.sender][campaignID].sub(amt);
        _balances[msg.sender] = _balances[msg.sender].add(payOut);
        _totalSupply = _totalSupply.add(interest);
        
        emit RefundInvestment(msg.sender, campaignID, amt);
    }
    
}