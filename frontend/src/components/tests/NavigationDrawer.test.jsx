/* @vitest-environment jsdom */
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import NavigationDrawer from "../NavigationDrawer";

const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
  };
});

describe("NavigationDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockReturnValue({ pathname: "/patient" });
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <NavigationDrawer />
      </MemoryRouter>
    );

  it("renders the top navigation links", () => {
    renderComponent();

    expect(screen.getByText("Dashboard")).toBeTruthy();
    expect(screen.getByText("Weekly Report")).toBeTruthy();
    expect(screen.getByText("History")).toBeTruthy();
  });

  it("highlights the active nav link using pathname", () => {
    mockUseLocation.mockReturnValue({ pathname: "/weekly-report" });
    const { container } = renderComponent();

    const activeLink = container.querySelector('a[href="/weekly-report"]');
    const inactiveLink = container.querySelector('a[href="/patient"]');

    expect(activeLink?.getAttribute("style")).toContain("color: blue");
    expect(activeLink?.getAttribute("style")).toContain("font-weight: bold");
    expect(inactiveLink?.getAttribute("style")).toContain("color: black");
  });

  it("navigates to patient profile when avatar button is clicked", () => {
    const { container } = renderComponent();

    const profileButton = container.querySelector('button .MuiAvatar-root')?.closest("button");
    expect(profileButton).toBeTruthy();
    fireEvent.click(profileButton);

    expect(mockNavigate).toHaveBeenCalledWith("/patient-profile");
  });

  it("opens drawer from menu button and renders drawer links", () => {
    renderComponent();

    expect(screen.queryByText("Settings")).toBeNull();
    fireEvent.click(screen.getAllByLabelText("menu")[0]);

    expect(screen.getByText("Settings")).toBeTruthy();
    expect(screen.getByText("Help")).toBeTruthy();
    expect(screen.getByText("Logout")).toBeTruthy();
  });
});