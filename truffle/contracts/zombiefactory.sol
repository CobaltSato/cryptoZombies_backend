pragma solidity ^0.5.0;

import "./ownable.sol";
import "./safemath.sol";
import "./Counters.sol";

contract ZombieFactory is Ownable {

  using SafeMath for uint256;
  using SafeMath32 for uint32;
  using SafeMath16 for uint16;
  using Counters for Counters.Counter;

  event NewZombie(uint zombieId, string name, uint dna);

  uint dnaDigits = 16;
  uint dnaModulus = 10 ** dnaDigits;
  uint cooldownTime = 30 seconds;

  struct Zombie {
    string name;
    uint dna;
    uint32 level;
    uint32 readyTime;
    uint16 winCount;
    uint16 lossCount;
  }

  Zombie[] public zombies;

  mapping (uint => address) public zombieToOwner;
  mapping (address => Counters.Counter) ownerZombieCount;

  function _createZombie(string memory _name, uint _dna) internal {
    uint id = zombies.push(Zombie(_name, _dna, 1, uint32(now + cooldownTime), 0, 0)) - 1;
    zombieToOwner[id] = msg.sender;
    ownerZombieCount[msg.sender].increment();
    emit NewZombie(id, _name, _dna);
  }

  function generateRandomDna(string memory _str) public view returns (uint) {
    uint rand = uint(keccak256(abi.encodePacked(_str)));
    rand = rand - rand % 100;
    return rand % dnaModulus;
  }

  function createRandomZombie(string memory _name) public {
    require(ownerZombieCount[msg.sender].current() == 0);
    uint randDna = generateRandomDna(_name);
//  randDna = randDna - randDna % 100;
    _createZombie(_name, randDna);
  }
}
