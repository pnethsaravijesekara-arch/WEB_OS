import test from 'node:test';import assert from 'node:assert/strict';import {calculate} from '../src/calculation.ts';
test('calculator respects precedence, unary signs, decimals and parentheses',()=>{assert.equal(calculate('−(3 + 4) × 2 + .5'),-13.5);assert.equal(calculate('0.1+0.2'),.3);});
test('invalid expressions and zero division return errors',()=>{for(const s of ['1/0','5+','alert(1)','1)'])assert.throws(()=>calculate(s));});
