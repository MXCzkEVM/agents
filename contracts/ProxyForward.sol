// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

abstract contract ProxyForward {
  address internal agent;

  error UnauthorizedAccess();

  event AgentChanged(
    address indexed oldAgent,
    address indexed newAgent
  );

  constructor(address initialAgent) {
    agent = initialAgent;
  }

  modifier proxy(address signer) {
    if (signer != msg.sender && msg.sender != agent)
      revert UnauthorizedAccess();
    _;
  }

  function getAgent() public view returns (address) {
    return agent;
  }

  function setAgent(address newAgent) public virtual {
    require(msg.sender == agent, "Not Agent Account");
    agent = newAgent;
  }
}