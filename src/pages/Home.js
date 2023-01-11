import React, { useContext, useEffect, useState } from 'react';
import { Xrpl } from '../provider/XrplProvider';
import whitelist from "../data/whitelist.json";
import keptTokens from "../data/keptTokens.json";
import male from "../assets/img/male.png";
import female from "../assets/img/female.png";

function Home() {
  const { _xrpl, client, account } = useContext(Xrpl);
  const [nfts, setNfts] = useState([]);

  const buy = async () => {
    if (!account) {
      alert("Please connect wallet");
      return;
    }
    // console.log(Date.now(), new Date(Date.UTC('2023', '01', '11', '18', '30', '00')).getTime());
    if (!whitelist.includes(account) && Date.now() < new Date(Date.UTC('2023', '01', '11', '20', '44', '00')).getTime()) {
      alert("You are not in whitelist");
      return;
    }
    const nftAmount = nfts?.length;

    do {
      const selected = Math.floor(Math.random() * nftAmount);
      const tokenId = nfts[selected].tokenID;
      if (keptTokens.includes(tokenId)) continue;
      console.log(selected + "/" + nftAmount);
      const nftSellOffers = await client.request({
        method: "nft_sell_offers",
        nft_id: tokenId
      });
      console.log(JSON.stringify({ offerId: nftSellOffers.result.offers[0].nft_offer_index }));
      try {
        fetch("https://xroyaltybackend.vercel.app/buy", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ offerId: nftSellOffers.result.offers[0].nft_offer_index })
        }).then((res) => res.json())
          .then((data) => {
            window.open(data.url, '_blank');
          });
      } catch (err) {
        console.log(err);
      }
    } while (false);
  }

  async function getNfts() {
    if (!client) return;
    console.log(client);
    const { result: { account_nfts } } = await client.request({
      method: "account_nfts",
      account: "rEkGmeuCkcUQMT8p4MdkzZpvTZxShjWa3w"
    });
    setNfts([]);
    account_nfts?.forEach((item) => {
      const tokenUri = _xrpl.convertHexToString(item.URI);
      fetch(tokenUri).then((response) => response.json()).then(data => setNfts(p => [...p, { ...data, tokenID: item.NFTokenID }]));
    })
  }

  useEffect(() => {
    const interval = setInterval(() => getNfts(), 5000)
    return () => clearInterval(interval);
  }, [client]);

  return (
    <div id="home">
      <div className="title">Mint NFT</div>
      {/* <div className="description">{nfts?.length} NFTs left</div> */}
      <div className="mint">
        <div className="img">
          <img src={male} />
          <img src={female} />
        </div>
        <button onClick={buy}>Mint Now</button>
      </div>
    </div>
  )
}

export default Home;