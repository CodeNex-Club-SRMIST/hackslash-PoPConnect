"use client";

import React, { useEffect, useState } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  useConnectModal,
} from "@rainbow-me/rainbowkit";
import { createConfig, WagmiConfig, useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../services/firebase";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { saveDIDToFirestore } from "../wallet/did";

const chains: [typeof sepolia] = [sepolia];

const { connectors } = getDefaultWallets({
  appName: "HomieFinder",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
});

export const wagmiConfig = createConfig({
  connectors,
  chains,
} as any);

const queryClient = new QueryClient();

function WalletConnectTrigger() {
  const { openConnectModal } = useConnectModal();
  const { address } = useAccount();
  const [didSaved, setDidSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        if (!didSaved && address) {
          await saveDIDToFirestore(user.uid, address);
          setDidSaved(true);
        }
        if (openConnectModal) {
          openConnectModal();
        }
      }
    });
    return () => unsubscribe();
  }, [didSaved, openConnectModal, address]);

  return null;
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#22d3ee",
            accentColorForeground: "#0a0f2c",
          })}
        >
          <WalletConnectTrigger />
          {children}
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}
