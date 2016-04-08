'use strict'
import test from 'ava'
import SGRcomposer from '..'

test('4 bit SGRComposer', t => {
	const composer = new SGRcomposer('color')
	t.is(composer.depth, 1, 'Color depths upmatched.')
	composer.style = {
		color: [0x33, 0x99, 0x33],
		bold: true,
		dim: true
	}
	t.deepEqual(composer.sgr(), {
		in: '\u001b[32;1;2m',
		out: '\u001b[22;39m'
	}, 'SGRs unmatched.')
})

test('24 bit SGRComposer I', t => {
	const composer = new SGRcomposer('16m')
	t.is(composer.depth, 3, 'Color depths unmatched.')
	composer.color = [0xFF, 0x33, 0x66]
	composer.style = ['bold', 'italic']
	t.deepEqual(composer.sgr(), {
		in: '\u001b[38;2;255;51;102;1;3m',
		out: '\u001b[23;22;39m'
	}, 'SGRs unmatched.')
})

test('24 bit SGRComposer II', t => {
	const composer = new SGRcomposer('millions', {
		color: [0xFF, 0x33, 0x66],
		invert: true
	})
	t.is(composer.depth, 3, 'Color depths unmatched.')
	t.deepEqual(composer.sgr(), {
		in: '\u001b[38;2;255;51;102;7m',
		out: '\u001b[27;39m'
	}, 'SGRs unmatched.')
})

test('8 bit SGRComposer', t => {
	const composer = new SGRcomposer('256')
	t.is(composer.depth, 2, 'Color depths unmatched.')
	composer.color = [0xFF, 0x33, 0x66]
	t.deepEqual(composer.sgr(), {
		in: '\u001b[38;5;204m',
		out: '\u001b[39m'
	}, 'SGRs unmatched.')
})

test('Reset SGRComposer', t => {
	const composer = new SGRcomposer('color')
	t.is(composer.depth, 1, 'Color depths unmatched.')
	composer.color = 'reset'
	t.deepEqual(composer.sgr(), {
		in: '\u001b[0m',
		out: '\u001b[m'
	}, 'SGRs unmatched.')
})

test('Normal SGRComposer', t => {
	const composer = new SGRcomposer('16m', {
		color: 'normal'
	})
	t.is(composer.depth, 3, 'Color depths unmatched.')
	composer.color = 'reset'
	t.deepEqual(composer.sgr(), {
		in: '\u001b[0m',
		out: '\u001b[m'
	}, 'SGRs unmatched.')
})
