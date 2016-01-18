#!/usr/bin/env node
'use strict'

const SGRcomposer = require('..')
const assert = require('assert')
const util = require('util')

// 4 bit test

const test4bit = new SGRcomposer('color')
console.log(`Created 4bit SGRcomposer. Depth: ${test4bit.depth}`)
assert(test4bit.depth === 1, '✕ Depth isn\'t 1 (4 bit)')
assert.throws(() => test4bit.color('#33FF33'))
test4bit.style({rgb: [0x33, 0xFF, 0x33], bold: true})
console.log('Set style to rgb: #33FF33 and bold')

let sgr4bitActual = test4bit.sgr()
let sgr4bitExpected = {
	in: '\u001b[92;1m',
	out: '\u001b[22;39m'
}

console.dir(sgr4bitActual, {colors: true})
assert.deepStrictEqual(sgr4bitActual, sgr4bitExpected, `✕ SGR output doesn't match: ${util.inspect(sgr4bitExpected, {colors: true})}`)
console.log(sgr4bitExpected.in + ' ✓  Test passed' + sgr4bitExpected.out)

// 24 bit test

const test24bit = new SGRcomposer('16m')
console.log(`Created 24bit SGRcomposer. Depth: ${test24bit.depth}`)
assert(test24bit.depth === 3, '✕ Depth isn\'t 3 (24 bit)')
assert.throws(() => test24bit.color('#FF3366'))
test24bit.color([0xFF, 0x33, 0x66])
console.log('Set colour to #FF3366')
test24bit.style(['bold', 'italic'])
console.log('Set bold and italic')

let sgr24bitActual = test24bit.sgr()
let sgr24bitExpected = {
	in: '\u001b[38;2;255;51;102;1;3m',
	out: '\u001b[23;22;39m'
}
console.dir(sgr24bitActual, {colors: true})
assert.deepStrictEqual(sgr24bitActual, sgr24bitExpected, `✕ SGR output doesn't match: ${util.inspect(sgr24bitExpected, {colors: true})}`)
console.log(sgr4bitExpected.in + ' ✓  Test passed' + sgr4bitExpected.out)

// 8 bit test

const test8bit = new SGRcomposer('256')
console.log(`Created 8bit SGRcomposer. Depth: ${test8bit.depth}`)
assert(test8bit.depth === 2, '✕ Depth isn\'t 2 (8 bit)')
assert.throws(() => test8bit.color('#FF3366'))
console.log('Set colour to #FF3366')
test8bit.color([0xFF, 0x33, 0x66])

let sgr8bitActual = test8bit.sgr()
let sgr8bitExpected = {
	in: '\u001b[38;5;204m',
	out: '\u001b[39m'
}
console.dir(sgr8bitActual, {colors: true})
assert.deepStrictEqual(sgr8bitActual, sgr8bitExpected, `✕ SGR output doesn't match: ${util.inspect(sgr8bitExpected, {colors: true})}`)
console.log(sgr4bitExpected.in + ' ✓  Test passed' + sgr4bitExpected.out)

// reset test

const testReset = new SGRcomposer('color')
console.log(`Created 4bit SGRcomposer. Depth: ${testReset.depth}`)
assert(testReset.depth === 1, '✕ Depth isn\'t 1 (4 bit)')
assert.throws(() => testReset.color('#FF3366'))
console.log('Set reset')
testReset.color('reset')

let sgrResetActual = testReset.sgr()
let sgrResetExpected = {
	in: '\u001b[0m',
	out: '\u001b[0m'
}
console.dir(sgrResetActual, {colors: true})
assert.deepStrictEqual(sgrResetActual, sgrResetExpected, `✕ SGR output doesn't match: ${util.inspect(sgrResetExpected, {colors: true})}`)
console.log(sgr4bitExpected.in + ' ✓  Test passed' + sgr4bitExpected.out)

console.log('\n' + sgr4bitExpected.in + '-✓-' + sgrResetExpected.in + ' All tests passed ' + sgr4bitExpected.in + '-✓-' + sgr4bitExpected.out)
