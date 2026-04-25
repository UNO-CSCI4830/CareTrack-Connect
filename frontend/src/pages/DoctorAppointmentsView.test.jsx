import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import DoctorAppointmentsView from "./DoctorAppointmentsView";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderComponent = () =>
  render(
    <MemoryRouter>
      <DoctorAppointmentsView />
    </MemoryRouter>
  );

describe("DoctorAppointmentsView", () => {
  beforeEach(() => mockNavigate.mockClear());

  it("renders the Appointments heading", () => {
    renderComponent();
    expect(screen.getByText("Appointments")).toBeInTheDocument();
  });

  it("renders all four mock appointments", () => {
    renderComponent();
    expect(screen.getAllByText("Alice Johnson")).toHaveLength(2);
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
    expect(screen.getByText("Carol White")).toBeInTheDocument();
  });

  it("displays the correct status chips for each appointment", () => {
    renderComponent();
    expect(screen.getAllByText("Confirmed")).toHaveLength(3);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders a Manage button for every appointment", () => {
    renderComponent();
    expect(screen.getAllByRole("button", { name: /manage/i })).toHaveLength(4);
  });

  it("navigates back to /doctor when Back to Dashboard is clicked", async () => {
    renderComponent();
    await userEvent.click(screen.getByText(/back to dashboard/i));
    expect(mockNavigate).toHaveBeenCalledWith("/doctor");
  });
});