import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

// Mock the UserAuth hook to control what session value the PrivateRoute sees
vi.mock("./AuthContext", () => ({
    UserAuth: vi.fn(),
}));

import PrivateRoute from "./PrivateRoute";
import { UserAuth } from "./AuthContext";

describe("PrivateRoute", () => {
    it("redirects to /login when there is no session", () => {
        // Pretends to be a logged-out user
        UserAuth.mockReturnValue({ session: null });

        render(
            <MemoryRouter initialEntries={["/patient"]}>
                <PrivateRoute>
                    <div>Protected Content</div>
                </PrivateRoute>
            </MemoryRouter>
        );

        // The protected content should NOT be visible
        expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("renders child content when user has a valid session", () => {
        // Pretends to be a logged-in user
        UserAuth.mockReturnValue({ session: { user: { id: "123" } } });

        render(
            <MemoryRouter>
                <PrivateRoute>
                    <div>Protected Content</div>
                </PrivateRoute>
            </MemoryRouter>
        );

        // The protected content SHOULD be visible
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
});

