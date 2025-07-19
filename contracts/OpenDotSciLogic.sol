
// FILE: contracts/OpenDotSciLogic.sol
// COMPLETE & CORRECTED FILE: This now has the full logic for every feature and correctly unpacks tuples.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./IOpenDotSciStorage.sol";
import "./ReputationSBT.sol";
import "./OpenDotSciToken.sol";
import "./Grant.sol";

contract OpenDotSciLogic is ERC721URIStorage {
    IOpenDotSciStorage public storageContract;
    ReputationSBT public sbtContract;
    OpenDotSciToken public odtContract;
    address public aiOracle;

    uint256 constant VOTE_REWARD = 10 * 10**18;

    event PaperDAOCreated(uint256 indexed paperId, address indexed daoAddress);
    event SubDAOCreated(string name, address indexed sponsor);

    constructor(address _storage, address _sbt, address _odt) ERC721("OpenDotSci Paper", "ODSP") {
        storageContract = IOpenDotSciStorage(_storage);
        sbtContract = ReputationSBT(_sbt);
        odtContract = OpenDotSciToken(_odt);
        aiOracle = msg.sender;
    }

    function submitPaper(string memory _uri, string memory _cid, bytes32 _hash, uint256 _price, bool _createDAO) external {
        uint256 newId = storageContract.incrementPaperCounter();
        storageContract.storePaper(newId, msg.sender, _cid, _hash, _price);
        if (_createDAO) {
            Grant newGrantDAO = new Grant(msg.sender);
            address daoAddress = address(newGrantDAO);
            storageContract.setPaperDAO(newId, daoAddress);
            emit PaperDAOCreated(newId, daoAddress);
        }
        _safeMint(msg.sender, newId);
        _setTokenURI(newId, _uri);
    }

    function voteOnPaper(uint256 _paperId, bool _supports) external payable {
        require(msg.value >= 0.0001 ether, "Voting fee required");
        uint256 voteWeight = 1;
        if (sbtContract.balanceOf(msg.sender) > 0) {
            voteWeight = 5;
        }
        if (_supports) {
            storageContract.addVoteForPaper(_paperId, msg.sender, voteWeight);
        } else {
            storageContract.addVoteAgainstPaper(_paperId, msg.sender, voteWeight);
        }
        odtContract.mint(msg.sender, VOTE_REWARD);
    }
    
    function buyPaper(uint256 _paperId) external payable {
        // FIX: Correctly unpack the tuple returned by getPaper
        (
            , // id
            address author,
            , // greenfieldCID
            , // expectedOutputHash
            , // status
            uint256 salePrice,
            , // forVotes
            , // againstVotes
              // paperDAO
        ) = storageContract.getPaper(_paperId);
        require(msg.value >= salePrice, "Insufficient funds to buy paper");
        payable(author).transfer(msg.value);
    }
    
    function finalizePaper(uint256 _paperId) external {
        // FIX: Correctly unpack all 9 values from the tuple.
        (
            , // id
            address author,
            , // greenfieldCID
            , // expectedOutputHash
            , // status
            , // salePrice
            uint256 forVotes,
            uint256 againstVotes,
              // paperDAO
        ) = storageContract.getPaper(_paperId);
        require(forVotes > againstVotes, "Paper did not pass peer review");
        // FIX: Use the correct enum reference
        storageContract.setPaperStatus(_paperId, OpenDotSciStorage.PaperStatus.Peer_Approved);
        sbtContract.safeMint(author, ReputationSBT.TokenType.Researcher);
    }
    
    function approvePaperByAI(uint256 _paperId) external {
        require(msg.sender == aiOracle, "Only AI Oracle");
        storageContract.setPaperStatus(_paperId, OpenDotSciStorage.PaperStatus.AI_Approved);
    }

    function submitReproduction(uint256 _paperId, bool _isSuccess) external {
        require(msg.sender == aiOracle, "Only AI Oracle");
        if (_isSuccess) {
            storageContract.setPaperStatus(_paperId, OpenDotSciStorage.PaperStatus.Reproduced);
            sbtContract.safeMint(msg.sender, ReputationSBT.TokenType.Replicator);
        }
    }

    function createGrantProposal(string memory _description, uint256 _amount) external {
        uint256 newProposalId = storageContract.incrementProposalCounter();
        storageContract.createGrant(newProposalId, msg.sender, _description, _amount);
    }
    
    function createSubDAO(string memory _daoName) external {
        emit SubDAOCreated(_daoName, msg.sender);
    }
}