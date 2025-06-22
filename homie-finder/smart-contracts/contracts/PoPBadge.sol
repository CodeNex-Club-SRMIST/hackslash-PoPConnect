// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PoPBadge is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("ProofOfParticipation", "PoP") Ownable(msg.sender) {}

    function mintBadge(address to, string memory tokenURI) external onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }

    // Soulbound: block transfers
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        require(
            auth == address(0) || auth == ownerOf(tokenId),
            "Soulbound: transfer not allowed"
        );
        return super._update(to, tokenId, auth);
    }
}
