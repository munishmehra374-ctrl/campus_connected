import { useEffect, useState } from "react";

const Countdown = ({ date }: { date: string }) => {
    const [label, setLabel] = useState("");

    useEffect(() => {
        const tick = () => {
            const diff = new Date(date).getTime() - Date.now();
            if (diff <= 0) {
                setLabel("Started");
                return;
            }
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const mins = Math.floor((diff / (1000 * 60)) % 60);
            if (days > 0) setLabel(`${days}d ${hours}h`);
            else if (hours > 0) setLabel(`${hours}h ${mins}m`);
            else setLabel(`${mins}m`);
        };
        tick();
        const id = setInterval(tick, 60000);
        return () => clearInterval(id);
    }, [date]);

    return <span className="hub-countdown">⏱ {label}</span>;
};

export default Countdown;
