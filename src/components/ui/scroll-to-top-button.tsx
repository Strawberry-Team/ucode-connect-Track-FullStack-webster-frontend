"use client";

import { useState, useEffect } from "react";
import { CircleArrowUp} from "lucide-react";

export default function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);

        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={` fixed bottom-6 right-6 transition-opacity duration-700 ${
                isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-label="Scroll to top"
        >
            <CircleArrowUp
                className="cursor-pointer w-12 h-12 text-gray-600 hover:text-gray-500 transition-colors duration-200"
            />
        </button>
    );
}