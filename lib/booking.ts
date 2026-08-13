import { connectDB } from '@/lib/db';
import { Barber } from '@/models/Barber';
import { Appointment } from '@/models/Appointment';

const SLOT_INTERVAL_MINUTES = 15;
/** Don't let customers book within this many minutes of "now" for today. */
const MIN_LEAD_TIME_MINUTES = 60;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function isDateInVacation(date: Date, vacations: { startDate: Date; endDate: Date }[]): boolean {
  return vacations.some((v) => date >= new Date(v.startDate) && date <= new Date(v.endDate));
}

function dayNameFor(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

/**
 * Returns available start times ("HH:MM") for a given barber, calendar
 * date, and total service duration. A slot is available only if it:
 *  - falls within the barber's working hours for that weekday
 *  - does not overlap any of the barber's breaks
 *  - does not fall within a vacation range
 *  - does not overlap an existing non-cancelled/no-show appointment
 *  - (for today) is not in the past / within the minimum lead time
 */
export async function getAvailableSlots(
  barberId: string,
  dateStr: string,
  durationMinutes: number
): Promise<string[]> {
  await connectDB();

  const barber = await Barber.findById(barberId).lean();
  if (!barber || barber.status !== 'active') return [];

  const date = new Date(`${dateStr}T00:00:00`);
  if (isDateInVacation(date, barber.vacations)) return [];

  const dayName = dayNameFor(date);
  const hours = barber.workingHours.find((wh) => wh.day === dayName);
  if (!hours || hours.isOff) return [];

  const dayStart = timeToMinutes(hours.startTime);
  const dayEnd = timeToMinutes(hours.endTime);
  const breaks = hours.breaks.map((b) => ({ start: timeToMinutes(b.startTime), end: timeToMinutes(b.endTime) }));

  // Existing bookings for this barber on this date that block the slot
  const startOfDay = new Date(`${dateStr}T00:00:00`);
  const endOfDay = new Date(`${dateStr}T23:59:59`);
  const existing = await Appointment.find({
    barber: barberId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: ['cancelled', 'no_show'] },
  })
    .select('startTime endTime')
    .lean();

  const bookedRanges = existing.map((a) => ({
    start: timeToMinutes(a.startTime),
    end: timeToMinutes(a.endTime),
  }));

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const earliestMinutesToday = now.getHours() * 60 + now.getMinutes() + MIN_LEAD_TIME_MINUTES;

  const slots: string[] = [];
  for (let start = dayStart; start + durationMinutes <= dayEnd; start += SLOT_INTERVAL_MINUTES) {
    const end = start + durationMinutes;

    if (isToday && start < earliestMinutesToday) continue;
    if (breaks.some((b) => rangesOverlap(start, end, b.start, b.end))) continue;
    if (bookedRanges.some((b) => rangesOverlap(start, end, b.start, b.end))) continue;

    slots.push(minutesToTime(start));
  }

  return slots;
}

/** Validates that a specific requested start time is still free (race-condition guard at booking time). */
export async function isSlotAvailable(
  barberId: string,
  dateStr: string,
  startTime: string,
  durationMinutes: number
): Promise<boolean> {
  const slots = await getAvailableSlots(barberId, dateStr, durationMinutes);
  return slots.includes(startTime);
}

export { timeToMinutes, minutesToTime };
