import { useEffect } from "react";

/**
 * Locks body scroll when a modal/overlay is open.
 * Preserves the current scroll position and restores it on unmount.
 */
const useScrollLock = () => {
    useEffect(() => {
        const scrollY = window.scrollY;
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";
        document.body.style.overflowY = "scroll";
        return () => {
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            document.body.style.overflowY = "";
            window.scrollTo({ top: scrollY, behavior: "instant" });
        };
    }, []);
};

export default useScrollLock;
