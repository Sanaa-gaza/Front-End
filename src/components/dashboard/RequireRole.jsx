import React from "react";
import { Navigate } from "react-router-dom";
import { getToken, getStoredUser, homePathForRole } from "../../api/session";

/**
 * حماية لوحات التحكم: بدون توكن → صفحة الدخول،
 * ولو نوع الحساب مختلف → بنرجعه على لوحته هو.
 */
export default function RequireRole({ role, children, loginPath = "/login" }) {
    if (!getToken()) return <Navigate to={loginPath} replace />;

    const user = getStoredUser();
    if (user?.role && user.role !== role) {
        return <Navigate to={homePathForRole(user.role)} replace />;
    }

    return children;
}
