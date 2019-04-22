import has from 'dojo/has'
class keys {
    constructor () {
        this.BACKSPACE = 8
		this.TAB = 9
		this.CLEAR = 12
        this.ENTER = 13
        this.SHIFT = 16
        this.CTRL = 17
        this.ALT = 18
        this.META = has("webkit") ? 91 : 224
        this.PAUSE = 19 
		this.CAPS_LOCK = 20 
		this.ESCAPE = 27 
		this.SPACE = 32 
		this.PAGE_UP = 33 
		this.PAGE_DOWN = 34 
		this.END = 35 
		this.HOME = 36 
		this.LEFT_ARROW = 37 
		this.UP_ARROW = 38 
		this.RIGHT_ARROW = 39 
		this.DOWN_ARROW = 40 
		this.INSERT = 45 
		this.DELETE = 46 
		this.HELP = 47 
		this.LEFT_WINDOW = 91 
		this.RIGHT_WINDOW = 92 
		this.SELECT = 93 
		this.NUMPAD_0 = 96 
		this.NUMPAD_1 = 97 
		this.NUMPAD_2 = 98 
		this.NUMPAD_3 = 99 
		this.NUMPAD_4 = 100 
		this.NUMPAD_5 = 101 
		this.NUMPAD_6 = 102 
		this.NUMPAD_7 = 103 
		this.NUMPAD_8 = 104 
		this.NUMPAD_9 = 105 
		this.NUMPAD_MULTIPLY = 106 
		this.NUMPAD_PLUS = 107 
		this.NUMPAD_ENTER = 108 
		this.NUMPAD_MINUS = 109 
		this.NUMPAD_PERIOD = 110 
		this.NUMPAD_DIVIDE = 111 
		this.F1 = 112 
		this.F2 = 113 
		this.F3 = 114 
		this.F4 = 115 
		this.F5 = 116 
		this.F6 = 117 
		this.F7 = 118 
		this.F8 = 119 
		this.F9 = 120 
		this.F10 = 121 
		this.F11 = 122 
		this.F12 = 123 
		this.F13 = 124 
		this.F14 = 125 
		this.F15 = 126 
		this.NUM_LOCK = 144 
        this.SCROLL_LOCK = 145 
		this.UP_DPAD = 175 
		this.DOWN_DPAD = 176 
		this.LEFT_DPAD = 177 
		this.RIGHT_DPAD = 178 
		// virtual key mapping
		this.copyKey = has("mac") && !has("air") ? (has("safari") ? 91  : 224 )  : 17
    }
}
export default new keys()