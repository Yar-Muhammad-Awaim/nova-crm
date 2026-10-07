import test from 'node:test';
import assert from 'node:assert/strict';
import { claimDocumentReload, needsDocumentReload } from '../lib/runtime-recovery.ts';

test('decoder and stale chunk failures require fresh document recovery', () => {
  assert(needsDocumentReload('frame.join is not a function'));
  assert(needsDocumentReload('__webpack_modules__[moduleId] is not a function'));
  assert(needsDocumentReload('Loading chunk 123 failed'));
  assert.equal(needsDocumentReload('FORBIDDEN'), false);
  assert.equal(needsDocumentReload('Database connection failed'), false);
});
test('automatic reload happens only once for an affected page', () => {
  const saved = new Map();
  const storage = { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value) };
  const message = 'frame.join is not a function';
  assert.equal(claimDocumentReload(storage, '/projects/a', message), true);
  assert.equal(claimDocumentReload(storage, '/projects/a', message), false);
  assert.equal(claimDocumentReload(storage, '/projects/b', message), true);
  assert.equal(claimDocumentReload(storage, '/projects/a', 'FORBIDDEN'), false);
});
test('unavailable browser storage never triggers a reload loop', () => {
  const storage = { getItem() { throw new Error('Storage disabled'); }, setItem() {} };
  assert.equal(claimDocumentReload(storage, '/projects/a', 'frame.join is not a function'), false);
});
