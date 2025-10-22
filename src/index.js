/**
 * Simulates inserting a character at a specific position in a string
 * @param {string} value - The original string value
 * @param {string} char - The character to insert
 * @param {number} cursorPos - The cursor position where to insert
 * @param {number} [selectionEnd] - The end of selection (optional)
 * @returns {string} The resulting string after insertion
 */
const simulateInsert = (value, char, cursorPos, selectionEnd) => {
  const selEnd = typeof selectionEnd === 'number' ? selectionEnd : cursorPos
  return value.slice(0, cursorPos) + char + value.slice(selEnd)
}

/**
 * Gets the start and end bounds of a segment in a delimited string
 * @param {string} value - The string to analyze
 * @param {number} index - The index within the segment
 * @param {string} delimiter - The delimiter character
 * @returns {{start: number, end: number}} The start and end indices of the segment
 */
const getSegmentBounds = (value, index, delimiter) => {
  const start = value.lastIndexOf(delimiter, index - 1) + 1
  let end = value.indexOf(delimiter, index)
  if (end === -1) end = value.length
  return { start, end }
}

/**
 * Extracts the text of a segment at a specific index
 * @param {string} value - The string to analyze
 * @param {number} index - The index within the segment
 * @param {string} delimiter - The delimiter character
 * @returns {string} The segment text
 */
const getSegmentTextAt = (value, index, delimiter) => {
  const { start, end } = getSegmentBounds(value, index, delimiter)
  return value.slice(start, end)
}

/**
 * Counts the occurrences of a character in a string
 * @param {string} value - The string to search
 * @param {string} ch - The character to count
 * @returns {number} The number of occurrences
 */
const countChar = (value, ch) => {
  const m = value.match(new RegExp('\\' + ch, 'g'))
  return m ? m.length : 0
}

/**
 * Checks if a character is a valid hexadecimal digit
 * @param {string} ch - The character to check
 * @returns {boolean} True if the character is a hex digit
 */
const isHexChar = (ch) => /[0-9a-fA-F]/.test(ch)

/**
 * Checks if a character is a decimal digit
 * @param {string} ch - The character to check
 * @returns {boolean} True if the character is a digit
 */
const isDigit = (ch) => /\d/.test(ch)

/**
 * Computes the new cursor position after a value change
 * @param {string} oldValue - The previous value
 * @param {string} newValue - The new value
 * @param {number} oldCursor - The previous cursor position
 * @returns {number} The new cursor position
 */
const computeNewCursorPosition = (oldValue, newValue, oldCursor) => {
  let pos = oldCursor
  if (newValue.length < oldValue.length) {
    pos = Math.min(oldCursor, newValue.length)
  } else if (newValue.length > oldValue.length) {
    pos = oldCursor + (newValue.length - oldValue.length)
  }
  return pos
}

/**
 * @typedef {Object} MaskHandler
 * @property {(value: string) => string} format - Formats the input value
 * @property {(value: string) => boolean} validate - Validates the input value
 * @property {(char: string, currentValue: string, cursorPos: number, selectionEnd: number) => boolean} isValidChar - Checks if a character is valid at the current position
 */

/**
 * Handlers for different mask types (IPv4, IPv6, MAC)
 * @type {Object.<string, MaskHandler>}
 */
