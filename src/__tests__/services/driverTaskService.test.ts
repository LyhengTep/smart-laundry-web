import { getDriverTaskWsUrl } from "@/services/driverTaskService";

describe("getDriverTaskWsUrl", () => {
  const originalDriverWs = process.env.NEXT_PUBLIC_DRIVER_WS_URL;
  const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  afterEach(() => {
    if (originalDriverWs === undefined) {
      delete process.env.NEXT_PUBLIC_DRIVER_WS_URL;
    } else {
      process.env.NEXT_PUBLIC_DRIVER_WS_URL = originalDriverWs;
    }

    if (originalApiBase === undefined) {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBase;
    }
  });

  it("uses NEXT_PUBLIC_DRIVER_WS_URL when provided", () => {
    process.env.NEXT_PUBLIC_DRIVER_WS_URL = "wss://example.com/ws";
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com/api/v1";

    expect(getDriverTaskWsUrl()).toBe("wss://example.com/ws");
  });

  it("derives websocket url from NEXT_PUBLIC_API_BASE_URL", () => {
    delete process.env.NEXT_PUBLIC_DRIVER_WS_URL;
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com/api/v1";

    expect(getDriverTaskWsUrl()).toBe("wss://api.example.com/api/v1/ws/testing");
  });

  it("returns localhost fallback when no env is set", () => {
    delete process.env.NEXT_PUBLIC_DRIVER_WS_URL;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;

    expect(getDriverTaskWsUrl()).toBe("ws://localhost:8000/api/v1/ws/testing");
  });
});
