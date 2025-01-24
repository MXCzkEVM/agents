// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract ProxyForwardUpgradeable is Initializable {
  address internal agent;

  error InvalidAccount();

  modifier proxy(address signer) {
    if (signer != msg.sender && msg.sender != agent)
      revert InvalidAccount();
    _;
  }

  function getAgent() public view returns (address) {
    return agent;
  }

  function setAgent(address newAgent) public virtual {
    require(msg.sender == agent, "Not Agent Account");
    agent = newAgent;
  }

  function __Proxyed_init(address initialAgent) internal onlyInitializing {
    agent = initialAgent;
  }
}