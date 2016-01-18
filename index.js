'use strict'
/*
 * sgr-converter - Convert RGB values to SGR TTY codes
 * http://github.com/MarkGriffiths/sgr-composer
 */

const assert = require('assert')
const converter = require('color-convert')

const _SGRparts = {
	start: '\u001b[',
	fg: [38, 39],
	bg: [48, 49],
	reset: {in: 0, out: 0},
	end: 'm'
}

const _styles = {
	bold: [1, 22],
	dim: [2, 22],
	italic: [3, 23],
	underline: [4, 24],
	blink: [5, 25],
	invert: [7, 27]
}

function parseColor(rgb_, depth_, bg_) {
	assert(Array.isArray(rgb_) && rgb_.length === 3, `provided RGB value needs to be an array, i.e [R, G, B], not ${rgb_}.`)
	return (() => {
		let color = (() => {
			switch (depth_) {
				case 3:
					return rgb_.join(';')
				case 2:
					return converter.rgb.ansi256(rgb_)
				case 1:
					return converter.rgb.ansi16(rgb_)
				default:
					return ''
			}
		})()
		let mode = {
			in: (() => {
				let fgBg = (bg_) ? _SGRparts.bg[0] : _SGRparts.fg[0]
				switch (depth_) {
					case 3:
						return `${fgBg};2;`
					case 2:
						return `${fgBg};5;`
					case 1:
						return ''
					default:
						return ''
				}
			})(),
			out: (bg_) ? _SGRparts.bg[1] : _SGRparts.fg[1]
		}

		return {
			in: mode.in + color,
			out: mode.out
		}
	})()
}

function parseStyles(styles_) {
	let styles = {
		background: false,
		bold: false,
		dim: false,
		italic: false,
		underline: false,
		blink: false,
		invert: false
	}
	switch (true) {
		case styles_ === 'reset':
			return styles
		case Array.isArray(styles_):
			Object.keys(styles).forEach(key_ => {
				if (styles_.indexOf(key_) !== -1) {
					styles[key_] = true
				}
			})
			return styles
		case (typeof styles_ === 'object'):
			return Object.assign(styles, styles_)
		default:
			return styles
	}
}

function setStyles(styles_, excluded_) {
	let excluded = (excluded_ === undefined) ? {} : excluded_
	let sgrIn = []
	let sgrOut = []

	Object.keys(_styles).forEach(key_ => {
		if (styles_[key_] && !(key_ in excluded)) {
			if (sgrIn.indexOf(key_) === -1) {
				sgrIn.push(_styles[key_][0])
			}
			if (sgrOut.indexOf(key_) === -1) {
				sgrOut.unshift(_styles[key_][1])
			}
		}
	})
	return {
		in: ((sgrIn.length > 0) ? ';' : '') + sgrIn.join(';'),
		out: sgrOut.join(';') + ((sgrOut.length > 0) ? ';' : '')
	}
}

class SGRcomposer {
	constructor(targetDepth_, styles_) {
		this._depth = (depth_ => {
			switch (true) {
				case [3, '16m', 'millions'].indexOf(depth_) !== -1:
					return 3
				case [2, 256, '256', 'hundreds'].indexOf(depth_) !== -1:
					return 2
				case [1, 8, '8', 16, '16', 'ansi', 'color'].indexOf(depth_) !== -1:
					return 1
				default:
					return 0
			}
		})(targetDepth_)
		this.styles = parseStyles(styles_)
		this.colorSGR = ('rgb' in this.styles) ?
			parseColor(this.styles.rgb, this._depth, this.styles.background) :
			{in: '', out: ''}
		this.styleSGR = setStyles(this.styles)
	}

	get depth() {
		return this._depth
	}

	style(styles_) {
		this.styles = parseStyles(styles_)
		this.colorSGR = (this.styles.rgb) ?
			parseColor(this.styles.rgb, this._depth, this.styles.background) :
			this.colorSGR
		this.styleSGR = setStyles(this.styles)
	}

	color(rgb_) {
		this.colorSGR = (rgb_ === 'reset') ?
			_SGRparts.reset :
			parseColor(rgb_, this._depth, false)
	}

	sgr(exclusions_) {
		this.styleSGR = (exclusions_ === undefined) ?
			this.styleSGR :
			setStyles(this.styles, parseStyles(exclusions_))
		return {
			in: `${_SGRparts.start}${this.colorSGR.in}${this.styleSGR.in}${_SGRparts.end}`,
			out: `${_SGRparts.start}${this.styleSGR.out}${this.colorSGR.out}${_SGRparts.end}`
		}
	}
}

module.exports = SGRcomposer
