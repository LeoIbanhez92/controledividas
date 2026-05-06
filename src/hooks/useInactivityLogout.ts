import { useEffect, useRef } from 'react';

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos

export function useInactivityLogout(logout: () => void) {
    const logoutRef = useRef(logout);
    logoutRef.current = logout;

    useEffect(() => {
        const timerRef = { id: 0 as ReturnType<typeof setTimeout> };

        const reset = () => {
            clearTimeout(timerRef.id);
            timerRef.id = setTimeout(() => logoutRef.current(), TIMEOUT_MS);
        };

        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
        events.forEach((e) => window.addEventListener(e, reset, { passive: true }));

        reset();

        return () => {
            clearTimeout(timerRef.id);
            events.forEach((e) => window.removeEventListener(e, reset));
        };
    }, []); // sem dependências — estável
}
