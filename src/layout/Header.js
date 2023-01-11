import React, { useContext, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Xrpl } from '../provider/XrplProvider';
import logo from "../assets/img/logo.jpg";

function Header() {
  const { connectWallet, account } = useContext(Xrpl);

  return (
    <div id="header">
      <div className="container">
        <a href="/">
          <img src={logo} />
          <div>Xroyalty NFT</div>
        </a>
        <div className="links">
          <Link to="/">Mint</Link>
          <Link to="/view">View</Link>
        </div>
        <div className="connect-btn">
          <button onClick={connectWallet}>
            {account? account.slice(0, 3) + "..." + account.slice(-3): "Connect"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Header;