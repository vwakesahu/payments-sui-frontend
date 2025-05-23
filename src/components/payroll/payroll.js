import React, { useState } from "react";
import { Plus, Trash2, Loader2, Copy, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCreatePayroll } from "@/hooks/useCreatePayroll";

const Payroll = () => {
  const [mode, setMode] = useState("single");
  const [distributions, setDistributions] = useState([
    {
      id: 1,
      address:
        "0xf66ebd40671196ec784ac4d547563403986bbd33cfa3cdb28a17000bef3b4c0e",
      amount: "1",
    },
  ]);

  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const {
    createPayroll,
    addEmployee,
    processPayment,
    isLoading,
    error: createError,
    transactionDigest,
    payrollId,
    setError: setCreateError,
    setIsLoading,
  } = useCreatePayroll();

  const totalAmount = distributions.reduce((sum, dist) => {
    const amount = parseFloat(dist.amount) || 0;
    return sum + amount;
  }, 0);

  const handleModeToggle = (newMode) => {
    setMode(newMode);
    if (newMode === "single") {
      setDistributions([
        {
          id: 1,
          address:
            "0xf66ebd40671196ec784ac4d547563403986bbd33cfa3cdb28a17000bef3b4c0e",
          amount: "1",
        },
      ]);
    }
    setError("");
    setCreateError("");
    setIsSuccess(false);
    setSuccessMessage("");
  };

  const handleDistributionChange = (id, field, value) => {
    setDistributions((prevDist) =>
      prevDist.map((dist) =>
        dist.id === id ? { ...dist, [field]: value } : dist
      )
    );
    setError("");
    setCreateError("");
    setIsSuccess(false);
    setSuccessMessage("");
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
    try {
      setIsLoading(true);
      setError("");
      setCreateError("");
      setIsSuccess(false);
      setSuccessMessage("");

      // First create a new payroll contract
      const result = await createPayroll();

      if (!result.payrollId) {
        throw new Error("Failed to create payroll contract");
      }

      // Then add each employee
      for (const dist of distributions) {
        const amountInMist = Math.floor(parseFloat(dist.amount) * 1e9);
        await addEmployee(result.payrollId, dist.address, amountInMist);
      }

      // Finally process payment for each employee
      for (const dist of distributions) {
        await processPayment(result.payrollId, dist.address);
      }

      setIsSuccess(true);
      setSuccessMessage(
        "Payroll created, employees added, and payments processed successfully!"
      );
    } catch (err) {
      setError(err.message);
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
                    mode === "single"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
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
            {(error || createError) && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error || createError}</AlertDescription>
              </Alert>
            )}

            {isSuccess && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="font-medium">{successMessage}</span>
                    </div>

                    {payrollId && (
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Payroll ID:
                          </span>
                          <button
                            onClick={() => copyToClipboard(payrollId)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                            title="Copy payroll ID"
                          >
                            <Copy className="w-3 h-3" />
                            {copied ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 break-all mb-2">
                          {payrollId}
                        </div>
                      </div>
                    )}
                  </div>
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
                              Employee Address
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
                    <span>Add Employee</span>
                  </button>
                )}
              </div>

              <div className="mt-6 md:mt-8">
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-medium">
                    {totalAmount.toFixed(2)} SUI
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
                      Processing Payroll...
                    </>
                  ) : (
                    "Process Payroll"
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
                  <p className="text-2xl md:text-3xl font-medium">
                    {totalAmount.toFixed(2)} SUI
                  </p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-base md:text-lg">
                    ↑
                  </span>
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
                  <span className="text-foreground text-base md:text-lg">
                    $
                  </span>
                </div>
                <div>
                  <p className="mb-2 md:mb-3 text-primary-foreground">
                    Average Distribution
                  </p>
                  <div className="text-4xl md:text-5xl font-medium text-primary-foreground">
                    {(totalAmount / distributions.length).toFixed(2)} SUI
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
