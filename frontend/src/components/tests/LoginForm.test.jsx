/* @vitest-environment jsdom */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginForm from "../auth/LoginForm.jsx";
import ProfileService from "../../services/profileService";
import { UserAuth } from "../auth/AuthContext";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        Link: ({ children, to }) => <a href={to}>{children}</a>,
    };
});

vi.mock("../auth/AuthContext", () => ({
    UserAuth: vi.fn(),
}));

vi.mock("../../services/profileService", () => ({
    default: {
        getProfileByAuthUserId: vi.fn(),
    },
}));

describe("LoginForm", () => {
    const mockLoginUser = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        UserAuth.mockReturnValue({
            session: null,
            loginUser: mockLoginUser,
        });
    });

    it("logs in and redirects provider users to doctor dashboard", async () => {
        mockLoginUser.mockResolvedValue({
            success: true,
            data: { user: { id: "user-123" } },
        });
        ProfileService.getProfileByAuthUserId.mockResolvedValue({
            data: { role: "provider" },
        });

        render(<LoginForm />);

        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "doctor@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "password123" },
        });
        fireEvent.click(screen.getByRole("button", { name: /log in/i }));

        await waitFor(() => {
            expect(mockLoginUser).toHaveBeenCalledWith("doctor@example.com", "password123");
            expect(ProfileService.getProfileByAuthUserId).toHaveBeenCalledWith("user-123");
            expect(mockNavigate).toHaveBeenCalledWith("/doctor");
        });
    });

    it ("logs in and redirects patient users to patient dashboard", async () => {
        mockLoginUser.mockResolvedValue({
            success: true,
            data: { user: { id: "user-123" } },
        });
        ProfileService.getProfileByAuthUserId.mockResolvedValue({
            data: { role: "patient" },
        });
    });

});
