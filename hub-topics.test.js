import { describe, it, expect } from 'vitest';
import { lessonOrder, isFirstLesson, findTopic, lastTopicId, chooseTopic } from './hub-topics.js';

const page = (topic, lesson_num, lesson_suffix = '', year = 'Year 8') => ({ year, topic, lesson_num, lesson_suffix, path: `${topic}/${lesson_num}${lesson_suffix}` });
const ACTS = [
  page('Python Unit 2', 1), page('Python Unit 2', 1), page('Python Unit 2', 2), page('Python Unit 2', 3),
  page('Data Representation', 1), page('Data Representation', 2),
  page('Python Unit 1', 4, 'R'), page('Python Unit 1', 4), page('Python Unit 1', 1),
  page('Component 1', 1, '.1', 'Year 10'), page('Component 1', 1, '.0', 'Year 10'), page('Component 1', 2, '.1', 'Year 10'),
  { year: 'Year 9', topic: 'Databases', lesson_num: null, lesson_suffix: '' },
  page('Python', 2, '', 'Year 9'),   // a unit whose Lesson 1 page isn't in the hub
];
const TOPICS = [{ topicId: 't-dr', name: 'Data Representation' }, { topicId: 't-wk', name: 'Week 3 homework' }];

describe('lessonOrder', () => {
  it('sorts plain, week.lesson and in-between lessons', () => {
    expect(lessonOrder(page('x', 2))).toBe(2);
    expect(lessonOrder(page('x', 1, '.2'))).toBeCloseTo(1.2);
    expect(lessonOrder(page('x', 4, 'R'))).toBe(4.5);
  });
});

describe('isFirstLesson', () => {
  it('is true for every page in the earliest lesson of its unit', () => {
    expect(isFirstLesson(ACTS[0], ACTS)).toBe(true);
    expect(isFirstLesson(ACTS[1], ACTS)).toBe(true);
    expect(isFirstLesson(ACTS[2], ACTS)).toBe(false);
  });
  it('counts L1.0 as first in week.lesson courses, and L4R as not', () => {
    expect(isFirstLesson(ACTS[10], ACTS)).toBe(true);
    expect(isFirstLesson(ACTS[9], ACTS)).toBe(false);
    expect(isFirstLesson(ACTS[6], ACTS)).toBe(false);
  });
  it('keeps units apart by year, and pages outside a lesson folder are never first', () => {
    expect(isFirstLesson(ACTS[13], ACTS)).toBe(true);   // Year 9 Python's earliest page in the hub
    expect(isFirstLesson(ACTS[12], ACTS)).toBe(false);
    expect(isFirstLesson(undefined, ACTS)).toBe(false);
  });
});

describe('findTopic', () => {
  it('matches names ignoring case and extra spaces', () => {
    expect(findTopic(TOPICS, '  data   representation ')).toBe(TOPICS[0]);
    expect(findTopic(TOPICS, 'Data')).toBe(null);
    expect(findTopic(TOPICS, '')).toBe(null);
  });
});

describe('lastTopicId', () => {
  it('takes the newest assignment that has a topic', () => {
    expect(lastTopicId([
      { topicId: 'a', creationTime: '2026-11-01T09:00:00Z' },
      { creationTime: '2026-11-20T09:00:00Z' },
      { topicId: 'b', creationTime: '2026-11-10T09:00:00Z' },
    ])).toBe('b');
    expect(lastTopicId([{ creationTime: '2026-11-20T09:00:00Z' }])).toBe('');
    expect(lastTopicId(undefined)).toBe('');
  });
});

describe('chooseTopic', () => {
  it('makes a topic named after the unit for its first lesson', () => {
    expect(chooseTopic({ activity: ACTS[0], activities: ACTS, topics: TOPICS, lastId: 't-wk' }))
      .toEqual({ create: true, name: 'Python Unit 2', why: 'first' });
  });
  it('reuses the unit topic for the first lesson when the class already has it', () => {
    expect(chooseTopic({ activity: ACTS[4], activities: ACTS, topics: TOPICS, lastId: 't-wk' }))
      .toEqual({ topicId: 't-dr', name: 'Data Representation', why: 'first' });
  });
  it('puts a later lesson under its unit topic when there is one', () => {
    expect(chooseTopic({ activity: ACTS[5], activities: ACTS, topics: TOPICS, lastId: 't-wk' }))
      .toEqual({ topicId: 't-dr', name: 'Data Representation', why: 'unit' });
  });
  it("otherwise follows the class's last assignment", () => {
    expect(chooseTopic({ activity: ACTS[2], activities: ACTS, topics: TOPICS, lastId: 't-wk' }))
      .toEqual({ topicId: 't-wk', name: 'Week 3 homework', why: 'last' });
    expect(chooseTopic({ activity: ACTS[12], activities: ACTS, topics: TOPICS, lastId: 't-wk' }).why).toBe('last');
  });
  it('uses no topic when there is nothing to go on', () => {
    expect(chooseTopic({ activity: ACTS[2], activities: ACTS, topics: TOPICS, lastId: 'gone' }))
      .toEqual({ topicId: '', name: '', why: 'none' });
  });
});
