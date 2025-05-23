import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  BarChart3,
  Hourglass,
  Loader2,
  Copy,
  ExternalLink,
  ArrowUpFromLine,
  ArrowDownToLine,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import HeroHeader from "../HeroHeader";
import { useCreateVesting } from "@/hooks/useCreateVesting";
import { useClaimVesting } from "@/hooks/useClaimVesting";

const Vesting = () => {
  const [mode, setMode] = useState("create");
  const [copied, setCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Create vesting state
  const [vestingData, setVestingData] = useState({
    beneficiaryAddress: "",
    amount: "",
    cliff: "",
    releaseRate: "",
    period: "",
  });

  // Claim vesting state
  const [claimData, setClaimData] = useState({
    vestingId: "",
  });

  const {
    createVesting,
    isLoading: isCreating,
    error: createError,
    transactionDigest: createDigest,
    vestingId,
    setError: setCreateError,
    setIsLoading: setIsCreating,
  } = useCreateVesting();

  const {
    claimVesting,
    isLoading: isClaiming,
    error: claimError,
    transactionDigest: claimDigest,
    setError: setClaimError,
    setIsLoading: setIsClaiming,
  } = useClaimVesting();

  const handleVestingChange = (field, value) => {
    setVestingData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCreateError("");
    setIsSuccess(false);
    setSuccessMessage("");
  };

  const handleClaimChange = (field, value) => {
    setClaimData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setClaimError("");
    setIsSuccess(false);
    setSuccessMessage("");
  };

  const handleModeToggle = (newMode) => {
    // Clear all states when switching modes
    setMode(newMode);
    setCreateError("");
    setClaimError("");
    setIsSuccess(false);
    setSuccessMessage("");
    setCopied(false);

    // If switching to claim mode and we have a vesting ID, auto-fill it
    if (newMode === "claim" && vestingId) {
      setClaimData((prev) => ({
        ...prev,
        vestingId: vestingId,
      }));
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSubmit = async () => {
    if (mode === "create") {
      try {
        setIsCreating(true);
        setCreateError("");
        setIsSuccess(false);
        setSuccessMessage("");

        const result = await createVesting(vestingData);

        if (result) {
          setIsSuccess(true);
          setSuccessMessage("Vesting schedule created successfully!");
          // If we have a vesting ID, update the claim data
          if (result.vestingId) {
            setClaimData((prev) => ({
              ...prev,
              vestingId: result.vestingId,
            }));
          }
        }
      } catch (err) {
        setCreateError(err.message);
      } finally {
        setIsCreating(false);
      }
    } else {
      try {
        setIsClaiming(true);
        setClaimError("");
        setIsSuccess(false);
        setSuccessMessage("");

        const result = await claimVesting(claimData.vestingId);

        if (result) {
          setIsSuccess(true);
          setSuccessMessage("Tokens claimed successfully!");
        }
      } catch (err) {
        setClaimError(err.message);
      } finally {
        setIsClaiming(false);
      }
    }
  };

  // Function to convert seconds to human-readable format
  const formatTime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    let result = "";
    if (days > 0) result += `${days} day${days > 1 ? "s" : ""} `;
    if (hours > 0) result += `${hours} hour${hours > 1 ? "s" : ""} `;
    if (minutes > 0) result += `${minutes} minute${minutes > 1 ? "s" : ""}`;

    return result.trim() || `${seconds} seconds`;
  };

  // Calculate estimated unlock based on input data
  const calculateUnlock = () => {
    if (
      !vestingData.amount ||
      !vestingData.releaseRate ||
      !vestingData.period
    ) {
      return null;
    }

    const amount = parseFloat(vestingData.amount);
    const releaseRate = parseFloat(vestingData.releaseRate);
    const period = parseFloat(vestingData.period);

    if (
      isNaN(amount) ||
      isNaN(releaseRate) ||
      isNaN(period) ||
      releaseRate === 0
    ) {
      return null;
    }

    return {
      totalTime: period,
      formattedTime: formatTime(period),
      totalAmount: amount,
      ratePerSecond: releaseRate,
    };
  };

  const unlockInfo = calculateUnlock();

  return (
    <div>
      <HeroHeader />
      <div className="mt-6 md:mt-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-8">
          {/* Left Panel - Vesting Form */}
          <div className="w-full md:col-span-7 rounded-[20px] border bg-muted/30 md:rounded-[35px] p-4 md:p-8 flex flex-col">
            {/* Title & Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4 sm:gap-0">
              <h2 className="text-xl md:text-2xl font-medium">Token Vesting</h2>
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
                  Create Vesting
                </button>
                <button
                  className={cn(
                    "flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-3 text-sm rounded-full transition-all",
                    mode === "claim"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                  onClick={() => handleModeToggle("claim")}
                  disabled={isClaiming}
                >
                  Claim Tokens
                </button>
              </div>
            </div>

            {/* Alerts */}
            {(createError || claimError) && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{createError || claimError}</AlertDescription>
              </Alert>
            )}

            {isSuccess && mode === "create" && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="font-medium">{successMessage}</span>
                    </div>

                    {vestingId && (
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Vesting ID:
                          </span>
                          <button
                            onClick={() => copyToClipboard(vestingId)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                            title="Copy vesting ID"
                          >
                            <Copy className="w-3 h-3" />
                            {copied ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 break-all mb-2">
                          {vestingId}
                        </div>
                        <div className="mt-2">
                          <button
                            onClick={() => {
                              setClaimData((prev) => ({
                                ...prev,
                                vestingId: vestingId,
                              }));
                              setMode("claim");
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
                          >
                            Switch to claim mode
                          </button>
                        </div>
                      </div>
                    )}

                    {createDigest && (
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Create Transaction ID:
                          </span>
                          <button
                            onClick={() => copyToClipboard(createDigest)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                            title="Copy transaction ID"
                          >
                            <Copy className="w-3 h-3" />
                            {copied ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 break-all mb-2">
                          {createDigest}
                        </div>
                        <a
                          href={`https://suiscan.xyz/devnet/tx/${createDigest}`}
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

            {isSuccess && mode === "claim" && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="font-medium">{successMessage}</span>
                    </div>

                    {claimDigest && (
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Claim Transaction ID:
                          </span>
                          <button
                            onClick={() => copyToClipboard(claimDigest)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                            title="Copy transaction ID"
                          >
                            <Copy className="w-3 h-3" />
                            {copied ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 break-all mb-2">
                          {claimDigest}
                        </div>
                        <a
                          href={`https://suiscan.xyz/devnet/tx/${claimDigest}`}
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
                // CREATE VESTING FORM
                <div className="space-y-4 md:space-y-6">
                  {/* Beneficiary Address */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Beneficiary Address
                    </label>
                    <div className="bg-background rounded-xl md:rounded-2xl p-3 md:p-4 border-border border">
                      <input
                        type="text"
                        value={vestingData.beneficiaryAddress}
                        onChange={(e) =>
                          handleVestingChange(
                            "beneficiaryAddress",
                            e.target.value
                          )
                        }
                        placeholder="0x0C2E8090a89A0af9"
                        className="w-full text-sm md:text-base bg-transparent outline-none"
                        disabled={isCreating}
                      />
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Amount
                    </label>
                    <div className="bg-background rounded-xl md:rounded-2xl p-3 md:p-4 border-border border">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={vestingData.amount}
                          onChange={(e) =>
                            handleVestingChange("amount", e.target.value)
                          }
                          placeholder="1000"
                          className="w-full text-sm md:text-base bg-transparent outline-none"
                          disabled={isCreating}
                        />
                        <span className="text-sm md:text-base text-muted-foreground">
                          Tokens
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cliff */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Cliff (in seconds)
                    </label>
                    <div className="bg-background rounded-xl md:rounded-2xl p-3 md:p-4 border-border border">
                      <div className="flex items-center gap-2">
                        <Hourglass className="w-4 h-4 text-muted-foreground" />
                        <input
                          type="number"
                          value={vestingData.cliff}
                          onChange={(e) =>
                            handleVestingChange("cliff", e.target.value)
                          }
                          placeholder="86400 (1 day)"
                          className="w-full text-sm md:text-base bg-transparent outline-none"
                          disabled={isCreating}
                        />
                      </div>
                    </div>
                    {vestingData.cliff &&
                      !isNaN(parseFloat(vestingData.cliff)) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ≈ {formatTime(parseFloat(vestingData.cliff))}
                        </p>
                      )}
                  </div>

                  {/* Release Rate */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Release Rate (tokens per second)
                    </label>
                    <div className="bg-background rounded-xl md:rounded-2xl p-3 md:p-4 border-border border">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                        <input
                          type="number"
                          value={vestingData.releaseRate}
                          onChange={(e) =>
                            handleVestingChange("releaseRate", e.target.value)
                          }
                          placeholder="0.01"
                          className="w-full text-sm md:text-base bg-transparent outline-none"
                          disabled={isCreating}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Period */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Period (in seconds)
                    </label>
                    <div className="bg-background rounded-xl md:rounded-2xl p-3 md:p-4 border-border border">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <input
                          type="number"
                          value={vestingData.period}
                          onChange={(e) =>
                            handleVestingChange("period", e.target.value)
                          }
                          placeholder="2592000 (30 days)"
                          className="w-full text-sm md:text-base bg-transparent outline-none"
                          disabled={isCreating}
                        />
                      </div>
                    </div>
                    {vestingData.period &&
                      !isNaN(parseFloat(vestingData.period)) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ≈ {formatTime(parseFloat(vestingData.period))}
                        </p>
                      )}
                  </div>
                </div>
              ) : (
                // CLAIM TOKENS FORM
                <div className="space-y-4 md:space-y-6">
                  {/* Vesting ID */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Vesting ID
                    </label>
                    <div className="bg-background rounded-xl md:rounded-2xl p-3 md:p-4 border-border border">
                      <div className="flex items-center gap-2">
                        <Hourglass className="w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={claimData.vestingId}
                          onChange={(e) =>
                            handleClaimChange("vestingId", e.target.value)
                          }
                          placeholder="0x189c51d794cdd150e7b40e7bf837d4455c59298d7c252c66457b3e9358640683"
                          className="w-full text-sm md:text-base bg-transparent outline-none"
                          disabled={isClaiming}
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
                    isCreating || isClaiming
                      ? "opacity-75 cursor-not-allowed"
                      : "hover:bg-primary/90"
                  )}
                  onClick={handleSubmit}
                  disabled={isCreating || isClaiming}
                >
                  {isCreating || isClaiming ? (
                    <>
                      <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                      {mode === "create"
                        ? "Creating Vesting Schedule..."
                        : "Claiming Tokens..."}
                    </>
                  ) : (
                    <>
                      {mode === "create" ? (
                        <>
                          <ArrowUpFromLine className="w-4 h-4" />
                          Create Vesting Schedule
                        </>
                      ) : (
                        <>
                          <ArrowDownToLine className="w-4 h-4" />
                          Claim Tokens
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
            {/* Top Info Card - Vesting Schedule Summary */}
            <div className=" rounded-[20px] md:rounded-[35px] border p-6 md:p-8 relative overflow-hidden">
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

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-sm text- mb-1 md:mb-2">
                      Vesting Schedule
                    </p>
                    <p className="text-xl md:text-2xl font-medium">Summary</p>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center">
                    <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
                  </div>
                </div>

                <div className="space-y-4">
                  {unlockInfo ? (
                    <>
                      <div>
                        <p className="text-sm">Total Amount</p>
                        <p className="text-lg font-medium">
                          {unlockInfo.totalAmount} Tokens
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">Release Rate</p>
                        <p className="text-lg font-medium">
                          {unlockInfo.ratePerSecond} tokens/second
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">Vesting Duration</p>
                        <p className="text-lg font-medium">
                          {unlockInfo.formattedTime}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground italic">
                      Complete the form to see vesting schedule details
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

export default Vesting;
