import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/common/StatusBadge";

describe("StatusBadge", () => {
  it("renders the alarm label", () => {
    render(<StatusBadge status="alarm" />);
    expect(screen.getByText("Alarm")).toBeInTheDocument();
  });

  it("renders the normal label", () => {
    render(<StatusBadge status="normal" />);
    expect(screen.getByText("Normal")).toBeInTheDocument();
  });
});
