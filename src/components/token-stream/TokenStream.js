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
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useCreateStream } from "@/hooks/useCreateStream";
import { useWithdrawStream } from "@/hooks/useWithdrawStream";

const TokenStream = () => {
  const account = useCurrentAccount();
  const [mode, setMode] = useState("create");
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    createStream,
    isLoading: isCreating,
    error: createError,
    transactionDigest: createDigest,
    streamId,
    setError: setCreateError,
    setIsLoading: setIsCreating,
  } = useCreateStream();

  const {
    withdrawFromStream,
    isLoading: isWithdrawing,
    error: withdrawError,
    transactionDigest: withdrawDigest,
    setError: setWithdrawError,
    setIsLoading: setIsWithdrawing,
  } = useWithdrawStream();

  // Create Stream Form State
  const [createStreamData, setCreateStreamData] = useState({
    recipientAddress: account?.address || "",
    amountPerSecond: "",
    topupBalance: "",
  });

  // Withdraw Tokens Form State
  const [withdrawData, setWithdrawData] = useState({
    streamId: "", // Remove hardcoded stream ID
  });

  // Auto-populate recipient address when account is available
  useEffect(() => {
    if (account?.address && !createStreamData.recipientAddress) {
      setCreateStreamData((prev) => ({
        ...prev,
        recipientAddress: account.address,
      }));
    }
  }, [account?.address]);

  // Copy transaction digest to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCreateStreamChange = (field, value) => {
    setCreateStreamData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCreateError("");
    setIsSuccess(false);
  };

  const handleWithdrawChange = (field, value) => {
    setWithdrawData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setWithdrawError("");
    setIsSuccess(false);
  };

  const handleModeToggle = (newMode) => {
    setMode(newMode);
    setCreateError("");
    setWithdrawError("");
    setIsSuccess(false);
  };

  const handleSubmit = async () => {
    if (mode === "create") {
      try {
        setIsCreating(true);
        setCreateError("");
        setIsSuccess(false);

        const result = await createStream(createStreamData);

        if (result) {
          setIsSuccess(true);
          // If we have a stream ID, switch to withdraw mode and pre-fill it
          if (result.streamId) {
            console.log(
              "Setting withdraw data with stream ID:",
              result.streamId
            );
            setWithdrawData((prev) => ({
              ...prev,
              streamId: result.streamId,
            }));
            // Don't automatically switch to withdraw mode
            // setMode("withdraw");
          }
        }
      } catch (err) {
        setCreateError(err.message);
      } finally {
        setIsCreating(false);
      }
    } else {
      try {
        setIsWithdrawing(true);
        setWithdrawError("");
        setIsSuccess(false);

        const result = await withdrawFromStream(withdrawData.streamId);

        if (result) {
          setIsSuccess(true);
        }
      } catch (err) {
        setWithdrawError(err.message);
      } finally {
        setIsWithdrawing(false);
      }
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
                  disabled={isCreating}
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
                  disabled={isWithdrawing}
                >
                  Withdraw Tokens
                </button>
              </div>
            </div>

            {/* Alerts */}
            {(createError || withdrawError) && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {createError || withdrawError}
                </AlertDescription>
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

                    {mode === "create" && (
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Stream ID:
                          </span>
                          {streamId && (
                            <button
                              onClick={() => copyToClipboard(streamId)}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                              title="Copy stream ID"
                            >
                              <Copy className="w-3 h-3" />
                              {copied ? "Copied!" : "Copy"}
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 break-all mb-2">
                          {streamId || "Extracting stream ID..."}
                        </div>
                        {streamId && (
                          <div className="mt-2">
                            <button
                              onClick={() => {
                                setWithdrawData((prev) => ({
                                  ...prev,
                                  streamId: streamId,
                                }));
                                setMode("withdraw");
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
                            >
                              Switch to withdraw mode
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {(createDigest || withdrawDigest) && (
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Transaction ID:
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(createDigest || withdrawDigest)
                            }
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                            title="Copy transaction ID"
                          >
                            <Copy className="w-3 h-3" />
                            {copied ? "Copied!" : "Copy"}
                          </button>
                        </div>

                        <div className="text-xs text-gray-600 break-all mb-2">
                          {createDigest || withdrawDigest}
                        </div>

                        <a
                          href={`https://suiscan.xyz/devnet/tx/${
                            createDigest || withdrawDigest
                          }`}
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
                          disabled={isCreating}
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
                          disabled={isCreating}
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
                          disabled={isCreating}
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
                  {/* Stream ID */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Stream ID
                    </label>
                    <div className="bg-background rounded-xl md:rounded-2xl p-3 md:p-4 border-border border">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={withdrawData.streamId}
                          onChange={(e) =>
                            handleWithdrawChange("streamId", e.target.value)
                          }
                          placeholder="0x189c51d794cdd150e7b40e7bf837d4455c59298d7c252c66457b3e9358640683"
                          className="w-full text-sm md:text-base bg-transparent outline-none"
                          disabled={isWithdrawing}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 md:mt-8">
                <button
                  className={cn(
                    "w-full bg-primary text-primary-foreground font-medium py-3 md:py-4 rounded-xl md:rounded-2xl transition-colors flex items-center justify-center gap-2",
                    isCreating || isWithdrawing
                      ? "opacity-75 cursor-not-allowed"
                      : "hover:bg-primary/90"
                  )}
                  onClick={handleSubmit}
                  disabled={isCreating || isWithdrawing}
                >
                  {isCreating || isWithdrawing ? (
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
                    Enter the stream ID you want to withdraw from. You must be
                    the recipient of the stream.
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
