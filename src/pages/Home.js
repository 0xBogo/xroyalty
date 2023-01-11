import React, { useContext, useEffect, useState } from 'react';
import { Xrpl } from '../provider/XrplProvider';
import whitelist from "../data/whitelist.json";
import keptTokens from "../data/keptTokens.json";
import male from "../assets/img/male.png";
import female from "../assets/img/female.png";

function Home() {
  const { _xrpl, client, account } = useContext(Xrpl);
  const [nfts, setNfts] = useState([]);
  const [amount, setAmount] = useState(null);

  const buy = async () => {
    if (!account) {
      alert("Please connect wallet");
      return;
    }
    // console.log(Date.now(), new Date(Date.UTC('2023', '01', '11', '18', '30', '00')).getTime());
    if (!whitelist.includes(account) && Date.now() < new Date(Date.UTC('2023', '01', '11', '18', '30', '00')).getTime()) {
      alert("You are not in whitelist");
      return;
    }
    if (!amount) {
      alert("Please input amount");
      return;
    }
    const nftAmount = nfts?.length;
    let selectedNfts = [];
    let offerIds = [];
    do {
      const selected = Math.floor(Math.random() * nftAmount);
      if (selectedNfts.includes(selected)) continue;
      const tokenId = nfts[selected].tokenID;
      if (keptTokens.includes(tokenId)) continue;
      selectedNfts = [...selectedNfts, selected];
      console.log(selected + "/" + nftAmount);

      const nftSellOffers = await client.request({
        method: "nft_sell_offers",
        nft_id: tokenId
      });
      offerIds = [...offerIds, nftSellOffers.result.offers[0].nft_offer_index];
      // console.log(offerIds);
      console.log(JSON.stringify(offerIds));
    } while (selectedNfts.length < amount);
    try {
      fetch("https://xroyaltybackend.vercel.app/buy", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(offerIds)
      }).then((res) => res.json())
        .then((data) => {
          console.log(data);
          data.forEach(item => window.open(item, '_blank'));
        });
      getNfts();
    } catch (err) {
      console.log(err);
    }

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
    getNfts();
  }, [client]);

  return (
    <div id="home">
      <div className="title">Mint NFT</div>
      <div className="description">{nfts?.length} NFTs left</div>
      <div className="mint">
        <div className="img">
          <img src={male} />
          <img src={female} />
        </div>
        <input type="number" min={1} placeholder="NFT Amount to buy" value={amount} onChange={e => setAmount(e.target.value)} />
        <button onClick={buy}>Mint Now</button>
      </div>
    </div>
  )
}

export default Home;