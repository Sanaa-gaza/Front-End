import React from "react";
import LoginForm from "../../components/LoginForm";

export default function ClientLogin() {
    return <LoginForm role="client" signupPath="/signup" forgotPasswordPath="/forget-password" />;
}