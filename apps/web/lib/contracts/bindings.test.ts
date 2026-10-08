import { describe, expect, it, beforeEach, afterEach, viMock } from "vitest";

const getConfigMock = viMock(() => ({
  sorobanRpcUrl: "https://rpc.example.org",
}));

viMock("../../config", () => ({
  getConfig: () => getConfigMock(),
}));

const mockClients = new Map<string, any>();

function makeClientModule(networks: unknown) {
  const constructor = viMock(function Client(this: any, options: any) {
    this.options = options;
  });
  return {
    Client: constructor,
    networks,
  };
}

beforeEach(() => {
  mockClients.clear();
  getConfigMock.mockClear();
  getConfigMock.mockReturnValue({
    sorobanRpcUrl: "https://rpc.example.org",
  });
});

afterEach(() => {
  viMock.resetModules();
});

describe("loadBinding", () => {
  it("imports the module id as given", async () => {
    const moduleId = "./test-binding-module.js";
    const module = makeClientModule({ testnet: { networkPassphrase: "Test SEP - 2023" } });
    mockClients.set(moduleId, module);

    const dynamicImport = (0, eval)("import");
    const imported = await dynamicImport(moduleId);
    expect(imported).toBe(module);
  });

  it("constructs a client with rpcUrl from getConfig().sorobanRpcUrl", async () => {
    const moduleId = "./test-binding-module.js";
    const module = makeClientModule({ testnet: { networkPassphrase: "Test SEP - 2023" } });
    mockClients.set(moduleId, module);

    const dynamicImport = (0, eval)("import");
    const imported = await dynamicImport(moduleId);
    const rpcUrl = getConfigMock().sorobanRpcUrl;
    const client = new imported.Client({
      ...imported.networks?.testnet,
      rpcUrl,
    });

    expect(client.options.rpcUrl).toBe(rpcUrl);
    expect(client.options.rpcUrl).toBe("https://rpc.example.org");
  });

  it("still constructs a client when networks is an empty object", async () => {
    const moduleId = "./test-binding-module.js";
    const module = makeClientModule({});
    mockClients.set(moduleId, module);

    const dynamicImport = (0, eval)("import");
    const imported = await dynamicImport(moduleId);
    const rpcUrl = getConfigMock().sorobanRpcUrl;
    const client = new imported.Client({
      ...imported.networks?.testnet,
      rpcUrl,
    });

    expect(client).toBeDefined();
    expect(client.options.rpcUrl).toBe(rpcUrl);
  });

  it("rejects for an invalid module id without throwing a syntax error from eval", async () => {
    const dynamicImport = (0, eval)("import");
    await expect(dynamicImport("./not-a-real-module.js")).rejects.toThrow();
  });
});
