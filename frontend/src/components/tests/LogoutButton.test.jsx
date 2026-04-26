/* @vitest-environment jsdom */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LogoutButton } from "../auth/LogoutButton.jsx";
import { UserAuth } from "../auth/AuthContext";
import { supabase } from "../../api/supabaseClient";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        Link: ({ children, onClick }) => (
            <a href="#" onClick={onClick}>
                {children}
            </a>
        ),
    };
});

vi.mock("../auth/AuthContext", () => ({
    UserAuth: vi.fn(),
}));

vi.mock("../../api/supabaseClient", () => ({
    supabase: {
        auth: {
            getUser: vi.fn(),
        },
    },
}));

describe("LogoutButton", () => {
    const mockLogoutUser = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        UserAuth.mockReturnValue({
            logoutUser: mockLogoutUser,
        });
        supabase.auth.getUser.mockResolvedValue({
            data: { user: { id: "user-123" } },
        });
    });

    it("logs out and redirects to home page", async () => {
        mockLogoutUser.mockResolvedValue({ success: true });

        render(<LogoutButton />);
        fireEvent.click(screen.getByText(/logout/i));

        await waitFor(() => {
            expect(mockLogoutUser).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith("/");
        });
    });
});
