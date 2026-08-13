const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

interface WorkingHour {
  day: string;
  isOff: boolean;
  startTime: string;
  endTime: string;
}

export function WorkingHoursTable({ workingHours }: { workingHours: WorkingHour[] }) {
  const byDay = new Map(workingHours.map((wh) => [wh.day, wh]));

  return (
    <table className="w-full text-sm">
      <tbody className="divide-y divide-border">
        {DAY_ORDER.map((day) => {
          const wh = byDay.get(day);
          return (
            <tr key={day}>
              <td className="py-2 text-text-secondary">{DAY_LABELS[day]}</td>
              <td className="py-2 text-right text-text-primary">
                {!wh || wh.isOff ? (
                  <span className="text-text-muted">Closed</span>
                ) : (
                  `${wh.startTime} – ${wh.endTime}`
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
