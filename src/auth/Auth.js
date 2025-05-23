"use client";

import React, { useState, useEffect } from "react";
import { Loader2, LogOutIcon } from "lucide-react";
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
  useCurrentAccount,
  useDisconnectWallet,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ConnectWalletCard from "./WalletAuthClient";

const queryClient = new QueryClient();

// Configure network connections using createNetworkConfig
const { networkConfig } = createNetworkConfig({
  devnet: { 
    url: getFullnodeUrl("devnet"),
    variables: {
      myMovePackageId: "0x02fb5b37f3f4be24cd4f0e90c8ee168919ab6f6ccad20a0baa26667e0d74cd5e"
    }
  },
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});

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
        <SuiClientProvider networks={networkConfig} defaultNetwork="devnet">
          <WalletProvider autoConnect={true}>
            <WalletInterface>{children}</WalletInterface>
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </ClientOnly>
  );
};

export default Auth;