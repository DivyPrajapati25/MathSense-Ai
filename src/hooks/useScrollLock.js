import { useEffect } from "react";

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
