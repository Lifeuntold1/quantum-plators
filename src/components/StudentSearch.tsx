import React, { useState, useMemo } from 'react';

interface StudentCard {
  slug: string;
  fullName?: string;
  nickname?: string;
  matricNumber?: string;
  stateOfOrigin?: string;
  hobbies?: string;
  photoUrl?: string | null;
  nominationsCount?: number;
  isCompleteProfile?: boolean;
}

interface StudentSearchProps {
  initialStudents: StudentCard[];
}

export const StudentSearch: React.FC<StudentSearchProps> = ({ initialStudents = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<'all' | 'nominated' | 'completed'>('all');

  const filteredStudents = useMemo(() => {
    let result = initialStudents;

    if (activeFilter === 'nominated') {
      result = result.filter(s => (s.nominationsCount || 0) > 0);
    } else if (activeFilter === 'completed') {
      result = result.filter(s => s.isCompleteProfile);
    }

    if (!searchQuery.trim()) return result;
    
    const query = searchQuery.toLowerCase().trim();
    return result.filter((student) => {
      const nameMatch = student.fullName?.toLowerCase().includes(query);
      const matricMatch = student.matricNumber?.toLowerCase().includes(query);
      const nicknameMatch = student.nickname?.toLowerCase().includes(query);
      return nameMatch || matricMatch || nicknameMatch;
    });
  }, [initialStudents, searchQuery, activeFilter]);

  return (
    <div className="w-full flex flex-col gap-10">
      {/* Search & Filter Controls Island */}
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
        <div className="relative flex items-center">
          <svg
            className="absolute left-5 w-5 h-5 text-muted pointer-events-none transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, nickname, or matric number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-24 py-4 rounded-2xl bg-surface border border-white/[0.12] text-text placeholder-muted text-base font-body focus:outline-none focus:border-gold-500 transition-all shadow-xl hover:border-white/[0.2]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search query"
              className="absolute right-5 px-3 py-1 rounded-lg bg-white/[0.06] text-muted hover:text-text transition-colors text-xs font-mono uppercase tracking-wider"
            >
              Reset
            </button>
          )}
        </div>

        {/* Filter Tabs & Counter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-2 bg-white/[0.02] p-1.5 rounded-xl border border-white/[0.06] w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold transition-all ${
                activeFilter === 'all' ? 'bg-gold-500 text-ink-950 shadow-md' : 'text-muted hover:text-text'
              }`}
            >
              All Students ({initialStudents.length})
            </button>
            <button
              onClick={() => setActiveFilter('nominated')}
              className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold transition-all ${
                activeFilter === 'nominated' ? 'bg-gold-500 text-ink-950 shadow-md' : 'text-muted hover:text-text'
              }`}
            >
              Award Nominees ({initialStudents.filter(s => (s.nominationsCount || 0) > 0).length})
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold transition-all ${
                activeFilter === 'completed' ? 'bg-gold-500 text-ink-950 shadow-md' : 'text-muted hover:text-text'
              }`}
            >
              Complete Profiles ({initialStudents.filter(s => s.isCompleteProfile).length})
            </button>
          </div>

          <span className="font-mono text-xs text-muted">
            Showing <strong className="text-gold-400 font-semibold">{filteredStudents.length}</strong> student{filteredStudents.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Results Grid */}
      {filteredStudents.length === 0 ? (
        <div className="w-full py-20 px-6 text-center rounded-3xl bg-surface/80 border border-white/[0.08] max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-radial-gold opacity-20 pointer-events-none"></div>
          <p className="font-display text-2xl sm:text-3xl font-semibold text-text mb-2">No matching students found</p>
          <p className="font-body text-base text-muted max-w-md mx-auto leading-relaxed">
            {activeFilter !== 'all'
              ? `No students match the "${activeFilter.toUpperCase()}" filter with your current search.`
              : `We couldn't find any student matching "${searchQuery}". Try double-checking the spelling or matric number!`
            }
          </p>
          <button
            onClick={() => { setSearchQuery(""); setActiveFilter('all'); }}
            className="mt-6 px-6 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono uppercase tracking-widest text-gold-300 border border-white/[0.1] transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map((student) => (
            <a
              key={student.slug}
              href={`/students/${student.slug}`}
              className="group relative rounded-2xl bg-surface border border-white/[0.08] hover:border-gold-500/40 p-6 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden"
              style={{
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              {/* Subtle accent glow on card hover */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-radial-gold opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"></div>

              <div>
                {/* Header Labels */}
                <div className="flex items-center justify-between gap-2 mb-5">
                  <span className="px-2.5 py-1 rounded-md bg-ink-950 border border-white/[0.1] font-mono text-[11px] font-bold tracking-wider text-gold-300 shadow-inner">
                    {student.matricNumber || "PHYS/2024"}
                  </span>
                  {student.nominationsCount ? (
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-md bg-gold-500/20 text-gold-300 border border-gold-500/30 font-bold animate-pulse">
                      ★ Nominee
                    </span>
                  ) : null}
                </div>

                {/* Portrait or High-Aesthetic Roster Fallback */}
                {student.photoUrl ? (
                  <div className="w-full aspect-[4/5] rounded-xl overflow-hidden mb-5 bg-ink-950 border border-white/[0.1] shadow-lg relative">
                    <img
                      src={student.photoUrl}
                      alt={student.fullName || "Physicist portrait"}
                      className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="w-full aspect-[4/5] rounded-xl bg-gradient-to-br from-ink-950 via-ink-900 to-surface border border-white/[0.08] mb-5 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group-hover:border-gold-500/30 transition-all duration-500 shadow-inner">
                    <div className="absolute inset-0 bg-radial-gold opacity-25 group-hover:opacity-40 transition-opacity"></div>
                    
                    {/* Monogram Ring */}
                    <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-gold-500/30 flex items-center justify-center font-display text-3xl font-bold text-gold-300 mb-4 shadow-xl group-hover:scale-110 transition-transform duration-500">
                      {(student.fullName || student.matricNumber || "Q")[0]?.toUpperCase()}
                    </div>
                    
                    <span className="font-mono text-[11px] uppercase tracking-widest text-text font-semibold">
                      Class of 2024 Roster
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-gold-400/80 mt-1 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
                      {student.isCompleteProfile ? "Complete Profile" : "Roster Verified"}
                    </span>
                  </div>
                )}

                {/* Name & Nickname */}
                <h3 className="font-display text-xl font-bold text-text group-hover:text-gold-300 transition-colors tracking-tight line-clamp-1">
                  {student.fullName || student.matricNumber || "Verified Student Record"}
                </h3>
                {student.nickname ? (
                  <p className="font-body text-sm text-gold-400 italic mt-1 line-clamp-1">
                    "{student.nickname}"
                  </p>
                ) : (
                  <p className="font-body text-xs text-muted mt-1 italic opacity-70">
                    Department of Physics
                  </p>
                )}
              </div>

              {/* Footer CTA Link */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono font-semibold text-muted group-hover:text-gold-300 transition-colors">
                <span>View Profile</span>
                <span className="text-gold-400 font-bold group-hover:translate-x-1.5 transition-transform duration-300">→</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentSearch;
