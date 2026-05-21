import { FILTER_TABS, SEMESTERS } from "../data";

interface Props {
    type: string;
    setType: (v: string) => void;
    sem: string;
    setSem: (v: string) => void;
    search: string;
    setSearch: (v: string) => void;
}

const ResourcesFilters = ({ type, setType, sem, setSem, search, setSearch }: Props) => {
    return (
        <section className="resources-filters">
            <input
                type="text"
                placeholder="Search by title, subject, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search resources"
            />

            <div className="filter-tabs filter-tabs-scroll">
                {FILTER_TABS.map((t) => (
                    <button
                        key={t}
                        type="button"
                        className={type === t ? "active" : ""}
                        onClick={() => setType(t)}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="semester-filter">
                <span>Filter by semester</span>
                <div className="sem-buttons">
                    {SEMESTERS.map((s) => (
                        <button
                            key={s}
                            type="button"
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
