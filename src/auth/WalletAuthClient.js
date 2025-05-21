"use client";

import React, { useState } from "react";
import { Wallet, Loader2 } from "lucide-react";
import { useWallets, useConnectWallet } from '@mysten/dapp-kit';

const ConnectWalletCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();

  const handleConnect = (wallet) => {
    setIsConnecting(true);
    try {
      connect({ 
        wallet,
        onSuccess: () => {
          setIsConnecting(false);
          setIsOpen(false);
        },
        onError: () => {
          setIsConnecting(false);
        }
      });
    } catch (e) {
      console.error("Error connecting wallet:", e);
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto min-h-screen grid place-items-center">
      <div className="w-full rounded-[20px] md:rounded-[35px] p-6 md:p-8 flex flex-col border bg-muted/30 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[20px] md:rounded-[35px]">
          <div className="absolute bottom-0 right-0 w-32 md:w-40 h-24 md:h-28 grid grid-cols-3 gap-2 p-4">
            <div className="w-full h-full rounded-lg bg-muted"></div>
            <div className="w-full h-full rounded-lg border-2 border-muted"></div>
            <div className="w-full h-full rounded-lg bg-muted/50"></div>
            <div className="w-full h-full rounded-lg border-2 border-muted"></div>
            <div className="w-full h-full rounded-lg bg-muted/80"></div>
            <div className="w-full h-full rounded-lg border-2 border-muted rotate-3"></div>
          </div>
          <div className="absolute bottom-4 right-28 md:right-36 w-4 md:w-6 h-4 md:h-6 rounded-full border-2 border-muted"></div>
          <div className="absolute bottom-12 md:bottom-16 right-24 md:right-28 w-3 md:w-4 h-3 md:h-4 rounded-full bg-muted/60"></div>
        </div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary flex items-center justify-center">
              <Wallet className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-medium text-center mb-4">Connect Your Wallet</h2>
          
          <p className="text-center text-muted-foreground mb-8 max-w-md mx-auto">
            Connect your Sui wallet to access the Payroll Protocol and manage your distributions securely.
          </p>
          
          {isOpen ? (
            <div className="space-y-3 max-w-sm mx-auto">
              {wallets.length > 0 ? (
                <>
                  <div className="text-sm text-center text-muted-foreground mb-3">
                    Select a wallet to connect
                  </div>
                  
                  {wallets.map((wallet) => (
                    <button
                      key={wallet.name}
                      onClick={() => handleConnect(wallet)}
                      disabled={isConnecting}
                      className="w-full bg-background border rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center justify-between hover:bg-primary/5 transition-colors"
                    >
                      <span className="font-medium">{wallet.name}</span>
                      {isConnecting && (
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                      )}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full text-sm text-muted-foreground py-2 hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <div className="text-center p-4 bg-background border rounded-xl md:rounded-2xl">
                  <p className="mb-3 font-medium">No wallets detected</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please install a Sui wallet extension such as Sui Wallet or Backpack
                  </p>
                  <a 
                    href="https://chrome.google.com/webstore/category/extensions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline"
                  >
                    Browse Wallet Extensions
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => setIsOpen(true)}
                className="bg-primary text-primary-foreground font-medium py-3 md:py-4 px-6 md:px-8 rounded-xl md:rounded-2xl transition-colors hover:bg-primary/90 min-w-48"
              >
                Connect Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectWalletCard;