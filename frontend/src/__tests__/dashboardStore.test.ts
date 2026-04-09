import { useDashboardStore } from "@/stores/dashboardStore";

describe("dashboardStore", () => {
  it("toggles sensors", () => {
    const initial = useDashboardStore.getState().selectedSensors;
    useDashboardStore.getState().toggleSensor("TT101");
    expect(useDashboardStore.getState().selectedSensors).not.toContain("TT101");
    useDashboardStore.getState().toggleSensor("TT101");
    expect(useDashboardStore.getState().selectedSensors).toContain("TT101");
    // restore
    useDashboardStore.setState({ selectedSensors: initial });
  });
});
