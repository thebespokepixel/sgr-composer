import test from 'ava'
import SGRcomposer from '../index.js'

test('4 bit SGRComposer', t => {
	const composer = new SGRcomposer('color')
	t.is(composer.depth, 1, 'Color depths upmatched.')
	composer.style = {
		color: [0x33, 0x99, 0x33],
		bold: true,
		dim: true,
	}
	t.deepEqual(composer.sgr(), {
		in: '\u001B[32;1;2m',
		out: '\u001B[22;39m',
	}, 'SGRs unmatched.')
})

test('24 bit SGRComposer I', t => {
	const composer = new SGRcomposer('16m')
	t.is(composer.depth, 3, 'Color depths unmatched.')
	composer.color = [0xFF, 0x33, 0x66]
	composer.style = ['bold', 'italic']
	t.deepEqual(composer.sgr(), {
		in: '\u001B[38;2;255;51;102;1;3m',
		out: '\u001B[23;22;39m',
	}, 'SGRs unmatched.')
})

test('24 bit SGRComposer II', t => {
	const composer = new SGRcomposer('millions', {
		color: [0xFF, 0x33, 0x66],
		invert: true,
	})
	t.is(composer.depth, 3, 'Color depths unmatched.')
	t.deepEqual(composer.sgr(), {
		in: '\u001B[38;2;255;51;102;7m',
		out: '\u001B[27;39m',
	}, 'SGRs unmatched.')
})

test('8 bit SGRComposer', t => {
	const composer = new SGRcomposer('256')
	t.is(composer.depth, 2, 'Color depths unmatched.')
	composer.color = [0xFF, 0x33, 0x66]
	t.deepEqual(composer.sgr(), {
		in: '\u001B[38;5;204m',
		out: '\u001B[39m',
	}, 'SGRs unmatched.')
})

test('Reset SGRComposer', t => {
	const composer = new SGRcomposer('color')
	t.is(composer.depth, 1, 'Color depths unmatched.')
	composer.color = 'reset'
	t.deepEqual(composer.sgr(), {
		in: '\u001B[0m',
		out: '\u001B[m',
	}, 'SGRs unmatched.')
})

test('Normal SGRComposer', t => {
	const composer = new SGRcomposer('16m', {
		color: 'normal',
	})
	t.is(composer.depth, 3, 'Color depths unmatched.')
	composer.color = 'reset'
	t.deepEqual(composer.sgr(), {
		in: '\u001B[0m',
		out: '\u001B[m',
	}, 'SGRs unmatched.')
})

test('SGRComposer Components', t => {
	const composer = new SGRcomposer('16m')
	t.is(composer.depth, 3, 'Color depths unmatched.')
	composer.color = [0xFF, 0x33, 0x66]
	t.is(composer.red, 0xFF)
	t.is(composer.green, 0x33)
	t.is(composer.blue, 0x66)
})

test('SGRComposer Hex', t => {
	const composer = new SGRcomposer('16m')
	t.is(composer.depth, 3, 'Color depths unmatched.')
	composer.color = [0xFF, 0x33, 0x66]
	t.is(composer.hex, 'FF3366')
})

test('SGRComposer Color', t => {
	const composer = new SGRcomposer('16m')
	t.is(composer.depth, 3, 'Color depths unmatched.')
	composer.color = [0xFF, 0x33, 0x66]
	t.deepEqual(composer.color, [255, 51, 102])
})

test('SGRComposer Style', t => {
	const composer = new SGRcomposer('16m')
	t.is(composer.depth, 3, 'Color depths unmatched.')
	composer.color = [0xFF, 0x33, 0x66]
	composer.style = ['bold', 'italic']
	t.is(composer.style, 'bold italic')
})

test('SGRComposer Style Array', t => {
	const composer = new SGRcomposer('16m')
	t.is(composer.depth, 3, 'Color depths unmatched.')
	composer.color = [0xFF, 0x33, 0x66]
	composer.style = ['bold', 'italic']
	t.deepEqual(composer.styleArray, ['bold', 'italic'])
})

test('24 bit SGRComposer II as String', t => {
	const composer = new SGRcomposer('millions', {
		color: [0xFF, 0x33, 0x66],
		invert: true,
	})
	t.is(composer.depth, 3, 'Color depths unmatched.')
	t.is(composer.sgr().toString(), '\u001B[38;2;255;51;102;7m')
})
