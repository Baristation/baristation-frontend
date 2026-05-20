import { CalendarDays, Clock, MapPin, Package } from 'lucide-react';

interface QuickInfoGridProps {
  region: string;
  city: string;
  place: string;
  duration: number;
  nextDate: string | null;
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '일정 미정';
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    }) +
    ' ' +
    d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  );
}

interface InfoCellProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoCell({ icon, label, value }: InfoCellProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="mb-1 flex items-center gap-2 text-[#A54729]">{icon}</div>
      <p className="font-outfit text-[10px] font-bold tracking-widest text-gray-500 uppercase">
        {label}
      </p>
      <p className="font-inter text-sm leading-snug font-bold text-gray-900">{value}</p>
    </div>
  );
}

export function QuickInfoGrid({ region, city, place, duration, nextDate }: QuickInfoGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <InfoCell
        icon={<MapPin className="h-5 w-5" />}
        label="장소"
        value={`${region} ${city} · ${place}`}
      />
      <InfoCell
        icon={<Clock className="h-5 w-5" />}
        label="소요 시간"
        // value={formatDuration(duration)}
        value={`${duration}분`}
      />
      <InfoCell
        icon={<CalendarDays className="h-5 w-5" />}
        label="다음 일정"
        value={formatDate(nextDate)}
      />
      <InfoCell
        icon={<Package className="h-5 w-5" />}
        label="준비물"
        value="편안한 복장 (재료 일체 제공)"
      />
    </div>
  );
}
