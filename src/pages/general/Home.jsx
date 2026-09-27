import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SiteLayout from "../../components/home/SiteLayout";
import HeroSection from "../../components/home/HeroSection";
import ServicesSection from "../../components/home/ServicesSection";
import CraftsmenSection from "../../components/home/CraftsmenSection";
import FeaturesSection from "../../components/home/FeaturesSection";
import GuideSection from "../../components/home/GuideSection";
import CtaSection from "../../components/home/CtaSection";

export default function Home() {
    const location = useLocation();
    const navigate = useNavigate();

    // لما المستخدم يجي من صفحة ثانية (مثل "عن صنعة") ويضغط رابط قسم بالهيدر
    useEffect(() => {
        const target = location.state?.scrollTo;
        if (!target) return;
        const timer = setTimeout(() => {
            if (target === "home") window.scrollTo({ top: 0 });
            else document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
            navigate(location.pathname, { replace: true, state: null });
        }, 80);
        return () => clearTimeout(timer);
    }, [location, navigate]);

    return (
        <SiteLayout>
            <HeroSection />
            <ServicesSection />
            <CraftsmenSection />
            <FeaturesSection />
            <GuideSection />
            <CtaSection />
        </SiteLayout>
    );
}
