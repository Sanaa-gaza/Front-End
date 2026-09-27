import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SiteLayout from "../../components/home/SiteLayout";
import { CONTACT_TOPICS, WHATSAPP_NUMBER } from "../../data/contact";

const inputBase =
    "h-11 w-full rounded-lg border bg-white text-[13px] text-[#141415] outline-none transition-colors placeholder:text-[#89949D] focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2]";

export default function Contact() {
    const { t } = useTranslation("contact");
    const [form, setForm] = useState({ name: "", city: "", topic: "", message: "" });
    const [errors, setErrors] = useState({});

    const update = (field) => (e) => {
        setForm((f) => ({ ...f, [field]: e.target.value }));
        if (errors[field]) setErrors((er) => ({ ...er, [field]: "" }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const next = {
            name: form.name.trim() ? "" : "name",
            city: form.city.trim() ? "" : "city",
            topic: form.topic ? "" : "topic",
            message: form.message.trim() ? "" : "message",
        };
        setErrors(next);
        if (Object.values(next).some(Boolean)) return;

        const text = [
            t("whatsapp.greeting"),
            `${t("whatsapp.name")}: ${form.name.trim()}`,
            `${t("whatsapp.city")}: ${form.city.trim()}`,
            `${t("whatsapp.topic")}: ${t(`topics.${form.topic}`)}`,
            `${t("whatsapp.message")}: ${form.message.trim()}`,
        ].join("\n");
        window.open(
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
            "_blank",
            "noopener,noreferrer",
        );
    };

    const borderFor = (field) => (errors[field] ? "border-red-400" : "border-[#4B9AD2]");
    const errorText = (field) =>
        errors[field] ? (
            <p className="mt-1 text-[11px] text-red-500">{t(`form.errors.${field}`)}</p>
        ) : null;

    return (
        <SiteLayout>
            <section className="mx-auto max-w-[1230px] px-5 pb-24 pt-28 sm:px-10 sm:pt-32">
                <nav aria-label="breadcrumb" className="flex items-center gap-2 text-[11px]">
                    <Link to="/" className="font-medium text-[#141415] hover:text-[#4B9AD2]">
                        {t("breadcrumb.home")}
                    </Link>
                    <i className="fa-solid fa-chevron-left text-[8px] text-[#89949D] ltr:rotate-180"></i>
                    <span className="text-[#4B9AD2]">{t("breadcrumb.contact")}</span>
                </nav>

                <div className="relative mt-8 overflow-hidden rounded-3xl border border-[#DCE6EE] bg-[#F8FAFC] px-6 py-10 shadow-[0_6px_18px_rgba(43,91,120,0.1)] sm:px-10 sm:py-12 lg:px-14">
                    <img
                        src="/images/contact-bg.jpg"
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14] grayscale"
                    />

                    <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
                        <div>
                            <h1 className="max-w-[400px] text-[28px] font-bold leading-[1.7] text-[#2B2B2B] sm:text-[38px]">
                                <span className="text-[#4B9AD2]">{t("titleHighlight")}</span>{" "}
                                {t("titleRest")}
                            </h1>
                            <p className="mt-5 max-w-[440px] text-[14px] leading-[2] text-[#575757]">
                                {t("desc")}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} noValidate className="w-full">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="c-name" className="mb-1.5 block text-[11px] font-bold text-[#2B2B2B]">
                                        {t("form.name")}
                                    </label>
                                    <div className="relative">
                                        <i className="fa-regular fa-user pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[13px] text-[#4B9AD2]"></i>
                                        <input
                                            id="c-name"
                                            value={form.name}
                                            onChange={update("name")}
                                            className={`${inputBase} ${borderFor("name")} pe-9 ps-3`}
                                        />
                                    </div>
                                    {errorText("name")}
                                </div>
                                <div>
                                    <label htmlFor="c-city" className="mb-1.5 block text-[11px] font-bold text-[#2B2B2B]">
                                        {t("form.city")}
                                    </label>
                                    <div className="relative">
                                        <i className="fa-solid fa-location-dot pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[13px] text-[#4B9AD2]"></i>
                                        <input
                                            id="c-city"
                                            value={form.city}
                                            onChange={update("city")}
                                            className={`${inputBase} ${borderFor("city")} pe-9 ps-3`}
                                        />
                                    </div>
                                    {errorText("city")}
                                </div>
                            </div>

                            <div className="mt-4">
                                <label htmlFor="c-topic" className="mb-1.5 block text-[11px] font-bold text-[#2B2B2B]">
                                    {t("form.topic")}
                                </label>
                                <div className="relative">
                                    <select
                                        id="c-topic"
                                        value={form.topic}
                                        onChange={update("topic")}
                                        className={`${inputBase} ${borderFor("topic")} cursor-pointer appearance-none ps-9 pe-3 ${
                                            form.topic ? "" : "text-[#89949D]"
                                        }`}
                                    >
                                        <option value="" disabled hidden>
                                            {t("form.topicPlaceholder")}
                                        </option>
                                        {CONTACT_TOPICS.map((k) => (
                                            <option key={k} value={k} className="text-[#141415]">
                                                {t(`topics.${k}`)}
                                            </option>
                                        ))}
                                    </select>
                                    <i className="fa-solid fa-chevron-down pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[10px] text-[#4B9AD2]"></i>
                                </div>
                                {errorText("topic")}
                            </div>

                            <div className="mt-4">
                                <label htmlFor="c-message" className="mb-1.5 block text-[11px] font-bold text-[#2B2B2B]">
                                    {t("form.message")}
                                </label>
                                <textarea
                                    id="c-message"
                                    rows={5}
                                    value={form.message}
                                    onChange={update("message")}
                                    className={`w-full resize-none rounded-lg border bg-white p-3 text-[13px] text-[#141415] outline-none transition-colors focus:border-[#4B9AD2] focus:ring-1 focus:ring-[#4B9AD2] ${borderFor("message")}`}
                                />
                                {errorText("message")}
                            </div>

                            <button
                                type="submit"
                                className="btn-wipe mt-5 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#12C044] text-[14px] font-semibold text-white [--wipe:#0E9C36]"
                            >
                                <i className="fa-brands fa-whatsapp text-[17px]"></i>
                                {t("form.send")}
                            </button>

                            <p className="mt-3 flex items-start gap-1.5 text-[10.5px] leading-[1.7] text-[#7A828A]">
                                <i className="fa-solid fa-triangle-exclamation mt-0.5 text-[10px]"></i>
                                {t("form.note")}
                            </p>
                        </form>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
