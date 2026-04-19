import { UserAuth } from "./AuthContext";

const SessionTimeoutWarning = () => {
    const { showTimeoutWarning, extendSession } = UserAuth();

    if (!showTimeoutWarning) return null;

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
        }}>
            <div style={{
                backgroundColor: "white",
                padding: "30px",
                borderRadius: "8px",
                textAlign: "center",
                maxWidth: "400px"
            }}>
                <h2>Session Expiring</h2>
                <p>Your session will expire in 2 minutes due to inactivity. Would you like to stay logged in?</p>
                <button
                    onClick={extendSession}
                    style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        cursor: "pointer",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px"
                    }}
                >
                    Stay Logged In
                </button>
            </div>
        </div>
    );
};

export default SessionTimeoutWarning;
