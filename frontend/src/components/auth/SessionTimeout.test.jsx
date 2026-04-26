import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

// Mock our Supabase database so it doesn't try to connect
vi.mock("../../api/supabaseClient", () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({
                data: { session: { user: { id: "test-user-123" } } },
            }),
            onAuthStateChange: vi.fn().mockReturnValue({
                data: { subscription: { unsubscribe: vi.fn() } },
            }),
            signOut: vi.fn().mockResolvedValue({ error: null }),
        },
    },
}));

// Mock ProfileService so it does not make real calls
vi.mock("../../services/profileService", () => ({
    default: {
        getProfileByAuthUserId: vi.fn().mockResolvedValue({ data: { name: "Test User" } }),
    },
}));

import { AuthContextProvider, UserAuth } from "./AuthContext";

// Helper that displays the timeout warning state
const TimeoutTestConsumer = () => {
    const { showTimeoutWarning, extendSession } = UserAuth();
    return (
        <div>
            {showTimeoutWarning && <div data-testid="warning-visible">Warning Shown</div>}
            <button onClick={extendSession}>Stay Logged In</button>
        </div>
    );
};

describe("Session Timeout", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("shows timeout warning after 13 minutes of inactivity", async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <AuthContextProvider>
                        <TimeoutTestConsumer />
                    </AuthContextProvider>
                </MemoryRouter>
            );
        });

        // Warning should NOT be visible initially
        expect(screen.queryByTestId("warning-visible")).not.toBeInTheDocument();

        // Fast-forward 13 minutes (TIMEOUT_DURATION - WARNING_BEFORE)
        await act(async () => {
            vi.advanceTimersByTime(13 * 60 * 1000);
        });

        // Warning SHOULD now be visible
        expect(screen.getByText("Session Expiring")).toBeInTheDocument();
    });

    it("dismisses warning and resets timer when 'Stay Logged In' is clicked", async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <AuthContextProvider>
                        <TimeoutTestConsumer />
                    </AuthContextProvider>
                </MemoryRouter>
            );
        });

        // Fast-forward time to trigger the warning
        await act(async () => {
            vi.advanceTimersByTime(13 * 60 * 1000);
        });

        // Verify the warning is showing
        expect(screen.getByText("Session Expiring")).toBeInTheDocument();

        // Click on "Stay Logged In" to extend the session
        await act(async () => {
            screen.getAllByText("Stay Logged In")[0].click();
        });

        // Warning should go away
        expect(screen.queryByText("Session Expiring")).not.toBeInTheDocument();
    });
});

