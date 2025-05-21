"use client";

import React, { useState, useEffect } from "react";
import { Loader2, LogOutIcon } from "lucide-react";
import {
  SuiClientProvider,
  WalletProvider,
  useCurrentAccount,
  useDisconnectWallet,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ConnectWalletCard from "./WalletAuthClient";

const queryClient = new QueryClient();

// Configure network connections
const networks = {
  // mainnet: { url: getFullnodeUrl("mainnet") },
  // testnet: { url: getFullnodeUrl("testnet") },
  devnet: { url: getFullnodeUrl("devnet") },
};


const WalletInterface = ({ children }) => {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  if (!currentAccount || !currentAccount.address) {
    return <ConnectWalletCard />;
  }

  return (
    <>
      {children}
    </>
  );
};


const ClientOnly = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      </div>
    );
  }

  return children;
};


const Auth = ({ children }) => {
  return (
    <ClientOnly>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networks} defaultNetwork="devnet">
          <WalletProvider autoConnect={true}>
            <WalletInterface>{children}</WalletInterface>
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </ClientOnly>
  );
};

export default Auth;
