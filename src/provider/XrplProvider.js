import React, { createContext, useEffect, useState } from 'react';
const xrpl = require("xrpl");

const network = "wss://s.altnet.rippletest.net:51233";

export const Xrpl = createContext({
    _xrpl: null,
    client: null,
    account: null,
    connectWallet: () => { }
})

function XrplProvider({ children }) {
    const [_xrpl, setXrpl] = useState(null);
    const [account, setAccount] = useState(null);
    const [client, setClient] = useState(null);



    async function connectWallet() {
        fetch("https://xroyaltybackend.vercel.app", { method: "POST" })
            .then((res) => res.json())
            .then((data) => window.open(data.url, '_blank'));
    }

    useEffect(() => {
        async function connect() {
            const client = new xrpl.Client(network);
            await client.connect();
            console.log(client);
            setXrpl(xrpl);
            setClient(client);
        }
        connect();
        return async () => client.disconnect();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetch("https://xroyaltybackend.vercel.app/info", { method: "POST" })
                .then((res) => res.json())
                .then((data) => {
                    if (!data) return;
                    console.log(data.address);
                    setAccount(data.address);
                });
        }, 5000);
        return () => clearInterval(interval);
    }, [])

    return (
        <Xrpl.Provider value={{ _xrpl, client, account, connectWallet }}>
            {children}
        </Xrpl.Provider>
    )
}

export default XrplProvider;