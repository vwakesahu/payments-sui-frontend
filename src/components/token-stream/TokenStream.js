import React, { useState, useEffect } from "react";
import {
  ArrowUpFromLine,
  ArrowDownToLine,
  Loader2,
  Clock,
  Wallet,
  User,
  HeartHandshake,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import HeroHeader from "../HeroHeader";
import {
  useCurrentAccount,
  useSignTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const TokenStream = () => {
  const account = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const suiClient = useSuiClient();
  const [mode, setMode] = useState("create");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionDigest, setTransactionDigest] = useState("");
  const [copied, setCopied] = useState(false);

  // Copy transaction digest to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Create Stream Form State
  const [createStreamData, setCreateStreamData] = useState({
    recipientAddress: account?.address || "", // Pre-populate with your address
    amountPerSecond: "",
    topupBalance: "",
  });

  // Withdraw Tokens Form State
  const [withdrawData, setWithdrawData] = useState({
    creatorAddress: "",
    amountPerSecond: "",
  });

  // Auto-populate recipient address when account is available
  useEffect(() => {
    if (account?.address && !createStreamData.recipientAddress) {
      setCreateStreamData(prev => ({
        ...prev,
        recipientAddress: account.address,
      }));
    }
  }, [account?.address]);

  // FORM-BASED FUNCTION - Using form values with proper integer handling
  const createStreamFromForm = async () => {
    try {
      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Validate form inputs
      if (!createStreamData.recipientAddress || !createStreamData.amountPerSecond || !createStreamData.topupBalance) {
        throw new Error("Please fill all fields");
      }

      if (!createStreamData.recipientAddress.startsWith("0x")) {
        throw new Error("Invalid recipient address format");
      }

      console.log("=== CREATING STREAM FROM FORM VALUES ===");
      const tx = new Transaction();

      // Parse and validate form inputs
      const amountPerSecondNum = parseFloat(createStreamData.amountPerSecond);
      const topupBalanceNum = parseFloat(createStreamData.topupBalance);

      if (isNaN(amountPerSecondNum) || isNaN(topupBalanceNum)) {
        throw new Error("Invalid number values");
      }

      if (amountPerSecondNum <= 0 || topupBalanceNum <= 0) {
        throw new Error("Amounts must be greater than 0");
      }

      // Convert to MIST (smallest unit) and ensure integers
      const amountPerSecondInMist = Math.floor(amountPerSecondNum * 1e9);
      const topupBalanceInMist = Math.floor(topupBalanceNum * 1e9);

      // Validate converted amounts
      if (amountPerSecondInMist <= 0 || topupBalanceInMist <= 0) {
        throw new Error("Amounts are too small - use larger values");
      }

      if (amountPerSecondInMist > topupBalanceInMist) {
        throw new Error("Amount per second cannot be greater than total balance");
      }

      // Calculate duration (ensuring integer result)
      const durationInSeconds = Math.floor(topupBalanceInMist / amountPerSecondInMist);
      if (durationInSeconds <= 0) {
        throw new Error("Stream duration is too short");
      }

      // Get current time and calculate end time (both integers)
      const currentTime = Math.floor(Date.now() / 1000);
      const endTime = currentTime + durationInSeconds;

      console.log("Form-based transaction values:", {
        recipient: createStreamData.recipientAddress,
        amountPerSecondInMist,
        topupBalanceInMist,
        currentTime,
        endTime,
        durationInSeconds,
      });

      // Verify all values are integers
      console.log("All values are integers:", {
        amountPerSecondInMist: Number.isInteger(amountPerSecondInMist),
        topupBalanceInMist: Number.isInteger(topupBalanceInMist),
        currentTime: Number.isInteger(currentTime),
        endTime: Number.isInteger(endTime),
        durationInSeconds: Number.isInteger(durationInSeconds),
      });

      // Create coin with the stream amount
      const [coin] = tx.splitCoins(tx.gas, [topupBalanceInMist]);

      // Use the working transaction structure
      tx.moveCall({
        target: `0xdebe630104899d2488485b82e953b02a4e8d95775f152dbd6fd6e7b91eb9ba8e::streaming::create_stream_entry`,
        typeArguments: ["0x2::sui::SUI"],
        arguments: [
          coin,
          tx.pure.address(createStreamData.recipientAddress),
          tx.pure.u64(currentTime),
          tx.pure.u64(endTime),
          tx.object("0x6"),
        ],
      });

      console.log("Signing form-based transaction...");

      const { bytes, signature, reportTransactionEffects } = await signTransaction({
        transaction: tx,
      });

      console.log("Executing form-based transaction...");

      const result = await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showRawEffects: true,
        },
      });

      if (reportTransactionEffects && result.rawEffects) {
        await reportTransactionEffects(result.rawEffects);
      }

      console.log("SUCCESS: Form-based transaction completed:", result);
      
      // Store transaction digest for the success link
      if (result.digest) {
        setTransactionDigest(result.digest);
      }
      
      return result;
      
    } catch (error) {
      console.error("Form-based transaction failed:", error);
      throw error;
    }
  };

  const handleCreateStreamChange = (field, value) => {
    setCreateStreamData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
    setIsSuccess(false);
    setTransactionDigest(""); // Clear previous transaction
    setCopied(false); // Reset copy state
  };

  const handleWithdrawChange = (field, value) => {
    setWithdrawData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
    setIsSuccess(false);
    setTransactionDigest(""); // Clear previous transaction
    setCopied(false); // Reset copy state
  };

  const handleModeToggle = (newMode) => {
    setMode(newMode);
    setError("");
    setIsSuccess(false);
    setTransactionDigest(""); // Clear previous transaction
    setCopied(false); // Reset copy state
  };

  const createStream = async (
    recipientAddress,
    amountPerSecond,
    topupBalance
  ) => {
    try {
      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      console.log("Creating transaction...");
      const tx = new Transaction();

      // Convert amount per second to a smaller unit (e.g., from tokens to smallest unit)
      const amountPerSecondInSmallestUnit = Math.floor(
        parseFloat(amountPerSecond) * 1e9
      ); // Assuming 9 decimals
      const topupBalanceInSmallestUnit = Math.floor(
        parseFloat(topupBalance) * 1e9
      );

      // Get current timestamp
      const currentTime = Math.floor(Date.now() / 1000);
      const endTime =
        currentTime +
        topupBalanceInSmallestUnit / amountPerSecondInSmallestUnit;

      console.log("Transaction parameters:", {
        amountPerSecondInSmallestUnit,
        recipientAddress,
        currentTime,
        endTime,
      });

      // Create the stream
      tx.moveCall({
        target: `0x02fb5b37f3f4be24cd4f0e90c8ee168919ab6f6ccad20a0baa26667e0d74cd5e::streaming::create_stream_entry`,
        arguments: [
          tx.pure.u64(amountPerSecondInSmallestUnit), // amount - specify as u64
          tx.pure.address(recipientAddress), // recipient - specify as address
          tx.pure.u64(currentTime), // start_time - specify as u64
          tx.pure.u64(endTime), // end_time - specify as u64
          tx.object("0x6"), // clock object
        ],
      });

      console.log("Signing transaction...");
      
      // Sign the transaction (this bypasses the network config issue)
      const { bytes, signature, reportTransactionEffects } = await signTransaction({
        transaction: tx,
      });

      console.log("Executing signed transaction...");
      
      // Execute the signed transaction directly through the client
      const result = await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showRawEffects: true,
        },
      });

      // Report effects back to wallet (important for wallet state sync)
      if (reportTransactionEffects && result.rawEffects) {
        await reportTransactionEffects(result.rawEffects);
      }

      console.log("Transaction result:", result);
      return result;
    } catch (error) {
      console.error("Error creating stream:", error);
      
      // More specific error handling
      if (error.message.includes("NetworkConfig")) {
        throw new Error("Network configuration error. Please ensure your wallet is connected to Devnet.");
      } else if (error.message.includes("Insufficient")) {
        throw new Error("Insufficient funds. Please ensure you have enough SUI tokens for gas fees.");
      } else if (error.message.includes("pure")) {
        throw new Error("Transaction parameter error. Please check your input values.");
      }
      
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (mode === "create") {
      try {
        setIsLoading(true);
        setError("");
        setTransactionDigest(""); // Clear previous transaction
        setCopied(false); // Reset copy state

        console.log("=== USING FORM VALUES ===");
        const result = await createStreamFromForm(); // Use form-based function

        if (result) {
          setIsSuccess(true);
        }
      } catch (err) {
        setError("Failed to create token stream: " + err.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Form validation for withdraw
      if (!withdrawData.creatorAddress || !withdrawData.amountPerSecond) {
        setError("Please fill all fields");
        return;
      }
      // Withdraw functionality not implemented yet
      setError("Withdraw functionality coming soon!");
    }
  };

  // Calculate estimated stream information based on form input data
  const calculateStreamInfo = () => {
    if (!createStreamData.amountPerSecond || !createStreamData.topupBalance) {
      return null;
    }

    const ratePerSecond = parseFloat(createStreamData.amountPerSecond);
    const balance = parseFloat(createStreamData.topupBalance);

    if (isNaN(ratePerSecond) || isNaN(balance) || ratePerSecond === 0) {
      return null;
    }

    const durationInSeconds = balance / ratePerSecond;
    const days = Math.floor(durationInSeconds / 86400);
    const hours = Math.floor((durationInSeconds % 86400) / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);

    let duration = "";
    if (days > 0) duration += `${days}d `;
    if (hours > 0) duration += `${hours}h `;
    if (minutes > 0) duration += `${minutes}m`;

    return {
      durationInSeconds,
      formattedDuration: duration.trim() || "< 1m",
      ratePerDay: ratePerSecond * 86400,
      balance,
    };
  };

  const streamInfo = calculateStreamInfo();

  return (
    <div>
      <HeroHeader />
      <div className="mt-6 md:mt-10 max-w-7xl px-4 pb-10 md:pb-0 mx-auto md:px-8">
        <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-8">
          {/* Left Panel - Form */}
          <div className="w-full md:col-span-7 rounded-[20px] border bg-muted/30 md:rounded-[35px] p-4 md:p-8 flex flex-col">
            {/* Title & Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4 sm:gap-0">
              <h2 className="text-xl md:text-2xl font-medium">Token Stream</h2>
              <div className="w-full sm:w-auto bg-background rounded-full inline-flex border">
                <button
                  className={cn(
                    "flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-3 text-sm rounded-full transition-all",
                    mode === "create"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                  onClick={() => handleModeToggle("create")}
                  disabled={isLoading}
                >
                  Create Stream
                </button>
                <button
                  className={cn(
                    "flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-3 text-sm rounded-full transition-all",
                    mode === "withdraw"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                  onClick={() => handleModeToggle("withdraw")}
                  disabled={isLoading}
                >
                  Withdraw Tokens
                </button>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isSuccess && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="font-medium">
                        {mode === "create"
                          ? "Token stream created successfully!"
                          : "Tokens withdrawn successfully!"}
                      </span>
                    </div>
                    
                    {transactionDigest && (
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Transaction ID:
                          </span>
                          <button
                            onClick={() => copyToClipboard(transactionDigest)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                            title="Copy transaction ID"
                          >
                            <Copy className="w-3 h-3" />
                            {copied ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        
                        <div className="text-xs text-gray-600 break-all mb-2">
                          {transactionDigest}
                        </div>
                        
                        <a
                          href={`https://suiscan.xyz/devnet/tx/${transactionDigest}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View on Sui Explorer
                        </a>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Form Content */}
            <div className="flex-1 flex flex-col">
              {mode === "create" ? (
                // CREATE STREAM FORM
                <div className="space-y-4 md:space-y-6">
                  {/* Recipient Address */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Enter an Address to Stream
                    </label>
                    <div className="bg-background rounded-xl md:rounded-2xl p-3 md:p-4 border-border border">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={createStreamData.recipientAddress}
                          onChange={(e) =>
                            handleCreateStreamChange(
                              "recipientAddress",
                              e.target.value
                            )
                          }
                          placeholder="0x0C2E8090a89A0af9"
                          className="w-full text-sm md:text-base bg-transparent outline-none"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Amount Per Second */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Amount to Stream (per second)
                    </label>
                    <div className="bg-background rounded-xl md:rounded-2xl p-3 md:p-4 border-border border">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <input
                          type="number"
                          value={createStreamData.amountPerSecond}
                          onChange={(e) =>
                            handleCreateStreamChange(
                              "amountPerSecond",
                              e.target.value
                            )
                          }
                          placeholder="0.001"
                          className="w-full text-sm md:text-base bg-transparent outline-none"
                          disabled={isLoading}
                        />
                        <span className="text-sm text-muted-foreground">
                          tokens/sec
                        </span>
                      </div>
                    </div>
                    {createStreamData.amountPerSecond &&
                      !isNaN(parseFloat(createStreamData.amountPerSecond)) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ≈{" "}
                          {(
                            parseFloat(createStreamData.amountPerSecond) * 86400
                          ).toFixed(3)}{" "}
                          tokens per day
                        </p>
                      )}
                  </div>

                  {/* Topup Balance */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Topup Balance
                    </label>
                    <div className="bg-background rounded-xl md:rounded-2xl p-3 md:p-4 border-border border">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-muted-foreground" />
                        <input
                          type="number"
                          value={createStreamData.topupBalance}
                          onChange={(e) =>
                            handleCreateStreamChange(
                              "topupBalance",
                              e.target.value
                            )
                          }
                          placeholder="1000"
                          className="w-full text-sm md:text-base bg-transparent outline-none"
                          disabled={isLoading}
                        />
                        <span className="text-sm text-muted-foreground">
                          tokens
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // WITHDRAW TOKENS FORM
                <div className="space-y-4 md:space-y-6">
                  {/* Creator Address */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Creator Address
                    </label>
                    <div className="bg-background rounded-xl md:rounded-2xl p-3 md:p-4 border-border border">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={withdrawData.creatorAddress}
                          onChange={(e) =>
                            handleWithdrawChange(
                              "creatorAddress",
                              e.target.value
                            )
                          }
                          placeholder="0x0C2E8090a89A0af9"
                          className="w-full text-sm md:text-base bg-transparent outline-none"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Amount Per Second */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Amount to Stream (per second)
                    </label>
                    <div className="bg-background rounded-xl md:rounded-2xl p-3 md:p-4 border-border border">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <input
                          type="number"
                          value={withdrawData.amountPerSecond}
                          onChange={(e) =>
                            handleWithdrawChange(
                              "amountPerSecond",
                              e.target.value
                            )
                          }
                          placeholder="0.001"
                          className="w-full text-sm md:text-base bg-transparent outline-none"
                          disabled={isLoading}
                        />
                        <span className="text-sm text-muted-foreground">
                          tokens/sec
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 md:mt-8">
                <button
                  className={cn(
                    "w-full bg-primary text-primary-foreground font-medium py-3 md:py-4 rounded-xl md:rounded-2xl transition-colors flex items-center justify-center gap-2",
                    isLoading
                      ? "opacity-75 cursor-not-allowed"
                      : "hover:bg-primary/90"
                  )}
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                      {mode === "create"
                        ? "Creating Stream..."
                        : "Withdrawing Tokens..."}
                    </>
                  ) : (
                    <>
                      {mode === "create" ? (
                        <>
                          <ArrowUpFromLine className="w-4 h-4" />
                          Create Stream
                        </>
                      ) : (
                        <>
                          <ArrowDownToLine className="w-4 h-4" />
                          Withdraw Tokens
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Information Cards */}
          <div className="w-full md:col-span-5 grid grid-cols-1 md:grid-rows-2 gap-4 md:gap-8">
            {/* Top Info Card */}
            <div className="bg-background rounded-[20px] md:rounded-[35px] p-6 md:p-8 relative overflow-hidden border">
              <div className="absolute inset-0 pointer-events-none">
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

              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 md:mb-2">
                    {mode === "create"
                      ? "Stream Duration"
                      : "Available to Withdraw"}
                  </p>
                  <p className="text-2xl md:text-3xl font-medium">
                    {mode === "create"
                      ? streamInfo
                        ? streamInfo.formattedDuration
                        : "—"
                      : "—"}
                  </p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-base md:text-lg">
                    ↑
                  </span>
                </div>
              </div>

              {mode === "create" && (
                <div className="mt-6 space-y-4">
                  {streamInfo ? (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Rate per Day
                        </p>
                        <p className="text-lg font-medium">
                          {streamInfo.ratePerDay.toFixed(4)} tokens
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Deposit
                        </p>
                        <p className="text-lg font-medium">
                          {streamInfo.balance} tokens
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground italic">
                      Complete the form to see stream details
                    </p>
                  )}
                </div>
              )}

              {mode === "withdraw" && (
                <div className="mt-6 space-y-4">
                  <p className="text-muted-foreground italic">
                    Enter creator address to see available tokens
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Info Card */}
            <div className="bg-[#00C670]/70 rounded-[20px] md:rounded-[35px] p-6 md:p-8 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 right-4 w-32 md:w-40 h-full grid grid-cols-2 gap-2 md:gap-3 p-4">
                  <div className="w-full h-12 md:h-14 rounded-lg border-2 border-white/20 -rotate-2"></div>
                </div>
                <div className="absolute top-8 md:top-10 right-40 md:right-48 w-4 md:w-6 h-4 md:h-6 rounded-full border-2 border-white/20"></div>
                <div className="absolute bottom-8 md:bottom-10 right-36 md:right-44 w-3 md:w-4 h-3 md:h-4 rounded-full bg-white/10"></div>
              </div>

              <div className="flex flex-col justify-between h-full relative z-10">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-background flex items-center justify-center mb-8 md:mb-12">
                  <span className="text-foreground text-base md:text-lg">
                    $
                  </span>
                </div>
                <div>
                  <p className="mb-2 md:mb-3 text-white">
                    {mode === "create" ? "Streaming Rate" : "Withdraw Amount"}
                  </p>
                  <div className="text-4xl md:text-5xl font-medium text-white">
                    {mode === "create"
                      ? createStreamData.amountPerSecond
                        ? `${parseFloat(
                            createStreamData.amountPerSecond
                          ).toFixed(
                            parseFloat(createStreamData.amountPerSecond) < 0.01
                              ? 6
                              : 4
                          )}/sec`
                        : "..."
                      : "..."}
                  </div>
                  {mode === "create" && createStreamData.amountPerSecond && (
                    <p className="text-white/80 text-sm mt-2">
                      Continuous payment stream
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenStream;