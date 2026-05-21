export function formatEventDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function getCountdown(targetDate: string, timeStr?: string) {
    const d = new Date(targetDate);
    if (timeStr) {
        const match = timeStr.match(/(\d{1,2}):(\d{2})/);
        if (match) d.setHours(parseInt(match[1], 10), parseInt(match[2], 10), 0, 0);
    }
    const diff = d.getTime() - Date.now();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

export function statusBadgeClass(status?: string) {
    const s = (status || "").toLowerCase().replace(/\s+/g, "-");
    return `status-badge status-${s}`;
}
