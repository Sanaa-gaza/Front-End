import React from "react";
import LoginForm from "../../components/LoginForm";

export default function InstitutionLogin() {
    return (
        <LoginForm
            role="institution"
            signupPath="/institution-signup"
            forgotPasswordPath="/forget-password"
        />
    );
}