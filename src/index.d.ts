/**
 * Vue IP & MAC Address Mask Plugin
 * 
 * A Vue 3 plugin that provides input masking and validation directives for IPv4, IPv6, and MAC addresses.
 */

import type { App, Directive } from 'vue';

/**
 * Mask handler interface for formatting and validating input
 */
export interface MaskHandler {
  /**
   * Formats the input value according to the mask type
   * @param value - The raw input value to format
   * @returns The formatted value
   */
  format(value: string): string;
  
  /**
   * Validates if the value matches the expected format
   * @param value - The value to validate
   * @returns True if valid, false otherwise
   */
  validate(value: string): boolean;
  
  /**
   * Checks if a character is valid at the current cursor position
   * @param char - The character to validate
   * @param currentValue - The current input value
   * @param cursorPos - The cursor position
   * @param selectionEnd - The end of the selection
   * @returns True if the character is valid, false otherwise
   */
  isValidChar(char: string, currentValue: string, cursorPos: number, selectionEnd: number): boolean;
}

/**
 * The mask directive for Vue
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
 */
export interface VueMaskDirective extends Directive {
  mounted(el: HTMLElement, binding: any, vnode: any): void;
  unmounted(el: HTMLElement): void;
}

/**
 * Vue IP & MAC Address Mask Plugin
 * 
 * @example
 * ```javascript
 * import { createApp } from 'vue'
 * import VueIpMacMask from 'vue-ip-mac-mask'
 * 
 * const app = createApp(App)
 * app.use(VueIpMacMask)
 * app.mount('#app')
 * ```
 */
export interface VueIpMacMaskPlugin {
  /**
   * Install the plugin into a Vue application
   * @param app - The Vue application instance
   */
  install(app: App): void;
}

declare const plugin: VueIpMacMaskPlugin;

export default plugin;

