import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import EditProfile from "./EditProfile";

const formData = {
    first_name: "Maya",
    last_name: "Johnson",
    email: "maya@example.com",
    phone: "555-123-4567",
    date_of_birth: "1988-04-12",
    address_line1: "123 Oak Street",
    address_line2: "Apt 4B",
    city: "Chicago",
    state: "IL",
    zip_code: "60601",
    emergency_contact_name: "Sam Johnson",
    emergency_contact_phone: "555-987-6543",
    emergency_contact_relation: "Spouse",
    allergies: "Penicillin, Peanuts",
    current_medications: "Aspirin",
    medical_conditions: "Hypertension",
    diagnosis_date: "2024-01-15",
    disease_stage: "Stage 2",
    notes: "Prefers morning appointments",
};

const renderEditProfile = (overrides = {}) => {
    const props = {
        formData,
        handleInputChange: vi.fn(),
        handleSave: vi.fn(),
        handleCancel: vi.fn(),
        ...overrides,
    };

    render(<EditProfile {...props} />);

    return props;
};

describe("EditProfile", () => {
    it("renders each profile section with the current form values", () => {
        renderEditProfile();

        expect(screen.getByText("Basic Information")).toBeInTheDocument();
        expect(screen.getByText("Address")).toBeInTheDocument();
        expect(screen.getByText("Emergency Contact")).toBeInTheDocument();
        expect(screen.getByText("Health Information")).toBeInTheDocument();

        expect(screen.getByLabelText("First Name")).toHaveValue("Maya");
        expect(screen.getByLabelText("Last Name")).toHaveValue("Johnson");
        expect(screen.getByLabelText("Email")).toHaveValue("maya@example.com");
        expect(screen.getByLabelText("Phone")).toHaveValue("555-123-4567");
        expect(screen.getByLabelText("Date of Birth")).toHaveValue("1988-04-12");
        expect(screen.getByLabelText("Address Line 1")).toHaveValue("123 Oak Street");
        expect(screen.getByLabelText("Address Line 2")).toHaveValue("Apt 4B");
        expect(screen.getByLabelText("City")).toHaveValue("Chicago");
        expect(screen.getByLabelText("State")).toHaveValue("IL");
        expect(screen.getByLabelText("Zip Code")).toHaveValue("60601");
        expect(screen.getByLabelText("Contact Name")).toHaveValue("Sam Johnson");
        expect(screen.getByLabelText("Contact Phone")).toHaveValue("555-987-6543");
        expect(screen.getByLabelText("Relationship")).toHaveValue("Spouse");
        expect(screen.getByLabelText("Allergies")).toHaveValue("Penicillin, Peanuts");
        expect(screen.getByLabelText("Current Medications")).toHaveValue("Aspirin");
        expect(screen.getByLabelText("Medical Conditions")).toHaveValue("Hypertension");
        expect(screen.getByLabelText("Diagnosis Date")).toHaveValue("2024-01-15");
        expect(screen.getByLabelText("Disease Stage")).toHaveValue("Stage 2");
        expect(screen.getByLabelText("Notes")).toHaveValue("Prefers morning appointments");
    });

    it("marks the email field as read-only by disabling it", () => {
        renderEditProfile();

        expect(screen.getByLabelText("Email")).toBeDisabled();
    });

    it("passes editable field changes to the input change handler", () => {
        const changes = [];
        const handleInputChange = vi.fn((event) => {
            changes.push({
                name: event.target.name,
                value: event.target.value,
            });
        });
        renderEditProfile({ handleInputChange });

        fireEvent.change(screen.getByLabelText("First Name"), {
            target: { value: "Maya Lynn" },
        });
        fireEvent.change(screen.getByLabelText("Diagnosis Date"), {
            target: { value: "2024-02-20" },
        });
        fireEvent.change(screen.getByLabelText("Notes"), {
            target: { value: "Needs a late afternoon appointment" },
        });

        expect(handleInputChange).toHaveBeenCalledTimes(3);
        expect(changes[0]).toEqual({
            name: "first_name",
            value: "Maya Lynn",
        });
        expect(changes[1]).toEqual({
            name: "diagnosis_date",
            value: "2024-02-20",
        });
        expect(changes[2]).toEqual({
            name: "notes",
            value: "Needs a late afternoon appointment",
        });
    });

    it("calls cancel and save handlers from the action buttons", async () => {
        const user = userEvent.setup();
        const props = renderEditProfile();

        await user.click(screen.getByRole("button", { name: "Cancel" }));
        await user.click(screen.getByRole("button", { name: "Save Changes" }));

        expect(props.handleCancel).toHaveBeenCalledTimes(1);
        expect(props.handleSave).toHaveBeenCalledTimes(1);
    });
});
