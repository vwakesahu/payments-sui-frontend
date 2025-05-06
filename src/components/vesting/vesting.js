import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  BarChart3,
  Hourglass,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import HeroHeader from "../HeroHeader";

const Vesting = () => {
  const [vestingData, setVestingData] = useState({
    beneficiaryAddress: "",
    amount: "",
    cliff: "",
    releaseRate: "",
    period: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleVestingChange = (field, value) => {
    setVestingData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
    setIsSuccess(false);
  };

  const handleSubmit = async () => {
    // Form validation
    if (!vestingData.beneficiaryAddress || 
        !vestingData.amount || 
        !vestingData.cliff || 
        !vestingData.releaseRate ||
        !vestingData.period) {
      setError("Please fill all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
    } catch (err) {
      setError("Failed to create vesting schedule");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to convert seconds to human-readable format
  const formatTime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    let result = "";
    if (days > 0) result += `${days} day${days > 1 ? 's' : ''} `;
    if (hours > 0) result += `${hours} hour${hours > 1 ? 's' : ''} `;
    if (minutes > 0) result += `${minutes} minute${minutes > 1 ? 's' : ''}`;
    
    return result.trim() || `${seconds} seconds`;
  };

  // Calculate estimated unlock based on input data
  const calculateUnlock = () => {
    if (!vestingData.amount || !vestingData.releaseRate || !vestingData.period) {
      return null;
    }
    
    const amount = parseFloat(vestingData.amount);
    const releaseRate = parseFloat(vestingData.releaseRate);
    const period = parseFloat(vestingData.period);
    
    if (isNaN(amount) || isNaN(releaseRate) || isNaN(period) || releaseRate === 0) {
      return null;
    }
    
    return {
      totalTime: period,
      formattedTime: formatTime(period),
      totalAmount: amount,
      ratePerSecond: releaseRate
    };
  };

  const unlockInfo = calculateUnlock();

  return (
    <div>
      <HeroHeader />
      <div className="mt-6 md:mt-10 max-w-7xl px-4 pb-10 md:pb-0 mx-auto md:px-8">
        <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-8">
          {/* Left Panel - Vesting Form */}
          <div className="w-full md:col-span-7 bg-background rounded-[20px] md:rounded-[35px] p-4 md:p-8 flex flex-col">
            {/* Title */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-medium">Token Vesting</h2>
              <p className="text-muted-foreground mt-2">Create a new token vesting schedule</p>
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
                  Vesting schedule created successfully!
                </AlertDescription>
              </Alert>
            )}

            {/* Form Content */}
            <div className="flex-1 flex flex-col">
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
                        handleVestingChange("beneficiaryAddress", e.target.value)
                      }
                      placeholder="0x0C2E8090a89A0af9"
                      className="w-full text-sm md:text-base bg-transparent outline-none"
                      disabled={isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  {vestingData.cliff && !isNaN(parseFloat(vestingData.cliff)) && (
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
                        disabled={isLoading}
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
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  {vestingData.period && !isNaN(parseFloat(vestingData.period)) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ≈ {formatTime(parseFloat(vestingData.period))}
                    </p>
                  )}
                </div>
              </div>

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
                      Creating Vesting Schedule...
                    </>
                  ) : (
                    "Create Vesting Schedule"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Information Cards */}
          <div className="w-full md:col-span-5 grid grid-cols-1 md:grid-rows-2 gap-4 md:gap-8">
            {/* Top Info Card - Vesting Schedule Summary */}
            <div className=" rounded-[20px] md:rounded-[35px] p-6 md:p-8 relative overflow-hidden">
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
                        <p className="text-lg font-medium">{unlockInfo.totalAmount} Tokens</p>
                      </div>
                      <div>
                        <p className="text-sm">Release Rate</p>
                        <p className="text-lg font-medium">{unlockInfo.ratePerSecond} tokens/second</p>
                      </div>
                      <div>
                        <p className="text-sm">Vesting Duration</p>
                        <p className="text-lg font-medium">{unlockInfo.formattedTime}</p>
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