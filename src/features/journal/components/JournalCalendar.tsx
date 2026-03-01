import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/*
  ═══════════════════════════════════════════════════════════════
  JOURNAL CALENDAR LOG
  ═══════════════════════════════════════════════════════════════
  
  Calendar grid view where:
  - Each day with an entry shows a colored mood dot
  - Tap a day → entries slide in below
  - Visual mood timeline across the month
  - Large 48px+ day cells for elderly users
  - Month navigation with ← →
  ═══════════════════════════════════════════════════════════════
*/

// ─── EMOTION COLOR MAP ───────────────────────────────────────

const EC: Record<string, string> = {
    Anxious: "#FFB74D", Panicked: "#FFB74D", Overwhelmed: "#FFB74D",
    Worried: "#FFB74D", Insecure: "#FFB74D",
    Lonely: "#90CAF9", Heartbroken: "#90CAF9", Hopeless: "#90CAF9",
    Disappointed: "#90CAF9", Sorrowful: "#90CAF9",
    Irritated: "#E57373", Resentful: "#E57373", Furious: "#E57373",
    Annoyed: "#E57373", Jealous: "#E57373",
    Embarrassed: "#CE93D8", Guilty: "#CE93D8", Humiliated: "#CE93D8",
    Defective: "#CE93D8", Inadequate: "#CE93D8",
    Drained: "#A5D6A7", Apathetic: "#A5D6A7", Disconnected: "#A5D6A7",
    "Burnt out": "#A5D6A7", Empty: "#A5D6A7",
    Calm: "#80CBC4", Relieved: "#80CBC4", Hopeful: "#80CBC4",
    Appreciative: "#80CBC4", Content: "#80CBC4",
};

const MOOD_META: Record<string, { label: string; emoji: string }> = {
    "#FFB74D": { label: "Anxiety", emoji: "😰" },
    "#90CAF9": { label: "Sadness", emoji: "😢" },
    "#E57373": { label: "Anger", emoji: "😤" },
    "#CE93D8": { label: "Shame", emoji: "😳" },
    "#A5D6A7": { label: "Exhaustion", emoji: "😴" },
    "#80CBC4": { label: "Peace", emoji: "😌" },
};

const BODY_EMOJI: Record<string, string> = {
    Head: "🧠", "Throat & Jaw": "😶", Shoulders: "💪",
    "Chest & Heart": "💗", "Stomach & Gut": "🫁",
    Back: "🦴", "Legs & Whole Body": "🦵",
};

