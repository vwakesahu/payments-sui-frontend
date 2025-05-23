import { useState } from "react";
import {
  useCurrentAccount,
  useSignTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

export const useCreatePayroll = () => {
  const account = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const suiClient = useSuiClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactionDigest, setTransactionDigest] = useState("");
  const [payrollId, setPayrollId] = useState("");

  const createPayroll = async () => {
    try {
      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      console.log("=== CREATING PAYROLL ===");

      const tx = new Transaction();

      // Split coins first (5 SUI)
      const [coins] = tx.splitCoins(tx.gas, [5000000000]);

      // Call the create_payroll function with the split coins
      tx.moveCall({
        target: `0x52b1773c371bf9003e7371426e519b17c9669cc310d138ace649785a977fd17e::payroll::create_payroll`,
        typeArguments: ["0x2::sui::SUI"],
        arguments: [coins, tx.pure.u64(2592000000)], // 30 days in seconds
      });

      console.log("Signing create payroll transaction...");

      const { bytes, signature, reportTransactionEffects } =
        await signTransaction({
          transaction: tx,
        });

      console.log("Executing create payroll transaction...");

      const result = await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showRawEffects: true,
        },
        gasBudget: 20000000, // 0.02 SUI gas budget
      });

      if (reportTransactionEffects && result.rawEffects) {
        await reportTransactionEffects(result.rawEffects);
      }

      console.log("SUCCESS: Create payroll transaction completed:", result);

      // Extract the created payroll object ID from the transaction effects
      let createdPayrollId = "";

      // Check object changes first
      if (result.objectChanges) {
        for (const change of result.objectChanges) {
          if (
            change.type === "created" &&
            change.objectType &&
            change.objectType.includes("payroll::Payroll")
          ) {
            createdPayrollId = change.objectId;
            console.log(
              "Found created payroll ID in object changes:",
              createdPayrollId
            );
            break;
          }
        }
      }

      if (createdPayrollId) {
        setPayrollId(createdPayrollId);
        console.log("Set payroll ID to:", createdPayrollId);
      } else {
        console.warn("Could not find payroll ID in transaction effects");
      }

      // Store transaction digest
      if (result.digest) {
        setTransactionDigest(result.digest);
      }

      return {
        ...result,
        payrollId: createdPayrollId,
      };
    } catch (error) {
      console.error("Create payroll transaction failed:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      throw error;
    }
  };

  const addEmployee = async (payrollId, employeeAddress, amount) => {
    try {
      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      console.log("=== ADDING EMPLOYEE ===");
      console.log("Payroll ID:", payrollId);
      console.log("Employee Address:", employeeAddress);
      console.log("Amount:", amount);

      const tx = new Transaction();

      // Call the add_employee_entry function
      tx.moveCall({
        target: `0x52b1773c371bf9003e7371426e519b17c9669cc310d138ace649785a977fd17e::payroll::add_employee_entry`,
        typeArguments: ["0x2::sui::SUI"],
        arguments: [
          tx.object(payrollId),
          tx.pure.u64(amount),
          tx.pure.address(employeeAddress),
        ],
      });

      console.log("Signing add employee transaction...");

      const { bytes, signature, reportTransactionEffects } =
        await signTransaction({
          transaction: tx,
        });

      console.log("Executing add employee transaction...");

      const result = await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showRawEffects: true,
        },
        gasBudget: 20000000, // 0.02 SUI gas budget
      });

      if (reportTransactionEffects && result.rawEffects) {
        await reportTransactionEffects(result.rawEffects);
      }

      console.log("SUCCESS: Add employee transaction completed:", result);

      // Store transaction digest
      if (result.digest) {
        setTransactionDigest(result.digest);
      }

      return result;
    } catch (error) {
      console.error("Add employee transaction failed:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      throw error;
    }
  };

  const processPayment = async (payrollId, employeeAddress) => {
    try {
      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      console.log("=== PROCESSING PAYMENT ===");
      console.log("Payroll ID:", payrollId);
      console.log("Employee Address:", employeeAddress);

      const tx = new Transaction();

      // Call the process_payment_entry function
      tx.moveCall({
        target: `0x52b1773c371bf9003e7371426e519b17c9669cc310d138ace649785a977fd17e::payroll::process_payment_entry`,
        typeArguments: ["0x2::sui::SUI"],
        arguments: [
          tx.object(payrollId),
          tx.pure.address(employeeAddress),
          tx.object("0x6"), // Clock object
        ],
      });

      console.log("Signing process payment transaction...");

      const { bytes, signature, reportTransactionEffects } =
        await signTransaction({
          transaction: tx,
        });

      console.log("Executing process payment transaction...");

      const result = await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showRawEffects: true,
        },
        gasBudget: 20000000, // 0.02 SUI gas budget
      });

      if (reportTransactionEffects && result.rawEffects) {
        await reportTransactionEffects(result.rawEffects);
      }

      console.log("SUCCESS: Process payment transaction completed:", result);

      // Store transaction digest
      if (result.digest) {
        setTransactionDigest(result.digest);
      }

      return result;
    } catch (error) {
      console.error("Process payment transaction failed:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      throw error;
    }
  };

  const processAllPayments = async (payrollId) => {
    try {
      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      console.log("=== PROCESSING ALL PAYMENTS ===");
      console.log("Payroll ID:", payrollId);

      const tx = new Transaction();

      // Call the process_all_payments function
      tx.moveCall({
        target: `0x52b1773c371bf9003e7371426e519b17c9669cc310d138ace649785a977fd17e::payroll::process_all_payments`,
        typeArguments: ["0x2::sui::SUI"],
        arguments: [
          tx.object(payrollId),
          tx.object("0x6"), // Clock object
        ],
      });

      console.log("Signing process all payments transaction...");

      const { bytes, signature, reportTransactionEffects } =
        await signTransaction({
          transaction: tx,
        });

      console.log("Executing process all payments transaction...");

      const result = await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showRawEffects: true,
        },
        gasBudget: 20000000, // 0.02 SUI gas budget
      });

      if (reportTransactionEffects && result.rawEffects) {
        await reportTransactionEffects(result.rawEffects);
      }

      console.log(
        "SUCCESS: Process all payments transaction completed:",
        result
      );

      // Store transaction digest
      if (result.digest) {
        setTransactionDigest(result.digest);
      }

      return result;
    } catch (error) {
      console.error("Process all payments transaction failed:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      throw error;
    }
  };

  return {
    createPayroll,
    addEmployee,
    processPayment,
    processAllPayments,
    isLoading,
    error,
    transactionDigest,
    payrollId,
    setError,
    setIsLoading,
  };
};
