interface Props {
    type: string;
    setType: (v: string) => void;
    sem: string;
    setSem: (v: string) => void;
    search: string;
    setSearch: (v: string) => void;
    role: string; // 🔴 NEW
}

const ResourcesFilters = ({ type, setType, sem, setSem, search, setSearch, role }: Props) => {
    return (
        <section className="resources-filters">
            <input
                type="text"
                placeholder="🔍 Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="filter-tabs">
                {["All", "Notes", "Paper"].map((t) => (
                    <button
                        key={t}
                        className={type === t ? "active" : ""}
                        onClick={() => setType(t)}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="semester-filter">
                <span>Filter by Semester:</span>
                <div className="sem-buttons">
                    {["All", "Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6", "Sem 7", "Sem 8"].map((s) => (
                        <button
                            key={s}
                            className={sem === s ? "active" : ""}
                            onClick={() => setSem(s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ResourcesFilters;
