import { useState } from "react";
import {
  useCurrentAccount,
  useSignTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

export const useCreateVesting = () => {
  const account = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const suiClient = useSuiClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactionDigest, setTransactionDigest] = useState("");
  const [vestingId, setVestingId] = useState("");

  const createVesting = async (vestingData) => {
    try {
      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Validate form inputs
      if (
        !vestingData.beneficiaryAddress ||
        !vestingData.amount ||
        !vestingData.cliff ||
        !vestingData.releaseRate ||
        !vestingData.period
      ) {
        throw new Error("Please fill all fields");
      }

      if (!vestingData.beneficiaryAddress.startsWith("0x")) {
        throw new Error("Invalid beneficiary address format");
      }

      console.log("=== CREATING VESTING SCHEDULE ===");
      const tx = new Transaction();

      // Parse and validate form inputs
      const amountNum = parseFloat(vestingData.amount);
      const cliffNum = parseFloat(vestingData.cliff);
      const releaseRateNum = parseFloat(vestingData.releaseRate);
      const periodNum = parseFloat(vestingData.period);

      if (
        isNaN(amountNum) ||
        isNaN(cliffNum) ||
        isNaN(releaseRateNum) ||
        isNaN(periodNum)
      ) {
        throw new Error("Invalid number values");
      }

      if (
        amountNum <= 0 ||
        cliffNum < 0 ||
        releaseRateNum <= 0 ||
        periodNum <= 0
      ) {
        throw new Error("Amounts must be greater than 0");
      }

      // Convert to MIST (smallest unit) and ensure integers
      const amountInMist = Math.floor(amountNum * 1e9);
      const cliffInSeconds = Math.floor(cliffNum);
      const periodInSeconds = Math.floor(periodNum);

      // Get current time and calculate start time
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = currentTime + cliffInSeconds;

      console.log("Vesting schedule values:", {
        beneficiary: vestingData.beneficiaryAddress,
        amountInMist,
        startTime,
        periodInSeconds,
      });

      // Create coin with the vesting amount
      const [coin] = tx.splitCoins(tx.gas, [amountInMist]);

      // Call the entry_new function
      tx.moveCall({
        target: `0x3ef6a1a8b7d283ab502135e8a81629ba05f1fab7a020eb996b3bc6847827d559::linear_vesting::entry_new`,
        typeArguments: ["0x2::sui::SUI"],
        arguments: [
          coin,
          tx.object("0x6"), // Clock object
          tx.pure.u64(startTime),
          tx.pure.u64(periodInSeconds),
          tx.pure.address(vestingData.beneficiaryAddress),
        ],
      });

      console.log("Signing vesting transaction...");

      const { bytes, signature, reportTransactionEffects } =
        await signTransaction({
          transaction: tx,
        });

      console.log("Executing vesting transaction...");

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

      console.log("SUCCESS: Vesting transaction completed:", result);

      // Extract the created vesting wallet ID from the transaction effects
      let createdVestingId = "";

      // Check object changes first
      if (result.objectChanges) {
        for (const change of result.objectChanges) {
          if (
            change.type === "created" &&
            change.objectType &&
            change.objectType.includes("linear_vesting::Wallet")
          ) {
            createdVestingId = change.objectId;
            console.log(
              "Found created vesting ID in object changes:",
              createdVestingId
            );
            break;
          }
        }
      }

      if (createdVestingId) {
        setVestingId(createdVestingId);
      } else {
        console.warn("Could not find vesting ID in transaction effects");
        console.log(
          "Full transaction result:",
          JSON.stringify(result, null, 2)
        );
      }

      // Store transaction digest
      if (result.digest) {
        setTransactionDigest(result.digest);
      }

      return {
        ...result,
        vestingId: createdVestingId,
      };
    } catch (error) {
      console.error("Vesting transaction failed:", error);
      throw error;
    }
  };

  return {
    createVesting,
    isLoading,
    error,
    transactionDigest,
    vestingId,
    setError,
    setIsLoading,
  };
};
