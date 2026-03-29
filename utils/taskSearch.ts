import { Task } from '../store/tasksSlice';
import { formatDuration, formatStartTime, formatTaskDate } from './taskSchedule';

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s:-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const includesToken = (haystack: string, token: string) =>
  haystack.includes(token) || haystack.split(' ').some((part) => part.startsWith(token));

export const scoreTaskSearchMatch = (task: Task, rawQuery: string) => {
  const query = normalize(rawQuery);
  if (!query) {
    return null;
  }

  const tokens = query.split(' ').filter(Boolean);
  if (tokens.length === 0) {
    return null;
  }

  const title = normalize(task.title);
  const description = normalize(task.description);
  const tag = normalize(task.tag);
  const priority = normalize(task.priority);
  const schedule = normalize(
    `${formatTaskDate(task.dueDate)} ${formatStartTime(task.startTime)} ${formatDuration(
      task.durationMinutes
    )}`
  );
  const focus = task.focusModeEnabled ? 'focus mode focus session timer' : '';

  let score = 0;
  let matchedTokens = 0;

  if (title === query) {
    score += 140;
  } else if (title.startsWith(query)) {
    score += 110;
  } else if (title.includes(query)) {
    score += 90;
  }

  if (description.includes(query)) {
    score += 45;
  }

  if (tag === query) {
    score += 35;
  }

  for (const token of tokens) {
    let tokenMatched = false;

    if (includesToken(title, token)) {
      score += 26;
      tokenMatched = true;
    }

    if (includesToken(description, token)) {
      score += 12;
      tokenMatched = true;
    }

    if (includesToken(tag, token)) {
      score += 16;
      tokenMatched = true;
    }

    if (includesToken(priority, token)) {
      score += 10;
      tokenMatched = true;
    }

    if (includesToken(schedule, token)) {
      score += 9;
      tokenMatched = true;
    }

    if (includesToken(focus, token)) {
      score += 12;
      tokenMatched = true;
    }

    if (tokenMatched) {
      matchedTokens += 1;
    }
  }

  if (matchedTokens === 0) {
    return null;
  }

  if (matchedTokens === tokens.length) {
    score += 18;
  }

  return score;
};
