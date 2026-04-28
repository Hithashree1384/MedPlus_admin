import React, { useEffect, useState,useMemo } from 'react'
import { doctorListStyles, doctorListStyles as s } from '../assets/dummyStyles'
import { BadgeIndianRupee, EyeOff, Search, Star, Trash2, Users,ChevronDown } from 'lucide-react';
import { serviceListStyles  } from "../assets/dummyStyles";

const API_BASE = import.meta.env.VITE_API_URL;

function formatDateISO(iso) {
  if (!iso || typeof iso !== "string") return iso;
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = String(Number(d));
  const month = monthNames[dateObj.getMonth()] || "";
  return `${day} ${month} ${y}`;
}

function normalizeToDateString(d) {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().split("T")[0];
}

function buildScheduleMap(schedule) {
  const map = {};
  if (!schedule || typeof schedule !== "object") return map;
  Object.entries(schedule).forEach(([k, v]) => {
    const nd = normalizeToDateString(k) || String(k);
    map[nd] = Array.isArray(v) ? v.slice() : [];
  });
  return map;
}

function getSortedScheduleDates(scheduleLike) {
  let keys = [];
  if (Array.isArray(scheduleLike)) {
    keys = scheduleLike.map(normalizeToDateString).filter(Boolean);
  } else if (scheduleLike && typeof scheduleLike === "object") {
    keys = Object.keys(scheduleLike).map(normalizeToDateString).filter(Boolean);
  }

  keys = Array.from(new Set(keys));
  const parsed = keys.map((ds) => ({ ds, date: new Date(ds) }));
  const dateVal = (d) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());

  const today = new Date();
  const todayVal = dateVal(today);

  const past = parsed
    .filter((p) => dateVal(p.date) < todayVal)
    .sort((a, b) => dateVal(b.date) - dateVal(a.date));

  const future = parsed
    .filter((p) => dateVal(p.date) >= todayVal)
    .sort((a, b) => dateVal(a.date) - dateVal(b.date));

  return [...past, ...future].map((p) => p.ds);
}

