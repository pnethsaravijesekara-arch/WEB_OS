import test from 'node:test';
import assert from 'node:assert/strict';
import { clampRect, placementRect, resized } from '../src/geometry.ts';
const area={x:8,y:42,width:1347,height:796};
const rect={x:300,y:150,width:700,height:500};
test('offscreen windows clamp within the usable desktop',()=>{
  assert.deepEqual(clampRect({x:-100,y:2000,width:3000,height:2},area),{x:8,y:608,width:1347,height:230});
});
test('odd-width snap halves fill the desktop with an eight-pixel gap',()=>{
  const l=placementRect('left',area),r=placementRect('right',area);
  assert.equal(l.x+l.width+8,r.x); assert.equal(r.x+r.width,area.x+area.width);
  assert.deepEqual(placementRect('maximized',area),area);
});
test('all eight resize handles stay in bounds under extreme input',()=>{
  for(const edge of ['n','s','e','w','ne','nw','se','sw'])for(const delta of [-10000,10000]){
    const r=resized(rect,edge,delta,delta,area);
    assert.ok(r.width>=340 && r.height>=230,edge);
    assert.ok(r.x>=area.x && r.y>=area.y,edge);
    assert.ok(r.x+r.width<=area.x+area.width && r.y+r.height<=area.y+area.height,edge);
  }
});
test('northwest resizing fixes the opposite corner',()=>{
  const r=resized(rect,'nw',120,80,area);
  assert.equal(r.x+r.width,rect.x+rect.width);assert.equal(r.y+r.height,rect.y+rect.height);
});
test('small displays override minimum size without overflow',()=>{
  const small={x:8,y:42,width:304,height:180};
  assert.deepEqual(clampRect(rect,small),small);
  assert.deepEqual(resized(small,'se',-500,-500,small),small);
});
test('saved normal geometry survives placement calculations',()=>{
  const saved={...rect};placementRect('left',area);placementRect('maximized',area);
  assert.deepEqual(clampRect(saved,area),rect);
});
