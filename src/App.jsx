import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

import Home from "./pages/general/Home";
import RoleSelection from "./pages/general/RoleSelection";
import NotFound from "./pages/general/NotFound";
import Dashboard from "./pages/dashboard/Dashboard";

import ClientLogin from "./pages/login/ClientLogin";
import CraftsmanLogin from "./pages/login/CraftsmanLogin";
import InstitutionLogin from "./pages/login/InstitutionLogin";
import ContractorLogin from "./pages/login/ContractorLogin";

import ForgotPassword from "./pages/password/ForgotPassword";
import VerificationCode from "./pages/password/VerificationCode";
import ResetPassword from "./pages/password/ResetPassword";

import ClientSignup from "./pages/signup/ClientSignup";
import CraftsmanSignupStep1 from "./pages/signup/CraftsmanSignupStep1";
import CraftsmanSignupStep2 from "./pages/signup/CraftsmanSignupStep2";
import InstitutionSignupStep1 from "./pages/signup/InstitutionSignupStep1";
import InstitutionSignupStep2 from "./pages/signup/InstitutionSignupStep2";
import ContractorSignupStep1 from "./pages/signup/ContractorSignupStep1";
import ContractorSignupStep2 from "./pages/signup/ContractorSignupStep2";
import ContractorSignupStep3 from "./pages/signup/ContractorSignupStep3";

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/get-started" element={<RoleSelection />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<ClientLogin />} />
          <Route path="/craftsman-login" element={<CraftsmanLogin />} />
          <Route path="/forget-password" element={<ForgotPassword />} />
          <Route path="/verification-code" element={<VerificationCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/craftsman-signup" element={<CraftsmanSignupStep1 />} />
          <Route path="/craftsman-signup/step-2" element={<CraftsmanSignupStep2 />} />
          <Route path="/signup" element={<ClientSignup />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/institution-login" element={<InstitutionLogin />} />
          <Route path="/contractor-login" element={<ContractorLogin />} />
          <Route path="/institution-signup" element={<InstitutionSignupStep1 />} />
          <Route path="/institution-signup/step-2" element={<InstitutionSignupStep2 />} />
          <Route path="/contractor-signup" element={<ContractorSignupStep1 />} />
          <Route path="/contractor-signup/step-2" element={<ContractorSignupStep2 />} />
          <Route path="/contractor-signup/step-3" element={<ContractorSignupStep3 />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}