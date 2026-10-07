import test from 'node:test';
import assert from 'node:assert/strict';
import { memberSchema, projectSchema, taskSchema } from '../lib/management-schema.ts';

const member = { name: ' New member ', email: ' MEMBER@example.com ', password: 'Example123!', role: 'AGENT' };
test('accounts normalize names and email without allowing admin creation', () => {
  const parsed = memberSchema.parse(member);
  assert.equal(parsed.email, 'member@example.com');
  assert.equal(parsed.name, 'New member');
  assert.equal(memberSchema.safeParse({ ...member, role: 'ADMIN' }).success, false);
});
test('password limits respect bcrypt UTF-8 bytes', () => {
  assert.equal(memberSchema.safeParse({ ...member, password: 'short' }).success, false);
  assert.equal(memberSchema.safeParse({ ...member, password: 'é'.repeat(36) }).success, true);
  assert.equal(memberSchema.safeParse({ ...member, password: 'é'.repeat(37) }).success, false);
});
test('manual projects reject impossible dates and missing owners', () => {
  const project = { name: 'Project', clientName: 'Client', managerId: 'PM-1', deadline: '2026-02-28' };
  assert.equal(projectSchema.safeParse(project).success, true);
  assert.equal(projectSchema.safeParse({ ...project, deadline: '2026-02-30' }).success, false);
  assert.equal(projectSchema.safeParse({ ...project, managerId: '' }).success, false);
});
test('tasks require positive effort and supported board statuses', () => {
  const task = { projectId: 'e27d7dce-030b-48d5-8761-bd34728e9067', title: 'Task', assigneeId: 'DEV-1', deadline: '2026-10-20', estimatedHours: 2 };
  assert.equal(taskSchema.parse(task).status, 'todo');
  for (const estimatedHours of [0, -1, Infinity]) assert.equal(taskSchema.safeParse({ ...task, estimatedHours }).success, false);
  assert.equal(taskSchema.safeParse({ ...task, status: 'unknown' }).success, false);
});
