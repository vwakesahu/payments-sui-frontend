"use client";

import React, { useState } from 'react';

/**
 * ConnectWallet component for wallet authentication
 * @param {Object} props - Component props
 * @param {Function} props.onConnect - Function to call when wallet connects
 * @returns {React.ReactNode}
 */
const ConnectWallet = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle wallet connection
  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the onConnect callback
      onConnect();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Connect Your Wallet</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Connect your wallet to access the application</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Auth component with integrated wallet connection handling
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when wallet is connected
 * @returns {React.ReactNode}
 */
const Auth = ({ children }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(true);

  // Function to handle successful wallet connection
  const handleWalletConnect = () => {
    setIsWalletConnected(true);
  };

  // Function exposed to children for disconnecting
  const disconnectWallet = () => {
    setIsWalletConnected(false);
  };

  // Add the disconnect function to the context for children to use
  const childrenWithProps = React.Children.map(children, child => {
    // Check if child is a valid React element
    if (React.isValidElement(child)) {
      // Clone the child with added props
      return React.cloneElement(child, { disconnectWallet });
    }
    return child;
  });

  // Only render children if wallet is connected
  if (isWalletConnected) {
    return <>{childrenWithProps}</>;
  }
  
  // Otherwise render the connect wallet component
  return <ConnectWallet onConnect={handleWalletConnect} />;
};

export default Auth;