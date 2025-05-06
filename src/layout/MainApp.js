"use client";

const { default: Link } = require("next/link");

export function AppLayout({ children, disconnectWallet }) {
  return (
   <div>{children}</div>
  );
}