const API_URL = "http://localhost:8000/api/v1/auth";

export const authApi = {
    // New Flow: Register Request (Details) -> Verify (OTP)
    registerRequest: async (data) => {
        const response = await fetch(`${API_URL}/register-request`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Registration failed");
        }
        return response.json();
    },

    verifyRegistration: async (email, otp) => {
        const response = await fetch(`${API_URL}/verify-registration`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Invalid OTP");
        }
        return response.json(); // Returns { access_token, role }
    },

    login: async (email, password) => {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Login failed");
        }
        return response.json(); // Returns { access_token, role }
    }
};
