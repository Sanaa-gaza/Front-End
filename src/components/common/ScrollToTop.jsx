import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

// بيرجع الصفحة لأولها عند كل تنقل لصفحة جديدة (إلا لما نكون رايحين لقسم معين)
export default function ScrollToTop() {
    const location = useLocation();

    useLayoutEffect(() => {
        if (location.state?.scrollTo) return;
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    return null;
}
