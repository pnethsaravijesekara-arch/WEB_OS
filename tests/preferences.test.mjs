import test from 'node:test';
import assert from 'node:assert/strict';
import {sanitizePreferences,defaults,addRecent} from '../src/preferences.ts';
import {searchItems} from '../src/search.ts';
test('invalid saved preferences recover safe defaults',()=>{
 assert.deepEqual(sanitizePreferences(null),defaults);
 const p=sanitizePreferences({theme:'broken',accent:'url(evil)',wallpaper:'https://remote',dockSize:NaN,recent:['settings','unknown','settings']});
 assert.equal(p.theme,'light');assert.equal(p.accent,defaults.accent);assert.equal(p.wallpaper,'aurora');assert.equal(p.dockSize,52);assert.deepEqual(p.recent,['settings']);
});
test('dock dimensions stay within design limits',()=>{assert.equal(sanitizePreferences({dockSize:1000}).dockSize,64);assert.equal(sanitizePreferences({dockSize:-2}).dockSize,36);});
test('recent apps are unique, ordered and bounded',()=>{assert.deepEqual(addRecent(['welcome','settings','about'],'settings'),['settings','welcome','about']);});
test('search matches all words and ranks title prefixes first',()=>{
 const items=[{id:'a',label:'About',keywords:'settings info'},{id:'s',label:'Settings',keywords:'theme wallpaper dock'}];
 assert.equal(searchItems(items,' SET ')[0].id,'s');assert.deepEqual(searchItems(items,'wall theme').map(x=>x.id),['s']);assert.deepEqual(searchItems(items,'<script>'),[]);assert.equal(searchItems(items,'').length,2);
});
