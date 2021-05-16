/* SPDX-License-Identifier: UNLICENSED */
pragma solidity 0.8.4;

contract Wallet {
    address[] public approvers;
    uint public quorum;
    
    struct Transfer {
        uint id;
        uint amount;
        address payable to;
        uint approvals;
        bool sent;
    }
    Transfer[] public transfers;
    mapping(address => mapping(uint => bool)) approvals;
    
    constructor(address[] memory _approvers, uint _quorum) {
        approvers = _approvers;
        quorum = _quorum;
    }
    
    function getApprovers() external view returns(address[] memory) {
        return approvers;
    }
    
    function createTransfer(uint amount, address payable to) external onlyApprover() {
        transfers.push(Transfer(
            transfers.length,
            amount,
            to,
            0,
            false
        ));
    }
    
    function getTransfers() external view returns(Transfer[] memory) {
        return transfers;
    }
    
    function approveTransfer(uint id) external onlyApprover() {
        require(transfers[id].sent == false, "transfer has already been sent");
        require(approvals[msg.sender][id] == false, "cannot approve transfer");
        
        approvals[msg.sender][id] = true;
        transfers[id].approvals++;
        
        if (transfers[id].approvals >= quorum) {
            transfers[id].sent =  true;
            address payable to = transfers[id].to;
            uint amount = transfers[id].amount;
            to.transfer(amount);
        }
    }
    
    modifier onlyApprover() {
      bool allowed = false;
      for (uint i = 0; i < approvers.length; i++) {
          if (approvers[i] == msg.sender) {
              allowed = true;
          }
      }
      require(allowed == true, "only approver allowed");
      _;
    }
    
    receive() external payable {}
}
