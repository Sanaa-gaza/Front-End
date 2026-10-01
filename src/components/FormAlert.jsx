import React from "react";

/** صندوق أخطاء عام فوق الفورم (رسائل السيرفر أو مشكلة اتصال) */
export default function FormAlert({ messages = [] }) {
    const list = messages.filter(Boolean);
    if (!list.length) return null;

    return (
        <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-start text-sm text-red-600">
            {list.length === 1 ? (
                <p>{list[0]}</p>
            ) : (
                <ul className="list-disc ps-5 space-y-1">
                    {list.map((msg, i) => (
                        <li key={i}>{msg}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}
