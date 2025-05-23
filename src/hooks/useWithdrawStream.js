import { useState } from "react";
import {
  useCurrentAccount,
  useSignTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

export const useWithdrawStream = () => {
  const account = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const suiClient = useSuiClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactionDigest, setTransactionDigest] = useState("");

  const withdrawFromStream = async (streamId) => {
    try {
      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      if (!streamId) {
        throw new Error("Stream ID is required");
      }

      if (!streamId.startsWith("0x")) {
        throw new Error("Invalid stream ID format");
      }

      // First, verify the stream exists and check ownership
      try {
        const streamObject = await suiClient.getObject({
          id: streamId,
          options: {
            showContent: true,
            showOwner: true,
          },
        });

        if (!streamObject.data) {
          throw new Error("Stream not found");
        }

        // Check if the user is the recipient of the stream
        const streamContent = streamObject.data.content;
        if (streamContent.fields.recipient !== account.address) {
          throw new Error("You are not the recipient of this stream");
        }
      } catch (err) {
        if (err.message.includes("not found")) {
          throw new Error("Stream not found");
        }
        if (err.message.includes("owned by account")) {
          throw new Error("You are not the recipient of this stream");
        }
        throw err;
      }

      console.log("=== WITHDRAWING FROM STREAM ===");
      const tx = new Transaction();

      // Assign stream object
      tx.moveCall({
        target: `0xdebe630104899d2488485b82e953b02a4e8d95775f152dbd6fd6e7b91eb9ba8e::streaming::withdraw_entry`,
        typeArguments: ["0x2::sui::SUI"],
        arguments: [
          tx.object(streamId), // stream object
          tx.object("0x6"), // clock object
        ],
      });

      console.log("Signing withdrawal transaction...");

      const { bytes, signature, reportTransactionEffects } =
        await signTransaction({
          transaction: tx,
          options: {
            gasBudget: 20000000, // 0.02 SUI
          },
        });

      console.log("Executing withdrawal transaction...");

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

      console.log("SUCCESS: Withdrawal transaction completed:", result);

      // Store transaction digest
      if (result.digest) {
        setTransactionDigest(result.digest);
      }

      return result;
    } catch (error) {
      console.error("Withdrawal transaction failed:", error);
      throw error;
    }
  };

  return {
    withdrawFromStream,
    isLoading,
    error,
    transactionDigest,
    setError,
    setIsLoading,
  };
};
