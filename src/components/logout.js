"use client";

import { LogOutIcon, Copy, CheckCircle2 } from "lucide-react";
import React, { useState } from "react";
import { useDisconnectWallet, useCurrentAccount } from '@mysten/dapp-kit';

const LogoutButton = ({ disconnectWallet }) => {
  // If the disconnectWallet prop is provided, use it
  // Otherwise, use the hook directly (as a fallback)
  const { mutate: disconnectFromHook } = useDisconnectWallet();
  const currentAccount = useCurrentAccount();
  const [copied, setCopied] = useState(false);
  
  const handleLogout = () => {
    if (disconnectWallet) {
      // Use the provided disconnectWallet function from parent
      disconnectWallet();
    } else {
      // Use the hook as a fallback
      disconnectFromHook();
    }
    
    console.log("Wallet disconnected");
  };

  const handleCopyAddress = () => {
    if (currentAccount && currentAccount.address) {
      navigator.clipboard.writeText(currentAccount.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format the address for display - only if we have an address
  const formattedAddress = currentAccount && currentAccount.address 
    ? `${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}`
    : '';

  return (
    <div className="flex items-center gap-3">
      {formattedAddress && (
        <div 
          className="flex items-center gap-1.5 bg-muted border rounded-full py-1.5 px-3 text-sm cursor-pointer transition-colors"
          onClick={handleCopyAddress}
        >
          {formattedAddress}
          <span className="ml-1">
            {copied ? (
              <CheckCircle2 size={14} className="text-green-500" />
            ) : (
              <Copy size={14} className="text-muted-foreground" />
            )}
          </span>
        </div>
      )}
      
      <div 
        className="bg-primary w-9 h-9 rounded-full grid place-items-center p-1.5 cursor-pointer hover:bg-primary/80"
        onClick={handleLogout}
        role="button"
        aria-label="Logout"
      >
        <LogOutIcon size={16} className="text-white" />
      </div>
    </div>
  );
};

export default LogoutButton;