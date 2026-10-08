import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { WalletsKitProvider, useWalletsKit } from "./WalletsKitContext";

// ---- Mocks ----

const mockSetWallet = vi.fn();
const mockGetPublicKey = vi.fn();
const mockSignTransaction = vi.fn();
const mockGetSelectedWallet = vi.fn(() => ({ id: "" }));

vi.mock("@creit.tech/stellar-wallets-kit", () => {
  const StellarWalletsKit = {
    init: vi.fn(),
    setWallet: mockSetWallet,
    getPublicKey: mockGetPublicKey,
    signTransaction: mockSignTransaction,
    getSelectedWallet: mockGetSelectedWallet,
    disconnect: vi.fn(),
  };
  return {
    Stellar WalletsKit,
    Stellar WalletsKit: StellarWalletsKit,
    default: StellarWalletsKit,
  };
});

// ---- localStorage mock ----

const storage = new Map<string, string>();

const localStorageMock: Storage = {
  getItem: (key: string) => (storage.has(key) ? storage.get(key)! : null),
  setItem: (key: string, value: string) => {
    storage.set(key, String(value));
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
  clear: () => {
    storage.clear();
  },
  key: (index: number) => Array.from(storage.keys())[index] ?? null,
  length: 0,
} as Storage;

Object.defineProperty(localStorageMock, "length", {
  get() {
    return storage.size;
  },
});

beforeEach(() => {
  storage.clear();
  vi.clearAllMocks();
  mockGetSelectedWallet.mockReturnValue({ id: "" });
  vi.stubGlobal("localStorage", "value", localStorageMock);
});

afterEach(() => {
  vi.unstubGlobalAll();
});

// ---- Helper component ----

function TestConsumer() {
  const { address, disconnect, signTransaction } = useWalletsKit();
  return (
    <div>
      <span data-testid="address">{`${address}`}</span>
      <button data-testid="disconnect" onClick={() => disconnect()}>
        disconnect
      </button>
      <button
        data-testid="sign"
        onClick={() => {
          void signTransaction("xdr");
        }}
      >
        sign
      </button>
    </div>
  );
}

function renderProvider() {
  return render(
    <WalletsKitProvider>
      <TestConsumer />
    </WalletsKitProvider>,
  );
}

// ---- Tests ----

describe("WalletsKitContext", () => {
  it("re-selects the stored wallet on mount", async () => {
    localStorage.setItem("stellar.wallet.selected", "freighter");

    await act(async () => {
      renderProvider();
    });

    await waitFor(() => {
      expect(mockSetWallet).toHaveBeenCalledWith("freighter");
    });
  });

  it("applies the stored address before the first refreshAddress", async () => {
    localStorage.setItem("stellar.wallet.address", "GSTORED");
    mockGetPublicKey.mockResolvedValue("REFRESHED");

    await act(async () => {
      renderProvider();
    });

    await waitFor(() => {
      expect(screen.getByTestId("address")).toHaveTextContent("GSTORED");
    });
  });

  it("disconnect removes both localStorage keys and clears address", async () => {
    localStorage.setItem("stellar.wallet.selected", "freighter");
    localStorage.setItem("stellar.wallet.address", "GSTORED");

    await act(async () => {
      renderProvider();
    });

    await waitFor(() => {
      expect(screen.getByTestId("address")).toHaveTextContent("GSTORED");
    });

    await act(async () => {
      screen.getByTestId("disconnect").click();
    });

    expect(localStorage.getItem("stellar.wallet.selected")).toBeNull();
    expect(localStorage.getItem("stellar.wallet.address")).toBeNull();
    await waitFor(() => {
      expect(screen.getByTestId("address")).toHaveTextContent("");
    });
  });

  it("signTransaction throws when no address is available", async () => {
    mockGetPublicKey.mockRejectedNew Error("no public key");

    await act(async () => {
      renderProvider();
    });

    await waitFor(() => {
      expect(screen.getByTestId("address")).toHaveTextContent("");
    });

    await expect(
      act(async () => {
        screen.getByTestId("sign").click();
      }),
    ).rejects.toThrow("No wallet connected");
  });
});