function getDominantColor(emotionStr?: string) {
    if (!emotionStr) return "#80CBC4";
    const emotions = emotionStr.split(",").map((e) => e.trim());
    const counts: Record<string, number> = {};
    emotions.forEach((e) => {
        const c = EC[e] || "#80CBC4";
        counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

// ─── SAMPLE DATA ─────────────────────────────────────────────



// ─── CALENDAR HELPERS ────────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function getCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
}

function dateKey(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatEntryTime(entryDate: any) {
    const d = entryDate?.toDate ? entryDate.toDate() : new Date(entryDate);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

// ─── ENTRY CARD (for expanded day) ───────────────────────────

function MiniEntryCard({ entry, isOnly }: { entry: any; isOnly: boolean }) {
    const [expanded, setExpanded] = useState(isOnly);
    const color = getDominantColor(entry.emotions);
    const meta = MOOD_META[color] || { label: "Mixed", emoji: "💭" };
    const emotions = entry.emotions ? entry.emotions.split(",").map((e: string) => e.trim()) : [];
    const hasReflection = entry.reflections?.trim().length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    width: "100%", textAlign: "left", cursor: "pointer",
                    padding: 0, border: "none", background: "none",
                }}
            >
                <div style={{
                    display: "flex",
                    borderRadius: 16,
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.025)",
                    border: `1px solid ${expanded ? color + "25" : "rgba(255,255,255,0.05)"}`,
                    transition: "all 0.3s ease",
                }}>
                    {/* Color bar */}
                    <div style={{
                        width: 4, flexShrink: 0,
                        background: `linear-gradient(180deg, ${color}, ${color}50)`,
                    }} />

                    <div style={{ flex: 1, padding: "14px 16px 14px 14px" }}>
                        {/* Header row */}
                        <div style={{
                            display: "flex", alignItems: "center",
                            justifyContent: "space-between", marginBottom: 8,
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 16 }}>{meta.emoji}</span>
                                <span style={{
                                    fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
                                    textTransform: "uppercase", color: color, opacity: 0.7,
                                }}>{meta.label}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {entry.bodyArea && (
                                    <span style={{
                                        fontSize: 11, color: "rgba(255,255,255,0.2)",
                                        display: "flex", alignItems: "center", gap: 3,
                                    }}>
                                        <span style={{ fontSize: 13 }}>{BODY_EMOJI[entry.bodyArea] || "🫀"}</span>
                                        {entry.bodyArea}
                                    </span>
                                )}
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.18)" }}>
                                    {formatEntryTime(entry.createdAt || entry.date)}
                                </span>
                            </div>
                        </div>

                        {/* Thought */}
                        <p style={{
                            fontSize: 16, fontFamily: "Georgia, serif", fontStyle: "italic",
                            color: "rgba(255,255,255,0.7)", lineHeight: 1.5, margin: 0,
                        }}>
                            "{entry.thoughts}"
                        </p>

                        {/* Emotion pills */}
                        {emotions.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
                                {emotions.map((e: string) => (
                                    <span key={e} style={{
                                        padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 500,
                                        background: (EC[e] || color) + "12",
                                        border: `1px solid ${(EC[e] || color)}20`,
                                        color: EC[e] || color,
                                    }}>{e}</span>
                                ))}
                            </div>
                        )}

                        {/* Hint for witness */}
                        {!expanded && hasReflection && (
                            <div style={{
                                marginTop: 8, display: "flex", alignItems: "center", gap: 5,
                            }}>
                                <span style={{ fontSize: 10, color: "rgba(171,206,201,0.3)" }}>✦</span>
                                <span style={{ fontSize: 11, color: "rgba(171,206,201,0.25)" }}>
                                    Witness reflection — tap to read
                                </span>
                            </div>
                        )}

                        {/* Expanded: witness + body */}
                        <AnimatePresence>
                            {expanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    style={{ overflow: "hidden" }}
                                >
                                    <div style={{
                                        height: 1, background: "rgba(255,255,255,0.04)",
                                        margin: "12px 0",
                                    }} />

                                    {entry.bodySensations && (
                                        <div style={{ marginBottom: 10 }}>
                                            <p style={{
                                                fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
                                                textTransform: "uppercase", color: "rgba(255,255,255,0.15)",
                                                marginBottom: 3,
                                            }}>BODY</p>
                                            <p style={{
                                                fontSize: 13, color: "rgba(255,255,255,0.35)",
                                                fontFamily: "Georgia, serif",
                                            }}>
                                                {entry.bodyArea}: {entry.bodySensations}
                                            </p>
                                        </div>
                                    )}

                                    {hasReflection && (
                                        <div style={{
                                            padding: "12px 14px", borderRadius: 12,
                                            background: "rgba(171,206,201,0.03)",
                                            borderLeft: "3px solid rgba(171,206,201,0.12)",
                                        }}>
                                            <div style={{
                                                display: "flex", alignItems: "center", gap: 5, marginBottom: 6,
                                            }}>
                                                <span style={{ fontSize: 12 }}>✦</span>
                                                <span style={{
                                                    fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
                                                    textTransform: "uppercase", color: "rgba(171,206,201,0.35)",
                                                }}>WITNESS</span>
                                            </div>
                                            <p style={{
                                                fontSize: 14, color: "rgba(171,206,201,0.55)",
                                                fontFamily: "Georgia, serif", lineHeight: 1.7, fontStyle: "italic",
                                            }}>{entry.reflections}</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </button>
        </motion.div>
    );
}

// ─── MAIN CALENDAR COMPONENT ─────────────────────────────────

export default function JournalCalendar({ entries }: { entries: any[] }) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

    const entryMap = useMemo(() => {
        const map: Record<string, any[]> = {};
        entries.forEach((e) => {
            const rawDate = e.createdAt?.toDate?.() || new Date(e.date || Date.now());
            if (isNaN(rawDate.getTime())) return;
            const d = new Date(rawDate);
            const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
            if (!map[key]) map[key] = [];
            map[key].push(e);
        });
        return map;
    }, [entries]);

    // Color for a day dot (dominant emotion of first entry)
    const dayColor = (day: number) => {
        const key = dateKey(viewYear, viewMonth, day);
        const entries = entryMap[key];
        if (!entries || entries.length === 0) return null;
        return getDominantColor(entries[0].emotions);
    };

    const cells = getCalendarDays(viewYear, viewMonth);
    const selKey = selectedDay ? dateKey(viewYear, viewMonth, selectedDay) : "";
    const selectedEntries = selKey ? (entryMap[selKey] || []) : [];

    const isToday = (day: number) =>
        day === today.getDate() &&
        viewMonth === today.getMonth() &&
        viewYear === today.getFullYear();

    const isSelected = (day: number) => day === selectedDay;

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
        else setViewMonth(viewMonth - 1);
        setSelectedDay(null);
    };

    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
        else setViewMonth(viewMonth + 1);
        setSelectedDay(null);
    };

    // Count entries this month
    const monthEntryCount = useMemo(() => {
        let count = 0;
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const key = dateKey(viewYear, viewMonth, d);
            if (entryMap[key]) count += entryMap[key].length;
        }
        return count;
    }, [viewYear, viewMonth, entryMap]);

    return (
        <div
            className="w-full min-h-screen rounded-[40px] overflow-hidden"
            style={{
                background: "radial-gradient(ellipse at 50% 15%, #1a0a2e 0%, #0d0014 50%, #050008 100%)",
                fontFamily: "Georgia, 'Times New Roman', serif",
            }}
        >
            <div
                className="relative z-10 w-full max-w-xl mx-auto px-4"
                style={{ paddingTop: 28, paddingBottom: 100 }}
            >
                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                    <p style={{
                        fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase",
                        color: "rgba(171,206,201,0.3)", marginBottom: 6,
                    }}>YOUR REFLECTIONS</p>
                    <h1 style={{
                        fontSize: 28, fontWeight: 300,
                        color: "rgba(255,255,255,0.8)", margin: 0,
                    }}>Journal</h1>
                </div>

                {/* Month navigation */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: 20, padding: "0 4px",
                }}>
                    <button
                        onClick={prevMonth}
                        style={{
                            width: 44, height: 44, borderRadius: 14,
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            color: "rgba(255,255,255,0.4)", cursor: "pointer",
                            fontSize: 18, display: "flex", alignItems: "center",
                            justifyContent: "center",
                        }}
                    >←</button>

                    <div style={{ textAlign: "center" }}>
                        <p style={{
                            fontSize: 20, fontWeight: 400,
                            color: "rgba(255,255,255,0.7)", margin: 0,
                        }}>
                            {MONTHS[viewMonth]} {viewYear}
                        </p>
                        <p style={{
                            fontSize: 12, color: "rgba(255,255,255,0.2)",
                            marginTop: 2,
                        }}>
                            {monthEntryCount} {monthEntryCount === 1 ? "reflection" : "reflections"}
                        </p>
                    </div>

                    <button
                        onClick={nextMonth}
                        style={{
                            width: 44, height: 44, borderRadius: 14,
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            color: "rgba(255,255,255,0.4)", cursor: "pointer",
                            fontSize: 18, display: "flex", alignItems: "center",
                            justifyContent: "center",
                        }}
                    >→</button>
                </div>

                {/* Calendar grid */}
                <div style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 20,
                    padding: "16px 12px 12px",
                    marginBottom: 20,
                }}>
                    {/* Day names */}
                    <div style={{
                        display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
                        gap: 0, marginBottom: 8,
                    }}>
                        {DAYS.map((d) => (
                            <div key={d} style={{
                                textAlign: "center", fontSize: 11, fontWeight: 600,
                                letterSpacing: "0.05em", color: "rgba(255,255,255,0.18)",
                                padding: "4px 0",
                            }}>{d}</div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div style={{
                        display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
                        gap: 4,
                    }}>
                        {cells.map((day, i) => {
                            if (day === null) {
                                return <div key={`empty-${i}`} style={{ height: 52 }} />;
                            }

                            const color = dayColor(day);
                            const hasEntry = !!color;
                            const isTod = isToday(day);
                            const isSel = isSelected(day);

                            return (
                                <motion.button
                                    key={day}
                                    whileTap={hasEntry ? { scale: 0.92 } : {}}
                                    onClick={() => hasEntry && setSelectedDay(isSel ? null : day)}
                                    style={{
                                        width: "100%", height: 52, borderRadius: 14,
                                        border: isSel
                                            ? `2px solid ${color || "rgba(209,107,165,0.4)"}`
                                            : isTod
                                                ? "2px solid rgba(209,107,165,0.2)"
                                                : "1.5px solid transparent",
                                        background: isSel
                                            ? (color || "#C65F9D") + "12"
                                            : isTod
                                                ? "rgba(209,107,165,0.05)"
                                                : "transparent",
                                        cursor: hasEntry ? "pointer" : "default",
                                        display: "flex", flexDirection: "column",
                                        alignItems: "center", justifyContent: "center",
                                        gap: 3, padding: 0,
                                        transition: "all 0.25s ease",
                                    }}
                                >
                                    {/* Day number */}
                                    <span style={{
                                        fontSize: 15,
                                        fontWeight: isTod || isSel ? 700 : 400,
                                        color: isSel
                                            ? color || "rgba(209,107,165,0.9)"
                                            : isTod
                                                ? "rgba(209,107,165,0.7)"
                                                : hasEntry
                                                    ? "rgba(255,255,255,0.6)"
                                                    : "rgba(255,255,255,0.15)",
                                        fontFamily: "Georgia, serif",
                                        lineHeight: 1,
                                    }}>{day}</span>

                                    {/* Mood dot */}
                                    {hasEntry && (
                                        <div style={{
                                            width: 7, height: 7, borderRadius: "50%",
                                            background: color,
                                            boxShadow: isSel ? `0 0 8px ${color}60` : "none",
                                            transition: "all 0.3s ease",
                                        }} />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Mood legend */}
                <div style={{
                    display: "flex", flexWrap: "wrap", gap: 10,
                    justifyContent: "center", marginBottom: 24,
                    padding: "0 8px",
                }}>
                    {Object.entries(MOOD_META).map(([color, { label }]) => (
                        <div key={color} style={{
                            display: "flex", alignItems: "center", gap: 4,
                        }}>
                            <div style={{
                                width: 7, height: 7, borderRadius: "50%",
                                background: color,
                            }} />
                            <span style={{
                                fontSize: 10, color: "rgba(255,255,255,0.2)",
                                letterSpacing: "0.02em",
                            }}>{label}</span>
                        </div>
                    ))}
                </div>

                {/* Selected day entries */}
                <AnimatePresence mode="wait">
                    {selectedDay && selectedEntries.length > 0 && (
                        <motion.div
                            key={selKey}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                        >
                            {/* Day header */}
                            <div style={{
                                display: "flex", alignItems: "center", gap: 10,
                                marginBottom: 12, padding: "0 4px",
                            }}>
                                <span style={{
                                    fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
                                    textTransform: "uppercase", color: "rgba(255,255,255,0.2)",
                                }}>
                                    {new Date(viewYear, viewMonth, selectedDay).toLocaleDateString(
                                        "en-US",
                                        { weekday: "long", month: "long", day: "numeric" }
                                    )}
                                </span>
                                <div style={{
                                    flex: 1, height: 1, background: "rgba(255,255,255,0.04)",
                                }} />
                                <span style={{
                                    fontSize: 11, color: "rgba(255,255,255,0.12)",
                                }}>
                                    {selectedEntries.length} {selectedEntries.length === 1 ? "entry" : "entries"}
                                </span>
                            </div>

                            {/* Entry cards */}
                            <div className="flex flex-col gap-3">
                                {selectedEntries.map((entry) => (
                                    <MiniEntryCard
                                        key={entry.id}
                                        entry={entry}
                                        isOnly={selectedEntries.length === 1}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {selectedDay && selectedEntries.length === 0 && (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ textAlign: "center", padding: "30px 0" }}
                        >
                            <p style={{
                                fontSize: 14, color: "rgba(255,255,255,0.2)",
                                fontStyle: "italic",
                            }}>No reflections on this day</p>
                        </motion.div>
                    )}

                    {!selectedDay && (
                        <motion.div
                            key="prompt"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ textAlign: "center", padding: "24px 0" }}
                        >
                            <p style={{
                                fontSize: 14, color: "rgba(255,255,255,0.15)",
                                fontStyle: "italic",
                            }}>
                                Tap a day with a colored dot to see your reflection
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <p style={{
                    textAlign: "center", fontSize: 10,
                    color: "rgba(255,255,255,0.06)", marginTop: 40,
                }}>Each dot is a moment of witnessing</p>
            </div>
        </div>
    );
}
