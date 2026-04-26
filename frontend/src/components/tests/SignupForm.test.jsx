/* @vitest-environment jsdom */
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SignupForm from "../auth/SignupForm.jsx";
import ProfileService from "../../services/profileService";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        Link: ({ children, to }) => <a href={to}>{children}</a>,
    };
});

vi.mock("../../services/profileService", () => ({
    default: {
        createProfile: vi.fn(),
    },
}));

describe("SignupForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it("creates a patient profile and navigates with first name state", async () => {
        ProfileService.createProfile.mockResolvedValue({ data: { id: "profile-1" } });

        render(<SignupForm />);

        fireEvent.change(screen.getByPlaceholderText("First Name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByPlaceholderText("Last Name"), {
            target: { value: "Doe" },
        });
        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "jane@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "password123" },
        });
        fireEvent.change(screen.getByLabelText(/i am signing up as/i), {
            target: { value: "patient" },
        });
        fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

        await waitFor(() => {
            expect(ProfileService.createProfile).toHaveBeenCalledWith({
                first_name: "Jane",
                last_name: "Doe",
                email: "jane@example.com",
                password: "password123",
                role: "patient",
            });
            expect(mockNavigate).toHaveBeenCalledWith("/patient", {
                state: { firstName: "Jane" },
            });
        });
    });

    it("creates a provider profile and navigates without state", async () => {
        ProfileService.createProfile.mockResolvedValue({ data: { id: "profile-2" } });

        render(<SignupForm />);

        fireEvent.change(screen.getByPlaceholderText("First Name"), {
            target: { value: "John" },
        });
        fireEvent.change(screen.getByPlaceholderText("Last Name"), {
            target: { value: "Smith" },
        });
        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "john@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "password123" },
        });
        fireEvent.change(screen.getByLabelText(/i am signing up as/i), {
            target: { value: "provider" },
        });
        fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

        await waitFor(() => {
            expect(ProfileService.createProfile).toHaveBeenCalledWith({
                first_name: "John",
                last_name: "Smith",
                email: "john@example.com",
                password: "password123",
                role: "provider",
            });
            expect(mockNavigate).toHaveBeenCalledWith("/doctor", {
                state: undefined,
            });
        });
    });

    it("shows an error if role is not selected", async () => {
        render(<SignupForm />);

        fireEvent.change(screen.getByPlaceholderText("First Name"), {
            target: { value: "NoRole" },
        });
        fireEvent.change(screen.getByPlaceholderText("Last Name"), {
            target: { value: "User" },
        });
        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "norole@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "password123" },
        });
        fireEvent.submit(screen.getByRole("button", { name: /sign up/i }).closest("form"));

        await waitFor(() => {
            expect(screen.getByText("Please select a role.")).toBeTruthy();
        });
        expect(ProfileService.createProfile).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});