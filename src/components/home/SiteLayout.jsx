import React, { useRef } from "react";
import useLangDir from "../../hooks/useLangDir";
import useScrollReveal from "../../hooks/useScrollReveal";
import HomeHeader from "./HomeHeader";
import Footer from "./Footer";
import AssistantButton from "./AssistantButton";

export default function SiteLayout({ children }) {
    useLangDir();
    const rootRef = useRef(null);
    useScrollReveal(rootRef);

    return (
        <div ref={rootRef} className="relative min-h-dvh overflow-x-hidden bg-white">
            <HomeHeader />
            <main>{children}</main>
            <Footer />
            <AssistantButton />
        </div>
    );
}
