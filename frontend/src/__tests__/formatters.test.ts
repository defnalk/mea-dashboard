import { formatDuration, formatSensorValue } from "@/utils/formatters";

describe("formatters", () => {
  it("formatSensorValue prints two decimals and unit", () => {
    expect(formatSensorValue(85.234, "°C")).toBe("85.23 °C");
  });

  it("formatDuration handles hours and minutes", () => {
    expect(formatDuration(3700)).toBe("1h 1m");
    expect(formatDuration(120)).toBe("2m");
    expect(formatDuration(null)).toBe("—");
  });
});
