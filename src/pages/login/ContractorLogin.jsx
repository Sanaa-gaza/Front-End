import React from "react";
import LoginForm from "../../components/LoginForm";

export default function ContractorLogin() {
    return (
        <LoginForm
            role="contractor"
            signupPath="/contractor-signup"
            forgotPasswordPath="/forget-password"
        />
    );
} 