const ListPage = () => {
    const API_BASE = import.meta.env.VITE_API_URL;

     const [doctors, setDoctors] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  const [isMobileScreen, setIsMobileScreen] = useState(false);
  useEffect(() => {
    function onResize() {
      if (typeof window === "undefined") return;
      setIsMobileScreen(window.innerWidth < 640);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  async function fetchDoctors() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/doctors`);
      const body = await res.json().catch(() => null);

      if (res.ok && body && body.success) {
        const list = Array.isArray(body.data)
          ? body.data
          : Array.isArray(body.doctors)
          ? body.doctors
          : [];
        const normalized = list.map((d) => {
          const scheduleMap = buildScheduleMap(d.schedule || {});
          return {
            ...d,
            schedule: scheduleMap,
          };
        });
        setDoctors(normalized);
      } else {
        console.error("Failed to fetch doctors", { status: res.status, body });
        setDoctors([]);
      }
    } catch (err) {
      console.error("Network error fetching doctors", err);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = doctors;
    if (filterStatus === "available") {
      list = list.filter(
        (d) => (d.availability || "").toString().toLowerCase() === "available"
      );
    } else if (filterStatus === "unavailable") {
      list = list.filter(
        (d) => (d.availability || "").toString().toLowerCase() !== "available"
      );
    }
    if (!q) return list;
    return list.filter((d) => {
      return (
        (d.name || "").toLowerCase().includes(q) ||
        (d.specialization || "").toLowerCase().includes(q)
      );
    });
  }, [doctors, query, filterStatus]);

  const displayed = useMemo(() => {
    if (showAll) return filtered;
    return filtered.slice(0, 6);
  }, [filtered, showAll]);

  function toggle(id) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  async function removeDoctor(id) {
    const doc = doctors.find((d) => (d._id || d.id) === id);
    if (!doc) return;
    const ok = window.confirm(`Delete ${doc.name}? This cannot be undone.`);
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/api/doctors/${id}`, {
        method: "DELETE",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        alert(body?.message || "Failed to delete");
        return;
      }
      setDoctors((prev) => prev.filter((p) => (p._id || p.id) !== id));
      if (expanded === id) setExpanded(null);
    } catch (err) {
      console.error("delete error", err);
      alert("Network error deleting doctor");
    }
  }

  function applyStatusFilter(status) {
    setFilterStatus((prev) => (prev === status ? "all" : status));
    setExpanded(null);
    setShowAll(false);
  }


  return (
    <div className={s.container}>
      <header className={s.headerContainer}>
        <div className={s.headerTopSection}>
          <div className={s.headerIconContainer}>
            <div className={s.headerIcon}>
              <Users size={24} className={s.headerIconSvg}/>
            </div>
            <div>
              <h1 className={s.headerTitle}>Find a Doctor</h1>
              <p className={s.headerSubtitle}>Search by name or specialization</p>
            </div>
          </div>
          <div className={s.headerSearchContainer}>
            <div className={s.searchBox}>
              <Search size={16} className={s.searchIcon}/>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search doctors..." className={s.searchInput}/>
            </div>
            <button onClick={() =>{ setQuery(""); setExpanded(null); setShowAll(false); setFilterStatus("all") }} className={s.clearButton}>Clear</button>
          </div>
        </div>

        <div className={s.filterContainer}>
          <button onClick={()=>applyStatusFilter("available")} className={s.filterButton(filterStatus==="available","cyan")}>Available</button>
          <button onClick={()=>applyStatusFilter("unavailable")} className={s.filterButton(filterStatus==="unavailable","red")}>Unavailable</button>
        </div>
      </header>
      <main className={s.gridContainer}>
        {loading && (<div className={s.loadingContainer}>Loading Doctors..</div>)}
        {!loading && filtered.length === 0 && (<div className={s.noResultsContainer}>No doctors found.</div>)}
        {displayed.map((d) => {
          const id = d._id || d.id;
          const isOpen = expanded === id;
          const isAvailable = d.availability === "Available";
          const scheduleMap= buildScheduleMap(d.schedule || {});
          const scheduleDates = getSortedScheduleDates(scheduleMap);
          return (
            <article key={id} className={s.article}>
              <div className={s.articleContent}>
                <img src={d.image|| d.imageUrl || " "} 
                  alt={d.name || "Doctor"} 

                  className={s.doctorImage}
                  />
                  <div className={s.doctorInfoContainer}>
                    <div className={s.doctorHeader}>
                      <div className="min-w-0 w-full">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={s.doctorName}>
                            {d.name }
                          </h3>
                          <span className={s.availabilityBadge(isAvailable,)}>
                            {isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </div>
                        <div className={s.doctorDetails}>
                          {d.specialization } . {d.experience} years experience
                        </div>
                      </div>
                      <div className={s.ratingContainer}>
                        <div className={s.rating}>
                          <Star size={14} />{d.rating || "N/A"}

                        </div>
                      <div onClick={() => toggle(id)} className={serviceListStyles.chevronContainer}>
                        <ChevronDown
                          size={18}
                          className={`${serviceListStyles.chevronIcon} ${isOpen ? serviceListStyles.chevronOpen : serviceListStyles.chevronClosed
                            }`}
                        />
                      </div>
                      </div>
                    </div>

                    <div className={s.statsContainer}>
                      <div className={s.statsLabel}>Patients:</div>
                      <div className={s.statsValue}>
                        <Users size={14} />{d.patients}
                      </div>

                      <div className={doctorListStyles.actionContainer}>
                        <div className='flex items-center gap-4'>
             

                          <div className={s.feesLabel}>Fees</div>
                          <div className={s.feesValue}><BadgeIndianRupee/>{d.fee}</div>
                            <button onClick={() => removeDoctor(id)} className={s.deleteButton}>
                            <Trash2 size={14} />Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

              </div>

              <div
                className={doctorListStyles.expandableContent}
                style={{
                  maxHeight: isOpen ? (isMobileScreen ? 320 : 600) : 0,
                  transition:
                    "max-height 420ms cubic-bezier(.2,.9,.2,1), padding 220ms ease",
                  paddingTop: isOpen ? 16 : 0,
                  paddingBottom: isOpen ? 16 : 0,
                }}
              >
                {isOpen && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className={doctorListStyles.aboutSection}>
                      <h4 className={doctorListStyles.aboutHeading}>About</h4>
                      <p className={doctorListStyles.aboutText}>{d.about}</p>

                      <div className="mt-4">
                        <div className={doctorListStyles.qualificationsHeading}>
                          Qualifications
                        </div>
                        <div className={doctorListStyles.qualificationsText}>
                          {d.qualifications}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className={doctorListStyles.scheduleHeading}>
                          Schedule
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {scheduleDates.map((date) => {
                            const slots = scheduleMap[date] || [];
                            return (
                              <div key={date} className="min-w-full md:min-w-0">
                                <div className={doctorListStyles.scheduleDate}>
                                  {formatDateISO(date)}
                                </div>
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {slots.map((s, i) => (
                                    <span
                                      key={i}
                                      className={doctorListStyles.scheduleSlot}
                                    >
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <aside className={doctorListStyles.statsSidebar}>
                      <div className={doctorListStyles.statsItemHeading}>
                        Success
                      </div>
                      <div className={doctorListStyles.statsItemValue}>
                        {d.success}%
                      </div>

                      <div className={doctorListStyles.statsItemHeading}>
                        Patients
                      </div>
                      <div className={doctorListStyles.statsItemValue}>
                        {d.patients}
                      </div>

                      <div className={doctorListStyles.statsItemHeading}>
                        Location
                      </div>
                      <div className={doctorListStyles.locationValue}>
                        {d.location}
                      </div>
                    </aside>
                  </div>
                )}
              </div>
            </article>
          );
        }
        )}
        {filtered.length > 6 && (
          <div className={s.showMoreContainer}>
            <button onClick={() => setShowAll((s)=>!s)} className={s.showMoreButton}>
              {showAll ? "Show Less" : `Show All (${filtered.length-4})`}
            </button>
          </div>
        )}

      </main>

    </div>
  )
}

export default ListPage
