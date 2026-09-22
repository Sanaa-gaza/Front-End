import React from "react";
import LoginForm from "../../components/LoginForm";

export default function CraftsmanLogin() {
    return (
        <LoginForm
            role="craftsman"
            signupPath="/craftsman-signup"
            forgotPasswordPath="/forget-password"
        />
    );
}