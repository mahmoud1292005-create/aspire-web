import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarView({ value, onChange, tileContent }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <Calendar onChange={onChange} value={value} tileContent={tileContent} />
    </div>
  );
}
