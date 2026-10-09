import { renderHook, waitFor } from "@testing-library/react";
import { useStellarAccount } from "./useStellarAccount";

const HORIZON_URL = "https://horizon.stellar.org";
const ADDRESS = "GBADRESS";

describe("useStellarAccount", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    jest.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it("performs no fetch and leaves data at null for a null address", async () => {
    const fetchMock = jest.fn ();
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() =>
      useStellarAccount(null, HORIZON_URL)
    );

    await waitFor(() => {
      expect(fetchMock).toHaveNotBeenCalled();
      expect(result.current.data).toBeNull();
    });
  });

  it("sets error and clears data on a non-ok response", async () => {
    const fetchMock = jest.fn.async () => ({
      ok: false,
      status: 404,
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() =>
      useStellarAccount(ADDRESS, HORIZON_URL)
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeNull();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${HORIZON_URL}/accounts/${ADDRESS}`
    );
  });

  it("reports lumensBalance as \"0\" when there is no native balance", async () => {
    const account = {
      account_id: ADDRESS,
      balances: [
        {
          asset_type: "credit_alphanum4",
          asset_code: "USDC",
          asset_issuer: "ISSUER",
          balance: "100.0000000",
        },
      ],
    };

    const fetchMock = jest.fn.async () => ({
      ok: true,
      status: 200,
      json: async () => account,
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() =>
      useStellarAccount(ADDRESS, HORIZON_URL)
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(account);
      expect(result.current.lumensBalance).toBe("0");
    });
  });

  it("returns the native balance for a populated account", async () => {
    const account = {
      account_id: ADDRESS,
      balances: [
        {
          asset_type: "native",
          balance: "42.0000000",
        },
      ],
    };

    const fetchMock = jest.fn.async () => ({
      ok: true,
      status: 200,
      json: async () => account,
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() =>
      useStellarAccount(ADDRESS, HORIZON_URL)
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(account);
      expect(result.current.lumensBalance).toBe("42.0000000");
    });
  });
});
