import { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import { differenceInDays, parseISO, isValid, max, format } from 'date-fns';
import { Award, Briefcase, Users } from 'lucide-react';

const COLORS: Record<string, string> = {
  tf: 'rgb(178, 7, 56)',
  ayy: 'rgb(111, 0, 117)',
  hankkijat: 'rgb(242, 143, 5)',
  stf: 'rgb(0, 4, 126)',
};

const DEFAULT_START_DATE = new Date('2014-09-01');
const PIXELS_PER_DAY = 1.0; 

interface EventRecord {
  name: string;
  organisation: string;
  type: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface ParsedEvent extends EventRecord {
  id: number;
  startDate: Date;
  endDate: Date;
  durationDays: number;
  topOffsetPixels: number;
  heightPixels: number;
  lane: number;
}

export default function App() {
  const [events, setEvents] = useState<ParsedEvent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCSV = async () => {
      try {
        const res = await fetch('/sample.csv');
        if (!res.ok) throw new Error('Failed to load sample.csv');
        const text = await res.text();
        Papa.parse<EventRecord>(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            processEvents(results.data);
          },
          error: (err: any) => setLoadError(err.message),
        });
      } catch (e: any) {
        setLoadError(e.message);
      }
    };
    fetchCSV();
  }, []);

  const processEvents = (raw: EventRecord[]) => {
    const baseEvents = raw.map((item, idx) => {
      let st = parseISO(item.start_date);
      if (!isValid(st)) st = new Date();
      
      let ed = item.end_date ? parseISO(item.end_date) : st;
      if (!isValid(ed)) ed = st;
      
      return {
        ...item,
        id: idx,
        startDate: st,
        endDate: ed,
      };
    });

    baseEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    const lanes: Date[] = [];
    const processed: ParsedEvent[] = [];

    for (const ev of baseEvents) {
      let assignedLane = 0;
      for (let i = 0; i < lanes.length; i++) {
        const bufferedEnd = new Date(lanes[i]);
        bufferedEnd.setDate(bufferedEnd.getDate() + 5);

        if (bufferedEnd <= ev.startDate) {
          assignedLane = i;
          break;
        }
        assignedLane = i + 1;
      }
      
      const st = Math.max(ev.startDate.getTime(), DEFAULT_START_DATE.getTime());
      lanes[assignedLane] = ev.endDate.getTime() > st ? ev.endDate : new Date(st);

      const relativeDaysStart = differenceInDays(ev.startDate, DEFAULT_START_DATE);
      const topOffsetPixels = relativeDaysStart * PIXELS_PER_DAY;
      
      let rawDuration = differenceInDays(ev.endDate, ev.startDate);
      if (rawDuration < 0) rawDuration = 0;
      
      const heightPixels = Math.max(rawDuration * PIXELS_PER_DAY, ev.type === 'decoration' ? 40 : 20);

      processed.push({
        ...ev,
        lane: assignedLane,
        durationDays: rawDuration,
        topOffsetPixels,
        heightPixels,
      });
    }

    setEvents(processed);
  };

  const timelineHeight = useMemo(() => {
    if (events.length === 0) return 1000;
    const maxDate = max(events.map(e => e.endDate));
    return differenceInDays(maxDate, DEFAULT_START_DATE) * PIXELS_PER_DAY + 200;
  }, [events]);

  if (loadError) return <div className="p-8 text-red-500">Error: {loadError}</div>;
  if (!events.length) return <div className="p-8 text-slate-400 text-center mt-10">Loading timeline...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans overflow-x-hidden">
      <header className="max-w-4xl mx-auto mb-16 text-center mt-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">Student Activity Timeline</h1>
        <p className="text-slate-500 text-lg">A chronicle of functionary, group, and decorative achievements stretching back to {DEFAULT_START_DATE.getFullYear()}.</p>
      </header>

      <div className="relative max-w-4xl mx-auto mt-10">
        <div className="absolute left-4 md:left-24 top-0 bottom-0 w-1 bg-slate-200 rounded-full z-0"></div>

        <div className="relative w-full" style={{ height: timelineHeight }}>
          {events.map((ev) => {
            const orgColor = COLORS[ev.organisation] || '#64748b';
            const isDecoration = ev.type === 'decoration';
            const isFunctionary = ev.type === 'functionary';
            
            const laneLeftOffset = ev.lane * 320;

            return (
              <div
                key={ev.id}
                className="absolute transition-all duration-500 z-10 hover:z-50"
                style={{
                  top: ev.topOffsetPixels,
                  height: isDecoration ? 'auto' : ev.heightPixels,
                  left: `calc(3rem + 24px + ${laneLeftOffset}px)`,
                  width: '300px', 
                }}
              >
                <div 
                  className="absolute hidden md:block w-px border-t border-dashed border-slate-300" 
                  style={{
                    left: `-${24 + laneLeftOffset}px`, 
                    top: '20px', 
                    width: `${24 + laneLeftOffset}px`,
                    zIndex: -1 
                  }}
                />

                {isDecoration ? (
                  <div className="flex items-center gap-3 bg-white p-3 rounded-full shadow-md border-2 transform transition-transform hover:scale-105" style={{ borderColor: orgColor }}>
                    <div className="p-2 rounded-full text-white" style={{ backgroundColor: orgColor }}>
                      <Award size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 leading-tight text-sm">{ev.name}</h3>
                      <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: orgColor }}>{ev.organisation} • {ev.type}</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`timeline-event-card h-full w-full flex flex-col justify-between overflow-hidden relative ${isFunctionary ? 'bg-white shadow-md border border-slate-200' : 'bg-white/70 border border-slate-200/50 backdrop-blur-sm'}`}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: orgColor }} />

                    <div className="pl-3 relative z-10 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isFunctionary ? <Briefcase size={14} style={{ color: orgColor }} /> : <Users size={14} style={{ color: orgColor }} />}
                        <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: orgColor }}>
                          {ev.organisation} • {ev.type}
                        </span>
                      </div>
                      <h3 className={`font-bold text-slate-900 leading-tight ${isFunctionary ? 'text-base' : 'text-sm'}`}>
                        {ev.name}
                      </h3>
                      {ev.description && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{ev.description}</p>
                      )}
                    </div>
                    
                    <div className="pl-3 mt-4 text-[10px] font-semibold text-slate-400 bg-slate-50/50 border-t border-slate-100 p-2 -mx-4 -mb-4">
                      {format(ev.startDate, 'MMM yyyy')} — {format(ev.endDate, 'MMM yyyy')}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
