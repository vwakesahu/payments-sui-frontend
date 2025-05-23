import { useState } from "react";
import {
  useCurrentAccount,
  useSignTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

export const useClaimVesting = () => {
  const account = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const suiClient = useSuiClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactionDigest, setTransactionDigest] = useState("");

  const claimVesting = async (vestingId) => {
    try {
      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      if (!vestingId) {
        throw new Error("Please provide a vesting ID");
      }

      if (!vestingId.startsWith("0x")) {
        throw new Error("Invalid vesting ID format");
      }

      console.log("=== CLAIMING VESTED TOKENS ===");
      const tx = new Transaction();

      // Call the entry_claim function
      tx.moveCall({
        target: `0x3ef6a1a8b7d283ab502135e8a81629ba05f1fab7a020eb996b3bc6847827d559::linear_vesting::entry_claim`,
        typeArguments: ["0x2::sui::SUI"],
        arguments: [
          tx.object(vestingId),
          tx.object("0x6"), // Clock object
        ],
      });

      console.log("Signing claim transaction...");

      const { bytes, signature, reportTransactionEffects } =
        await signTransaction({
          transaction: tx,
        });

      console.log("Executing claim transaction...");

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

      console.log("SUCCESS: Claim transaction completed:", result);

      // Store transaction digest
      if (result.digest) {
        setTransactionDigest(result.digest);
      }

      return result;
    } catch (error) {
      console.error("Claim transaction failed:", error);
      throw error;
    }
  };

  return {
    claimVesting,
    isLoading,
    error,
    transactionDigest,
    setError,
    setIsLoading,
  };
};
