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
	reset: {in: 0, out: ''},
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

function parseColor(color_, depth_, bg_) {
	if (['reset', 'normal'].indexOf(color_) !== -1) {
		return _SGRparts.reset
	}
	assert(Array.isArray(color_) && color_.length === 3, `provided RGB value needs to be an array, i.e [R, G, B], not ${color_}.`)
	return (() => {
		let color = (() => {
			switch (depth_) {
				case 3:
					return color_.join(';')
				case 2:
					return converter.rgb.ansi256(color_)
				case 1:
					return converter.rgb.ansi16(color_)
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
			in: `${mode.in}${color}`,
			out: `${mode.out}`
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
		if (styles_[key_] && (!excluded[key_])) {
			if (sgrIn.indexOf(_styles[key_][0]) === -1) {
				sgrIn.push(_styles[key_][0])
			}
			if (sgrOut.indexOf(_styles[key_][1]) === -1) {
				sgrOut.unshift(_styles[key_][1])
			}
		}
	})
	return {
		in: sgrIn.join(';'),
		out: sgrOut.join(';')
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
		this.colorSGR = {in: '', out: ''}
		this.style = styles_
	}

	get depth() {
		return this._depth
	}

	get color() {
		return this._color
	}

	get hex() {
		return converter.rgb.hex(this._color)
	}

	get red() {
		return this._color[0]
	}

	get green() {
		return this._color[1]
	}

	get blue() {
		return this._color[2]
	}

	get style() {
		let styles = ''
		Object.keys(this.styles).forEach(key_ => {
			if (this.styles[key_]) {
				let space = (styles === '') ? '' : ' '
				styles += (key_ === 'color') ? '' : `${space}${key_}`
			}
		})
		return (styles === '') ? null : styles
	}

	get styleArray() {
		let styles = []
		Object.keys(this.styles).forEach(key_ => (this.styles[key_] === true) && styles.push(key_))
		return styles
	}

	set style(styles_) {
		this.styles = parseStyles(styles_)
		this.colorSGR = ('color' in this.styles) ?
			parseColor(this.styles.color, this._depth, this.styles.background) :
			this.colorSGR
		this.styleSGR = setStyles(this.styles)
		this._color = ('color' in this.styles) ? this.styles.color : this._color
	}

	set color(color_) {
		this.colorSGR = parseColor(color_, this._depth, false)
		this._color = color_
	}

	sgr(exclusions_) {
		let styleSGRtemp = (exclusions_ === undefined) ?
			this.styleSGR :
			setStyles(this.styles, parseStyles(exclusions_))

		let inJoin = (this.colorSGR.in !== '' && styleSGRtemp.in !== '') ? ';' : ''
		let outJoin = (this.colorSGR.out !== '' && styleSGRtemp.out !== '') ? ';' : ''
		let output = {
			in: `${_SGRparts.start}${this.colorSGR.in}${inJoin}${styleSGRtemp.in}${_SGRparts.end}`,
			out: `${_SGRparts.start}${styleSGRtemp.out}${outJoin}${this.colorSGR.out}${_SGRparts.end}`
		}
		Object.defineProperty(output, 'toString', {value: () => output.in})
		return output
	}
}

module.exports = SGRcomposer
