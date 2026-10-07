import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDraft, describeIssue } from '../lib/draft-schema.ts';
const directory=[{id:'PM01',name:'Manager',role:'MANAGER'},{id:'DEV01',name:'Member',role:'AGENT'}];
const draft={projects:[{name:'Project',clientName:'Client',managerId:'PM01',deadline:'2026-10-20',tasks:[{title:'Task',assigneeId:'DEV01',deadline:'2026-10-19',estimatedHours:2}]}]};
test('valid drafts normalize optional descriptions for preview and saving',()=>{
  const result=validateDraft(draft,directory);
  assert.deepEqual(result.issues,[]);
  assert.equal(result.draft.projects[0].tasks[0].description,'');
});
test('approval rejects unknown people, swapped roles and tasks after the project deadline',()=>{
  const invalid=structuredClone(draft);
  invalid.projects[0].managerId='DEV01';
  invalid.projects[0].tasks[0].assigneeId='unknown';
  invalid.projects[0].tasks[0].deadline='2026-10-21';
  const result=validateDraft(invalid,directory);
  assert.equal(result.issues.length,3);
  assert.match(describeIssue(result.issues[2]),/Project 1, task 1 · deadline/);
});
test('manual edits cannot approve empty scope, impossible dates or nonpositive hours',()=>{
  for(const patch of [{title:' '},{deadline:'2026-02-30'},{estimatedHours:0}]){
    const invalid=structuredClone(draft);Object.assign(invalid.projects[0].tasks[0],patch);
    assert.equal(validateDraft(invalid,directory).draft,null);
  }
  const empty=structuredClone(draft);empty.projects[0].tasks=[];
  assert.equal(validateDraft(empty,directory).draft,null);
  assert.equal(validateDraft({projects:[]},directory).draft,null);
});
