import { useState } from "react";
import {
  useCurrentAccount,
  useSignTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

export const useCreateStream = () => {
  const account = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const suiClient = useSuiClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactionDigest, setTransactionDigest] = useState("");
  const [streamId, setStreamId] = useState("");

  const createStream = async (streamData) => {
    try {
      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Validate form inputs
      if (
        !streamData.recipientAddress ||
        !streamData.amountPerSecond ||
        !streamData.topupBalance
      ) {
        throw new Error("Please fill all fields");
      }

      if (!streamData.recipientAddress.startsWith("0x")) {
        throw new Error("Invalid recipient address format");
      }

      console.log("=== CREATING STREAM FROM FORM VALUES ===");
      const tx = new Transaction();

      // Parse and validate form inputs
      const amountPerSecondNum = parseFloat(streamData.amountPerSecond);
      const topupBalanceNum = parseFloat(streamData.topupBalance);

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
        throw new Error(
          "Amount per second cannot be greater than total balance"
        );
      }

      // Calculate duration (ensuring integer result)
      const durationInSeconds = Math.floor(
        topupBalanceInMist / amountPerSecondInMist
      );
      if (durationInSeconds <= 0) {
        throw new Error("Stream duration is too short");
      }

      // Get current time and calculate end time (both integers)
      const currentTime = Math.floor(Date.now() / 1000);
      const endTime = currentTime + durationInSeconds;

      console.log("Form-based transaction values:", {
        recipient: streamData.recipientAddress,
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
          tx.pure.address(streamData.recipientAddress),
          tx.pure.u64(currentTime),
          tx.pure.u64(endTime),
          tx.object("0x6"),
        ],
      });

      console.log("Signing form-based transaction...");

      const { bytes, signature, reportTransactionEffects } =
        await signTransaction({
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

      // Extract the created stream object ID from the transaction effects
      let createdStreamId = "";

      // Check object changes first
      if (result.objectChanges) {
        for (const change of result.objectChanges) {
          if (
            change.type === "created" &&
            change.objectType &&
            change.objectType.includes("streaming::Stream")
          ) {
            createdStreamId = change.objectId;
            console.log(
              "Found created stream ID in object changes:",
              createdStreamId
            );
            break;
          }
        }
      }

      // If not found in object changes, check created objects
      if (!createdStreamId && result.effects?.created) {
        for (const created of result.effects.created) {
          if (
            created.reference &&
            created.reference.objectType &&
            created.reference.objectType.includes("streaming::Stream")
          ) {
            createdStreamId = created.reference.objectId;
            console.log(
              "Found created stream ID in created objects:",
              createdStreamId
            );
            break;
          }
        }
      }

      // If still not found, try to find it in the raw effects
      if (!createdStreamId && result.rawEffects) {
        // Log the raw effects for debugging
        console.log("Raw effects:", result.rawEffects);
      }

      if (createdStreamId) {
        setStreamId(createdStreamId);
        console.log("Set stream ID to:", createdStreamId);
      } else {
        console.warn("Could not find stream ID in transaction effects");
        // Log the full result for debugging
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
        streamId: createdStreamId,
      };
    } catch (error) {
      console.error("Form-based transaction failed:", error);
      throw error;
    }
  };

  return {
    createStream,
    isLoading,
    error,
    transactionDigest,
    streamId,
    setError,
    setIsLoading,
  };
};
