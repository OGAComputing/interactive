// Which Classroom topic a hub assignment goes under when the topic box says "Automatic".
//   - The first lesson of a unit goes under a topic named after the unit (the hub's topic
//     label, e.g. "Python Unit 2"), which the hub creates in the class if it isn't there.
//   - Any other page goes under the unit's topic if the class has one, otherwise under the
//     topic of the class's most recent assignment, otherwise none.
// Pure functions, tested by hub-topics.test.js; index.html calls them via window.HubTopics.

export const AUTO = '__auto__';
export const NONE = '__none__';

const norm = s => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

// A sortable number for a lesson: L2 → 2, L1.2 → 1.2, L4R (in-between lesson) → 4.5.
export function lessonOrder(a) {
  const n = Number(a.lesson_num);
  const s = a.lesson_suffix || '';
  if (s.startsWith('.')) return n + (Number('0' + s) || 0);
  return s ? n + 0.5 : n;
}

// True for a page in the earliest lesson folder of its unit (year + topic).
export function isFirstLesson(activity, activities) {
  if (!activity || activity.lesson_num == null) return false;
  const unit = activities.filter(a => a.year === activity.year && a.topic === activity.topic && a.lesson_num != null);
  return lessonOrder(activity) === Math.min(...unit.map(lessonOrder));
}

export function findTopic(topics, name) {
  const n = norm(name);
  return n ? topics.find(t => norm(t.name) === n) || null : null;
}

// The topic of the most recently created assignment that has one ('' if none do).
export function lastTopicId(courseWork) {
  const withTopic = (courseWork || []).filter(w => w.topicId)
    .sort((a, b) => String(b.creationTime || '').localeCompare(String(a.creationTime || '')));
  return withTopic.length ? withTopic[0].topicId : '';
}

// → { topicId, name, why } to use an existing topic, { create: true, name, why } to make one,
//   or { topicId: '', name: '', why: 'none' }. why: 'first' | 'unit' | 'last' | 'none'.
export function chooseTopic({ activity, activities, topics, lastId }) {
  const unitName = activity && activity.topic;
  const unitTopic = findTopic(topics, unitName);
  if (isFirstLesson(activity, activities)) {
    return unitTopic
      ? { topicId: unitTopic.topicId, name: unitTopic.name, why: 'first' }
      : { create: true, name: String(unitName).trim(), why: 'first' };
  }
  if (unitTopic) return { topicId: unitTopic.topicId, name: unitTopic.name, why: 'unit' };
  const last = topics.find(t => t.topicId === lastId);
  if (last) return { topicId: last.topicId, name: last.name, why: 'last' };
  return { topicId: '', name: '', why: 'none' };
}
