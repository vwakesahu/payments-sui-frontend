import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  HeartHandshake,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const Payroll = () => {
  const [mode, setMode] = useState("single");
  const [distributions, setDistributions] = useState([
    {
      id: 1,
      address: "0xfCefe53c7012a075b8a711df391100d9c431c468",
      amount: "300",
    },
  ]);

  const [lockTime, setLockTime] = useState();
  const [dilute, setDilute] = useState();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const today = new Date();

  // Add this function to determine if a date should be disabled
  const disabledDays = (date) => {
    // Create a new date object set to the beginning of today
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    // Return true for dates that are before today (making them disabled)
    // This allows the current date to be selectable
    return date < startOfToday;
  };

  const totalAmount = distributions.reduce((sum, dist) => {
    const amount = parseFloat(dist.amount) || 0;
    return sum + amount;
  }, 0);

  const handleModeToggle = (newMode) => {
    setMode(newMode);
    if (newMode === "single") {
      setDistributions([{ id: 1, address: "", amount: "" }]);
    }
  };

  const handleDistributionChange = (id, field, value) => {
    setDistributions((prevDist) =>
      prevDist.map((dist) =>
        dist.id === id ? { ...dist, [field]: value } : dist
      )
    );
    setError("");
    setIsSuccess(false);
  };

  const handleAddDistribution = () => {
    if (mode === "multiple") {
      const newId = Math.max(...distributions.map((d) => d.id)) + 1;
      setDistributions([
        ...distributions,
        { id: newId, address: "", amount: "" },
      ]);
    }
  };

  const handleRemoveDistribution = (id) => {
    if (distributions.length > 1) {
      setDistributions((prevDist) => prevDist.filter((dist) => dist.id !== id));
    }
  };

  const handleSubmit = async () => {
    // Placeholder for submit functionality
    try {
      setIsLoading(true);
      setError("");
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
    } catch (err) {
      setError("Failed to process distribution");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
    
      <div className="mt-6 md:mt-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-8">
          {/* Left Panel - Distribution Form */}
          <div className="w-full md:col-span-7 rounded-[20px] md:rounded-[35px] p-4 md:p-8 flex flex-col border bg-muted/30">
            {/* Title & Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4 sm:gap-0">
              <h2 className="text-xl md:text-2xl font-medium">Payroll</h2>
              <div className="w-full sm:w-auto bg-background rounded-full inline-flex border">
                <button
                  className={cn(
                    "flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-3 text-sm rounded-full transition-all",
                    mode === "single" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}
                  onClick={() => handleModeToggle("single")}
                  disabled={isLoading}
                >
                  Single
                </button>
                <button
                  className={cn(
                    "flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-3 text-sm rounded-full transition-all",
                    mode === "multiple"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                  onClick={() => handleModeToggle("multiple")}
                  disabled={isLoading}
                >
                  Multiple
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
                  Distribution processed successfully!
                </AlertDescription>
              </Alert>
            )}

            {/* Form Content */}
            <div className="flex-1 flex flex-col">
              <div className="space-y-4 md:space-y-6">
                {distributions.map((dist) => (
                  <div
                    key={dist.id}
                    className="flex gap-3 md:gap-4 items-start group"
                  >
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                        <div className="flex-1 sm:flex-[2]">
                          {dist.id === 1 && (
                            <label className="block text-sm text-muted-foreground mb-2">
                              Recipient Address
                            </label>
                          )}
                          <div className="bg-background rounded-xl md:rounded-2xl p-3 md:p-4 border-border border">
                            <input
                              type="text"
                              value={dist.address}
                              onChange={(e) =>
                                handleDistributionChange(
                                  dist.id,
                                  "address",
                                  e.target.value
                                )
                              }
                              placeholder="0x0C2E8090a89A0af9"
                              className="w-full text-sm md:text-base bg-transparent outline-none"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          {dist.id === 1 && (
                            <label className="block text-sm text-muted-foreground mb-2">
                              Amount
                            </label>
                          )}
                          <div className="bg-background rounded-xl md:rounded-2xl p-3 md:p-4 border-border border">
                            <div className="flex items-center gap-2">
                              <span className="text-sm md:text-base text-muted-foreground">
                                $
                              </span>
                              <input
                                type="number"
                                value={dist.amount}
                                onChange={(e) =>
                                  handleDistributionChange(
                                    dist.id,
                                    "amount",
                                    e.target.value
                                  )
                                }
                                placeholder="300"
                                className="w-full text-sm md:text-base bg-transparent outline-none"
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {mode === "multiple" && (
                      <button
                        className={cn(
                          "p-2 text-muted-foreground hover:text-red-500 transition-all",
                          "sm:opacity-0 sm:group-hover:opacity-100",
                          dist.id === 1 ? "mt-8" : "mt-0 sm:mt-4"
                        )}
                        onClick={() => handleRemoveDistribution(dist.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Add More Button */}
                {mode === "multiple" && (
                  <button
                    className="flex items-center justify-center gap-2 w-full py-2 md:py-3 border-2 border-dashed border-border rounded-xl md:rounded-2xl text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleAddDistribution}
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Add Recipient</span>
                  </button>
                )}
              </div>

              {/* Time Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 md:mt-8">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Lock Time
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12 md:h-14 rounded-xl md:rounded-2xl",
                          !lockTime && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {lockTime ? (
                          format(lockTime, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={lockTime}
                        onSelect={setLockTime}
                        disabled={disabledDays}
                        initialFocus
                        fromDate={today}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Dilute
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12 md:h-14 rounded-xl md:rounded-2xl",
                          !dilute && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dilute ? (
                          format(dilute, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dilute}
                        disabled={disabledDays}
                        onSelect={setDilute}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="mt-6 md:mt-8">
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-medium">
                    {totalAmount.toFixed(2)} USDC
                  </span>
                </div>
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
                      Processing Distribution...
                    </>
                  ) : (
                    <>
                    Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Information Cards */}
          <div className="w-full md:col-span-5 grid grid-cols-1 md:grid-rows-2 gap-4 md:gap-8">
            {/* Top Info Card */}
            <div className="bg-background border rounded-[20px] md:rounded-[35px] p-6 md:p-8 relative overflow-hidden">
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
                    Total Distributed
                  </p>
                  <p className="text-2xl md:text-3xl font-medium">$5.2M</p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-base md:text-lg">↑</span>
                </div>
              </div>
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
                  <span className="text-foreground text-base md:text-lg">$</span>
                </div>
                <div>
                  <p className="mb-2 md:mb-3 text-primary-foreground">
                    Average Distribution
                  </p>
                  <div className="text-4xl md:text-5xl font-medium text-primary-foreground">
                    $847
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payroll;