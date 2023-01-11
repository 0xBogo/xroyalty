const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const xrpl = require('xrpl');
const { XummSdk } = require('xumm-sdk');
const { TxData } = require("xrpl-txdata");
const Sdk = new XummSdk('f54e5c65-b31e-4ad1-ac6a-76199d1ad357', '7020a775-135f-4387-bf9d-4d5465276aff');
const Verify = new TxData();

const PORT = 8080;

const app = express();

// const FRONTEND_HOST = ["http://localhost:3000"];

// var corsOptions = {
//   origin: FRONTEND_HOST
// };

app.use(cors());
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));

let accountInfo = null;

app.post("/", async (req, res) => {
  const request = {
    "txjson": {
      "TransactionType": "SignIn",
    }
  }

  const subscription = await Sdk.payload.createAndSubscribe(request, event => {
    console.log('New payload event:', event.data);

    // The event data contains a property 'signed' (true or false), return :)
    if (Object.keys(event.data).indexOf('signed') > -1) {
      return event.data
    }
  })

  console.log('New payload created', { url: subscription.created.next.always })
  res.json({ url: subscription.created.next.always });
  console.log('  > Pushed:', subscription.created.pushed ? 'yes' : 'no')

  const resolveData = await subscription.resolved

  if (resolveData.signed === false) {
    console.log('The sign request was rejected :(')
  } else {
    console.log('Woohoo! The sign request was signed :)')
    /**
     * Let's fetch the full payload end result and check for
     * a transaction hash, to verify the transaction on ledger later.
     */
    console.log("resolve data:", resolveData);
    const result = await Sdk.payload.get(resolveData.payload_uuidv4);
    console.log(result.response.signer);
    accountInfo = { address: result.response.signer };
    // res.json(result.response.signer);
    // const curatedAssets = await Sdk.getCuratedAssets();
    // console.log(curatedAssets);
    // const verifiedResult = Verify.getOne(result.response.txid);
    // console.log('On ledger TX hash:', (await verifiedResult.balanceChanges));
  }
})

app.post("/info", async (req, res) => {
  console.log(accountInfo);
  res.json(accountInfo);
})

app.post("/buy", async (req, res) => {
  const offerIds = req.body;
  console.log(offerIds);
  let urls = [];
  for (const offerId of offerIds) {
    const request = {
      "TransactionType": "NFTokenAcceptOffer",
      // "Account": account,
      "NFTokenSellOffer": offerId,
    };
    const subscription = await Sdk.payload.createAndSubscribe(request, event => {
      console.log('New payload event:', event.data);
      // The event data contains a property 'signed' (true or false), return :)
      if (Object.keys(event.data).indexOf('signed') > -1) {
        return event.data
      }
    });

    console.log('New payload created', { url: subscription.created.next.always });
    urls = [...urls, subscription.created.next.always];
  }
  if (offerIds.length === urls.length) {
    console.log("first")
    res.json(urls);
  }
})

app.post("/mint", async (req, res) => {
  console.log(req);

  const request = {
    "txjson": {
      "TransactionType": "NFTokenMint",
      "URI": xrpl.convertStringToHex(`https://ipfs.io/ipfs/QmchHmbHmrzEBrH9rPt2aYonPkmqcvM6aAi468hp5Gzfd8/0.jpg`),
      "Flags": 8, // tfTransferable
      "TransferFee": 0,
      "NFTokenTaxon": 0
    }
  }

  const subscription = await Sdk.payload.createAndSubscribe(request, event => {
    console.log('New payload event:', event.data);

    // The event data contains a property 'signed' (true or false), return :)
    if (Object.keys(event.data).indexOf('signed') > -1) {
      return event.data
    }
  })

  console.log('New payload created', { url: subscription.created.next.always })
  res.json({ url: subscription.created.next.always });
  console.log('  > Pushed:', subscription.created.pushed ? 'yes' : 'no')

  const resolveData = await subscription.resolved

  if (resolveData.signed === false) {
    console.log('The sign request was rejected :(')
  } else {
    console.log('Woohoo! The sign request was signed :)')
    /**
     * Let's fetch the full payload end result and check for
     * a transaction hash, to verify the transaction on ledger later.
     */
    const result = await Sdk.payload.get(resolveData.payload_uuidv4)
    const verifiedResult = Verify.getOne(result.response.txid);
    console.log('On ledger TX hash:', (await verifiedResult.balanceChanges));
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});