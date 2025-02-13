import { useEffect, useState } from 'react';

export const useScrollIndicator = (ref: React.RefObject<HTMLElement>) => {
    const [scrollPercentage, setScrollPercentage] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (!ref.current) return;

            const { scrollTop, scrollHeight, clientHeight } = ref.current;
            const percentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
            setScrollPercentage(percentage);

            document.documentElement.style.setProperty(
                '--scroll-percentage',
                `${percentage}%`
            );
        };

        const element = ref.current;
        if (element) {
            element.addEventListener('scroll', handleScroll);
            return () => element.removeEventListener('scroll', handleScroll);
        }
    }, [ref]);

    return scrollPercentage;
};