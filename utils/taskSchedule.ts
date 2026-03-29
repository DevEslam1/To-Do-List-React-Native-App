export const DEFAULT_DURATION_MINUTES = 30;
export const DEFAULT_START_TIME = '09:00';

const pad = (value: number) => String(value).padStart(2, '0');

export const getTodayDateKey = (date = new Date()) => date.toISOString().split('T')[0];

export const getRoundedCurrentTime = (date = new Date()) => {
  const rounded = new Date(date);
  const minutes = rounded.getMinutes();
  const remainder = minutes % 15;

  if (remainder !== 0) {
    rounded.setMinutes(minutes + (15 - remainder));
  }

  rounded.setSeconds(0);
  rounded.setMilliseconds(0);

  return `${pad(rounded.getHours())}:${pad(rounded.getMinutes())}`;
};

export const buildDefaultSchedule = (date = new Date()) => ({
  dueDate: getTodayDateKey(date),
  startTime: getRoundedCurrentTime(date),
  durationMinutes: DEFAULT_DURATION_MINUTES,
});

export const normalizeDateKey = (
  value: string | undefined | null,
  fallback = getTodayDateKey()
) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return fallback;
};

export const normalizeTimeValue = (
  value: string | undefined | null,
  fallback = DEFAULT_START_TIME
) => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const match = value.trim().match(/^(\d{1,2}):(\d{1,2})$/);
  if (!match) {
    return fallback;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours > 23 || minutes > 59) {
    return fallback;
  }

  return `${pad(hours)}:${pad(minutes)}`;
};

export const normalizeDurationMinutes = (
  value: number | string | undefined | null,
  fallback = DEFAULT_DURATION_MINUTES
) => {
  const numericValue = typeof value === 'string' ? Number(value) : value;

  if (
    typeof numericValue !== 'number' ||
    Number.isNaN(numericValue) ||
    !Number.isFinite(numericValue)
  ) {
    return fallback;
  }

  return Math.min(720, Math.max(5, Math.round(numericValue)));
};

export const formatStartTime = (timeValue: string) => {
  const normalizedTime = normalizeTimeValue(timeValue);
  const baseDate = getTodayDateKey();
  const parsedDate = new Date(`${baseDate}T${normalizedTime}:00`);

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsedDate);
};

export const formatDuration = (minutes: number) => {
  const normalizedMinutes = normalizeDurationMinutes(minutes);
  const hours = Math.floor(normalizedMinutes / 60);
  const remainingMinutes = normalizedMinutes % 60;

  if (hours === 0) {
    return `${normalizedMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

export const formatTaskDate = (dateValue: string) => {
  const normalizedDate = normalizeDateKey(dateValue);
  const parsedDate = new Date(`${normalizedDate}T09:00:00`);
  const today = getTodayDateKey();

  if (normalizedDate === today) {
    return 'Today';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(parsedDate);
};

export const formatFocusCountdown = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${pad(minutes)}:${pad(seconds)}`;
};