const maskHandlers = {
  ipv4: {
    format: (value) => {
      const cleaned = value.replace(/[^\d.]/g, '')

      const segments = cleaned.split('.')
      const validSegments = []

      for (let i = 0; i < Math.min(segments.length, 4); i++) {
        let segment = segments[i]

        if (segment.length > 3) {
          segment = segment.slice(0, 3)
        }

        const num = parseInt(segment, 10)
        if (!isNaN(num)) {
          if (num > 255) {
            segment = '255'
          }
        }

        validSegments.push(segment)

        if (i < 3 && i === segments.length - 1 && segment.length > 0) {
          if (segment.length === 3) {
            validSegments.push('')
          } else if (segment.length === 2 && parseInt(segment + '0', 10) > 255) {
            validSegments.push('')
          }
        }
      }

      return validSegments.join('.')
    },
    validate: (value) => {
      const ipv4Regex = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/
      return ipv4Regex.test(value)
    },
    isValidChar: (char, currentValue, cursorPos, selectionEnd) => {
      if (!/[\d.]/.test(char)) return false

      const left = currentValue.slice(0, cursorPos)
      const right = currentValue.slice(cursorPos)

      if (char === '.') {
        const after = simulateInsert(currentValue, char, cursorPos, selectionEnd)
        if (countChar(after, '.') > 3) return false
        if (left.length === 0 || left.endsWith('.')) return false
        const { start, end } = getSegmentBounds(currentValue, cursorPos, '.')
        const currentSeg = currentValue.slice(start, end)
        if (currentSeg.length === 0) return false
        if (right.startsWith('.')) return false
        return true
      }

      if (isDigit(char)) {
        const after = simulateInsert(currentValue, char, cursorPos, selectionEnd)
        const newIndex = cursorPos + 1
        const segAfter = getSegmentTextAt(after, newIndex, '.')
        if (segAfter.length > 3) return false
        if (segAfter.length > 1 && segAfter.startsWith('0')) return false
        const num = parseInt(segAfter, 10)
        if (!isNaN(num) && num > 255) return false
        return true
      }

      return false
    }
  },
  ipv6: {
    format: (value) => {
      const cleaned = value.replace(/[^0-9a-fA-F:]/g, '')

      return cleaned.replace(/:{3,}/g, '::')
    },
    validate: (value) => {
      const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|::)$/
      return ipv6Regex.test(value)
    },
    isValidChar: (char, currentValue, cursorPos, selectionEnd) => {
      if (!/[0-9a-fA-F:]/.test(char)) return false

      const left = currentValue.slice(0, cursorPos)
      const right = currentValue.slice(cursorPos)

      if (char === ':') {
        const after = simulateInsert(currentValue, char, cursorPos, selectionEnd)
        if (/:{3,}/.test(after)) return false
        if ((after.match(/::/g) || []).length > 1) return false
        const hasDoubleColon = after.includes('::')
        const colonCount = countChar(after, ':')
        if (!hasDoubleColon && colonCount > 7) return false
        const isFormingDouble = left.endsWith(':') || right.startsWith(':')
        const currentSeg = getSegmentTextAt(currentValue, cursorPos, ':')
        if (!isFormingDouble && currentSeg.length === 0) return false
        return true
      }

      if (isHexChar(char)) {
        const after = simulateInsert(currentValue, char, cursorPos, selectionEnd)
        const newIndex = cursorPos + 1
        const segAfter = getSegmentTextAt(after, newIndex, ':')
        if (segAfter.length > 4) return false
        return true
      }

      return false
    }
  },
  mac: {
    format: (value) => {
      const cleanedAll = value.replace(/[^0-9a-fA-F:]/g, '')
      const hasColon = cleanedAll.includes(':')

      if (hasColon) {
        const rawSegments = cleanedAll.split(':').slice(0, 6).map(seg => seg.replace(/[^0-9a-fA-F]/g, ''))
        if (rawSegments.every(seg => seg.length <= 2)) {
          const normalized = rawSegments.map(seg => seg.slice(0, 2))
          return normalized.join(':')
        }
      }

      const hexOnly = value.replace(/[^0-9a-fA-F]/g, '').slice(0, 12)
      const pairs = []
      for (let i = 0; i < hexOnly.length; i += 2) {
        pairs.push(hexOnly.slice(i, i + 2))
      }
      return pairs.join(':')
    },
    validate: (value) => {
      const macRegex = /^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/
      return macRegex.test(value)
    },
    isValidChar: (char, currentValue, cursorPos, selectionEnd) => {
      if (!/[0-9a-fA-F:]/.test(char)) return false

      const selEnd = typeof selectionEnd === 'number' ? selectionEnd : cursorPos
      const left = currentValue.slice(0, cursorPos)
      const right = currentValue.slice(selEnd)

      if (char === ':') {
        const currentSeg = getSegmentTextAt(currentValue, cursorPos, ':').replace(/[^0-9a-fA-F]/g, '')
        const totalHex = (currentValue.replace(/[^0-9a-fA-F]/g, '').length)
        const colonCount = countChar(currentValue, ':')
        if (currentSeg.length !== 2) return false
        if (colonCount >= 5) return false
        if (totalHex >= 12) return false
        if (left.endsWith(':') || right.startsWith(':')) return false
        return true
      }

      if (isHexChar(char)) {
        const after = simulateInsert(currentValue, char, cursorPos, selectionEnd)
        const totalHexAfter = (after.replace(/[^0-9a-fA-F]/g, '').length)
        if (totalHexAfter > 12) return false

        return true
      }

      return false
    }
  }
}

