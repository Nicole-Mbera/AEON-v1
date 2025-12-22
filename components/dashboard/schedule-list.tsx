interface ScheduleItem {
  date: string;
  time: string;
  duration?: string;
  patient?: string;
  type?: string;
  title?: string;
  specialist?: string;
  status?: string;
  meeting_link?: string;
}

interface ScheduleListProps {
  heading: string;
  items: ReadonlyArray<ScheduleItem>;
}

export function ScheduleList({ heading, items }: ScheduleListProps) {
  return (
    <div className="rounded-3xl border border-white/20 bg-black p-6 shadow-[0_30px_80px_-60px_rgba(255,255,255,0.1)]">
      <h3 className="text-sm font-semibold text-white">{heading}</h3>
      <div className="mt-6 space-y-4">
        {items.map((item, index) => (
          <div
            key={`${item.date}-${item.time}-${index}`}
            className="rounded-2xl bg-white/10 px-4 py-3 transition-all hover:bg-white/15"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                  {item.date}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="text-sm font-semibold text-white">
                    {item.time}
                  </p>
                  {item.duration && (
                    <p className="text-xs text-white/60">
                      • {item.duration}
                    </p>
                  )}
                </div>
                {item.title && (
                  <p className="mt-1 text-sm text-white/70">{item.title}</p>
                )}
                {item.patient && (
                  <p className="text-sm text-white/70">With {item.patient}</p>
                )}
                {item.specialist && (
                  <p className="text-xs text-white/60">{item.specialist}</p>
                )}
                {item.type && (
                  <p className="text-xs text-white/60">{item.type}</p>
                )}
              </div>
              {item.status && (
                <span className="ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize"
                  style={{
                    backgroundColor: item.status === 'scheduled' ? '#22c55e' : '#eab308',
                    color: '#000000'
                  }}
                >
                  {item.status}
                </span>
              )}
            </div>
            {item.meeting_link && (
              <a
                href={item.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center text-xs font-medium text-white/70 hover:text-white"
              >
                Join Meeting →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}