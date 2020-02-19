/* ─────────────╮
 │ SGR Composer │ Convert RGB values to SGR TTY codes
 ╰──────────────┴─────────────────────────────────────────────────────────────── */

import assert from 'assert'
import converter from 'color-convert'

const _SGRparts = {
	start: '\u001B[',
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

/**
 * Parse a color array.
 * @private
 * @param  {string | string[]} color_ - The color to parse.
 * @param  {number} depth_            - 0: no color, 1: 16 colors, 2: 256 colors, 3: 16m colors
 * @param  {boolean} bg_              - Is this a background color
 * @return {SGRColor} The color as an SGR pair.
 */
function parseColor(color_, depth_, bg_) {
	if (['reset', 'normal'].includes(color_)) {
		return _SGRparts.reset
	}

	assert(Array.isArray(color_) && color_.length === 3, `provided RGB value needs to be an array, i.e [R, G, B], not ${color_}.`)
	return (() => {
		const color = (() => {
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
		const mode = {
			in: (() => {
				const fgBg = (bg_) ? _SGRparts.bg[0] : _SGRparts.fg[0]
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

		/**
		 * A representation of an in/out SGR code pair.
		 * @namespace {object} SGRColor
		 * @property {string} in - The opening SGR color code.
		 * @property {string} out - The closing SGR code.
		 */
		return {
			in: `${mode.in}${color}`,
			out: `${mode.out}`
		}
	})()
}

/**
 * Parse a style object
 * @private
 * @param  {style} styles_ The style object to parse
 * @return {style} The parsed style.
 */
function parseStyles(styles_) {
	/**
	 * Style declaration
	 * @namespace {object} style
	 * @property {boolean} background - Set background color
	 * @property {boolean} bold       - Set bold
	 * @property {boolean} dim        - Set dim mode
	 * @property {boolean} italic     - Set italics
	 * @property {boolean} underline  - Set underline
	 * @property {boolean} blink      - Set blink
	 * @property {boolean} invert     - Set inverted video
	 */
	const styles = {
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
				if (styles_.includes(key_)) {
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

/**
 * Set a style object/
 * @param {style} styles    - The style object to set
 * @param {style} excluded_ - Styles to exclude.
 * @returns {Object} - In and Out SGR parts
 */
function setStyles(styles, excluded_) {
	const excluded = (excluded_ === undefined) ? {} : excluded_
	const sgrIn = []
	const sgrOut = []
	Object.keys(_styles).forEach(key_ => {
		if (styles[key_] && (!excluded[key_])) {
			if (!sgrIn.includes(_styles[key_][0])) {
				sgrIn.push(_styles[key_][0])
			}

			if (!sgrOut.includes(_styles[key_][1])) {
				sgrOut.unshift(_styles[key_][1])
			}
		}
	})
	return {
		in: sgrIn.join(';'),
		out: sgrOut.join(';')
	}
}

/**
 * A Class for composing various SGR codes.
 * @type {SGRcomposer}
 */
export default class SGRcomposer {
	/**
	 * A Class for composing various SGR codes.
	 * @param  {number|string} targetDepth - The target color depth.
	 * @param  {style} styles              - Additional SGR style codes.
	 */
	constructor(targetDepth, styles) {
		this._depth = (depth_ => {
			switch (true) {
				case [3, '16m', 'millions'].includes(depth_):
					return 3
				case [2, 256, '256', 'hundreds'].includes(depth_):
					return 2
				case [1, 8, '8', 16, '16', 'ansi', 'color'].includes(depth_):
					return 1
				default:
					return 0
			}
		})(targetDepth)
		this.colorSGR = {in: '', out: ''}
		this.style = styles
	}

	/**
	 * Get the current color depth.
	 * @return {number} 0: no color, 1: 16 colors, 2: 256 colors, 3: 16m colors
	 */
	get depth() {
		return this._depth
	}

	/**
	 * Get the raw RGB color as an array.
	 * @return {number[]} An array of RGB elements
	 */
	get color() {
		return this._color
	}

	/**
	 * Set the current color
	 * @param  {number[]} color RGB as an array.
	 */
	set color(color) {
		this.colorSGR = parseColor(color, this._depth, false)
		this._color = color
	}

	/**
	 * Get the raw color as a hex string.
	 * @return {string} Color as hex string: #RRGGBB
	 */
	get hex() {
		return converter.rgb.hex(this._color)
	}

	/**
	 * Get the red component.
	 * @return {number} Red component [0-255]
	 */
	get red() {
		return this._color[0]
	}

	/**
	 * Get the green component.
	 * @return {number} Green component [0-255]
	 */
	get green() {
		return this._color[1]
	}

	/**
	 * Get the blue component.
	 * @return {number} Blue component [0-255]
	 */
	get blue() {
		return this._color[2]
	}

	/**
	 * Get the current style object
	 * @return {style} The currently set styles
	 */
	get style() {
		let styles = ''
		Object.keys(this.styles).forEach(key_ => {
			if (this.styles[key_]) {
				const space = (styles === '') ? '' : ' '
				styles += (key_ === 'color') ? '' : `${space}${key_}`
			}
		})
		return (styles === '') ? undefined : styles
	}

	/**
	 * Set the current style
	 * @param  {style | array} styles The desired styles as an object or array of keys.
	 */
	set style(styles) {
		this.styles = parseStyles(styles)
		this.colorSGR = ('color' in this.styles) ?
			parseColor(this.styles.color, this._depth, this.styles.background) :
			this.colorSGR
		this.styleSGR = setStyles(this.styles)
		this._color = ('color' in this.styles) ? this.styles.color : this._color
	}

	/**
	 * Get the current style as an array of keys.
	 * @return {string[]} An array of style keys.
	 */
	get styleArray() {
		const styles = []
		Object.keys(this.styles).forEach(key_ => (this.styles[key_] === true) && styles.push(key_))
		return styles
	}

	/**
	 * Render and SGRColor object.
	 * @param  {object} exclusions - Styles to exclude from render.
	 * @return {SGRColor} The rendered SGRColor object.
	 */
	sgr(exclusions) {
		const styleSGRtemp = (exclusions === undefined) ?
			this.styleSGR :
			setStyles(this.styles, parseStyles(exclusions))

		const inJoin = (this.colorSGR.in !== '' && styleSGRtemp.in !== '') ? ';' : ''
		const outJoin = (this.colorSGR.out !== '' && styleSGRtemp.out !== '') ? ';' : ''
		const output = {
			in: `${_SGRparts.start}${this.colorSGR.in}${inJoin}${styleSGRtemp.in}${_SGRparts.end}`,
			out: `${_SGRparts.start}${styleSGRtemp.out}${outJoin}${this.colorSGR.out}${_SGRparts.end}`
		}
		Object.defineProperty(output, 'toString', {value: () => output.in})
		return output
	}
}

