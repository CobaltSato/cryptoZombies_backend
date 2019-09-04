pragma solidity ^0.5.0;

import "./zombieattack.sol";
//import "./erc721.sol";
import "./safemath.sol";
import "./IERC721.sol";
import "./IERC721Receiver.sol";
import "./Address.sol";
import "./ERC165.sol";
// import "./Counters.sol";

contract ZombieOwnership is ZombieAttack, ERC165, IERC721 {

  using SafeMath for uint256;
  using Address for address;
  // using Counters for Counters.Counter;

  bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;
  // mapping (uint256 => address) private _tokenOwner; // is zombieToOwner
  // mapping (uint256 => address) private _tokenApprovals; // is zombieApprovals
  // mapping (address => Counters.Counter) private _ownedTokenCount; // is ownerZombieCount
  mapping (address => mapping(address => bool)) private _operatorApprovals;
  bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;

  constructor () public {
      // register the supported interfaces to conform to ERC721 via ERC165
      _registerInterface(_INTERFACE_ID_ERC721);
  }

  mapping (uint => address) zombieApprovals;

  function balanceOf(address _owner) public view returns (uint256) {
    require(_owner != address(0));
    return ownerZombieCount[_owner].current();
  }

  function ownerOf(uint256 _tokenId) public view returns (address) {
    address owner = zombieToOwner[_tokenId];
    require(owner != address(0), "ERC721: owner query for nonexistent token");
    return owner;
  }

  function approve(address _approved, uint256 _tokenId) public payable onlyOwnerOf(_tokenId) {
      address owner = ownerOf(_tokenId);
      require(_approved != owner, "ERC721: approval to current owner");

      require(msg.sender == owner || isApprovedForAll(owner, msg.sender),
      "ERC721: approve caller is not owner nor approved for all");
      zombieApprovals[_tokenId] = _approved;
      emit Approval(msg.sender, _approved, _tokenId);
    }

  function getApproved(uint256 _tokenId) public view returns (address){
      require(_exists(_tokenId), "ERC721: approved query for nonexistent token");
      return zombieApprovals[_tokenId];
  }

  function setApprovalForAll(address _to, bool _approved) public {
    require(_to != msg.sender, "ERC721: approve to caller");

    _operatorApprovals[msg.sender][_to] = _approved;
    emit ApprovalForAll(msg.sender, _to, _approved);
  }

  function isApprovedForAll(address _owner, address _operator) public view returns (bool) {
        return _operatorApprovals[_owner][_operator];
  }

  function _isApprovedOrOwner(address _spender, uint256 _tokenId) internal view returns (bool) {
        require(_exists(_tokenId), "ERC721: operator query for nonexistent token");
        address _owner = ownerOf(_tokenId);
        return (_spender == _owner || getApproved(_tokenId) == _spender || isApprovedForAll(_owner, _spender));
  }

  function _exists(uint256 _tokenId) internal view returns (bool) {
      address owner = zombieToOwner[_tokenId];
      return owner != address(0);
  }

  function transferFrom(address _from, address _to, uint256 _tokenId) public{
      require(_isApprovedOrOwner(msg.sender, _tokenId), "ERC721: transfer caller is not owner nor approved");
      _transferFrom(_from, _to, _tokenId);
  }

  function _transferFrom(address _from, address _to, uint256 _tokenId) internal{
      require(ownerOf(_tokenId) == _from, "ERC721: transfer of token that is not own");
      require(_to != address(0), "ERC721: transfer to the zero address");

    _clearApproval(_tokenId);
    ownerZombieCount[_to].increment();
    ownerZombieCount[msg.sender].decrement();
    zombieToOwner[_tokenId] = _to;

    //emit Transfer(_from, _to, _tokenId);
  }

  function _clearApproval(uint256 _tokenId) private {
      if(zombieApprovals[_tokenId] != address(0)) {
          zombieApprovals[_tokenId] = address(0);
      }
  }

  function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes memory _data)
  public {
      require(_isApprovedOrOwner(msg.sender, _tokenId), "ERC721: transfer caller is not owner nor approved");
      _safeTransferFrom(_from, _to, _tokenId, _data);
  }

  function _safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes memory _data) internal{
      _transferFrom(_from, _to, _tokenId);
      require(_checkOnERC721Received(_from, _to, _tokenId, _data), "ERC721: transfer to non ERC721Receiver implementer");
  }

  function safeTransferFrom(address _from, address _to, uint256 _tokenId) public {
        safeTransferFrom(_from, _to, _tokenId, "");
  }

  function _checkOnERC721Received(address _from, address _to, uint256 _tokenId, bytes memory _data)
      internal returns (bool)
  {
      if (!_to.isContract()) {
          return true;
      }

      bytes4 retval = IERC721Receiver(_to).onERC721Received(msg.sender, _from, _tokenId, _data);
      return (retval == _ERC721_RECEIVED);
  }
}
