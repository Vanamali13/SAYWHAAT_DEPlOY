import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../api/apiClient";

const CurrencyContext = createContext();

// Fallback to USD if anything fails
const DEFAULT_CURRENCY = {
    code: "USD",
    symbol: "$",
    rate: 1,
};

export const SYMBOL_MAP = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
    CNY: "¥",
};

export function CurrencyProvider({ children }) {
    const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initCurrency = async () => {
            try {
                // 1. Get User's Country/Currency from IP
                // Using backend proxy to avoid CORS and ensure valid response
                const ipRes = await apiClient.get('/utils/ip');
                const ipData = ipRes.data;

                const userCurrencyCode = ipData.currency || "USD";

                if (userCurrencyCode === "USD") {
                    setLoading(false);
                    return; // Already default
                }

                // 2. Get Exchange Rate for that currency
                const rateRes = await fetch(`https://open.er-api.com/v6/latest/USD`);
                const rateData = await rateRes.json();

                const rate = rateData.rates[userCurrencyCode];

                if (rate) {
                    setCurrency({
                        code: userCurrencyCode,
                        symbol: SYMBOL_MAP[userCurrencyCode] || userCurrencyCode + " ",
                        rate: rate,
                    });
                }
            } catch (error) {
                console.warn("Currency detection failed, falling back to USD:", error);
            } finally {
                setLoading(false);
            }
        };

        initCurrency();
    }, []);

    // Helper: Convert USD Amount to Local Amount (Display String or Value)
    const convert = (amountInUSD, format = true) => {
        const converted = amountInUSD * currency.rate;

        if (!format) return converted;

        // Format numbers nicely: 1000 -> 1,000 using native locale
        const formattedNum = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 0,
        }).format(converted);

        return `${currency.symbol}${formattedNum}`;
    };

    // Helper: Convert Local Amount BACK to USD (for logic checks)
    const toUSD = (localAmount) => {
        return localAmount / currency.rate;
    };

    // Helper: Manual Currency Change
    const changeCurrency = async (newCode) => {
        if (newCode === currency.code) return;

        setLoading(true);
        try {
            // Fetch new rate relative to USD
            const rateRes = await fetch(`https://open.er-api.com/v6/latest/USD`);
            const rateData = await rateRes.json();
            const newRate = rateData.rates[newCode];

            if (newRate) {
                setCurrency({
                    code: newCode,
                    symbol: SYMBOL_MAP[newCode] || newCode + " ",
                    rate: newRate,
                });
            }
        } catch (error) {
            console.error("Failed to change currency:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <CurrencyContext.Provider value={{ ...currency, convert, toUSD, loading, changeCurrency, availableCurrencies: Object.keys(SYMBOL_MAP) }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export const useCurrency = () => useContext(CurrencyContext);