/**
 * Vue IP & MAC Address Mask Plugin
 * 
 * A Vue 3 plugin that provides input masking and validation directives for IPv4, IPv6, and MAC addresses.
 * 
 * @example
 * ```javascript
 * import { createApp } from 'vue'
 * import VueIpMacMask from 'vue-ip-mac-mask'
 * 
 * const app = createApp(App)
 * app.use(VueIpMacMask)
 * ```
 * 
 * @example
 * ```vue
 * <!-- IPv4 Address -->
 * <input v-model="ipv4" v-mask:ipv4 type="text" placeholder="192.168.1.1" />
 * 
 * <!-- IPv6 Address -->
 * <input v-model="ipv6" v-mask:ipv6 type="text" placeholder="2001:0db8::1" />
 * 
 * <!-- MAC Address -->
 * <input v-model="mac" v-mask:mac type="text" placeholder="00:1A:2B:3C:4D:5E" />
 * ```
 * 
 * @type {{install: (app: any) => void}}
 */
export default {
  install: (app) => {
    app.directive('mask', {
      mounted: (el, binding, vnode) => {
        const input = el.tagName === 'INPUT' ? el : el.querySelector('input')

        if (!input) {
          console.warn('No input element found for mask directive')
          return
        }

        const maskType = binding.arg || 'ipv4'
        const handler = maskHandlers[maskType]

        if (!handler) {
          console.warn(`Unknown mask type: ${maskType}`)
          return
        }

        const handleInput = (e) => {
          const cursorPosition = input.selectionStart
          const oldValue = input.value
          const newValue = handler.format(oldValue)

          if (oldValue !== newValue) {
            input.value = newValue

            input.dispatchEvent(new Event('input', { bubbles: true }))

            const newCursorPos = computeNewCursorPosition(oldValue, newValue, cursorPosition)
            input.setSelectionRange(newCursorPos, newCursorPos)
          }
        }

        const handlePaste = (e) => {
          e.preventDefault()
          const pastedText = e.clipboardData.getData('text')
          const formatted = handler.format(pastedText)
          input.value = formatted
          input.dispatchEvent(new Event('input', { bubbles: true }))
        }

        const handleKeydown = (e) => {
          if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab' ||
              e.key === 'Enter' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
              e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.ctrlKey || e.metaKey ||
              e.key === 'Home' || e.key === 'End') {
            return
          }

          const currentValue = input.value
          const cursorPos = input.selectionStart

          if (!handler.isValidChar(e.key, currentValue, cursorPos, input.selectionEnd)) {
            e.preventDefault()
          }
        }

        input.addEventListener('input', handleInput)
        input.addEventListener('paste', handlePaste)
        input.addEventListener('keydown', handleKeydown)

        el._maskCleanup = () => {
          input.removeEventListener('input', handleInput)
          input.removeEventListener('paste', handlePaste)
          input.removeEventListener('keydown', handleKeydown)
        }
      },
      unmounted: (el) => {
        if (el._maskCleanup) {
          el._maskCleanup()
        }
      }
    })
  }
}

