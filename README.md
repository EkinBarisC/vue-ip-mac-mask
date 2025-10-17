# Vue IP & MAC Address Mask

A Vue 3 directive for input masking and validation of IPv4, IPv6, and MAC addresses with real-time formatting and validation.

## Features

- ✅ **IPv4 Address Masking** - Automatic formatting with segment validation (0-255)
- ✅ **IPv6 Address Masking** - Hexadecimal validation with double-colon support
- ✅ **MAC Address Masking** - Automatic colon insertion for hex pairs
- ✅ **Real-time Validation** - Prevents invalid character entry
- ✅ **Smart Cursor Positioning** - Maintains cursor position during formatting
- ✅ **Paste Support** - Handles clipboard input with formatting
- ✅ **v-model Compatible** - Works seamlessly with Vue's v-model

## Installation

### npm

```bash
npm install vue-ip-mac-mask
```

### JSR

```bash
npx jsr add @pax4nimi/vue-ip-mac-mask
```

Or with npm:

```bash
npm install jsr:@pax4nimi/vue-ip-mac-mask
```

## Usage

### 1. Register the Plugin

#### From npm

```javascript
import { createApp } from 'vue'
import VueIpMacMask from 'vue-ip-mac-mask'
import App from './App.vue'

const app = createApp(App)
app.use(VueIpMacMask)
app.mount('#app')
```

#### From JSR

```javascript
import { createApp } from 'vue'
import VueIpMacMask from '@pax4nimi/vue-ip-mac-mask'
import App from './App.vue'

const app = createApp(App)
app.use(VueIpMacMask)
app.mount('#app')
```

### 2. Use in Your Components

#### IPv4 Address

```vue
<template>
  <input v-model="ipv4Address" v-mask:ipv4 type="text" placeholder="192.168.1.1" />
</template>

<script setup>
import { ref } from 'vue'

const ipv4Address = ref('')
</script>
```

#### IPv6 Address

```vue
<template>
  <input v-model="ipv6Address" v-mask:ipv6 type="text" placeholder="2001:0db8::1" />
</template>

<script setup>
import { ref } from 'vue'

const ipv6Address = ref('')
</script>
```

#### MAC Address

```vue
<template>
  <input v-model="macAddress" v-mask:mac type="text" placeholder="00:1A:2B:3C:4D:5E" />
</template>

<script setup>
import { ref } from 'vue'

const macAddress = ref('')
</script>
```

## Directive Arguments

The `v-mask` directive accepts one argument to specify the mask type:

- `v-mask:ipv4` - IPv4 address (xxx.xxx.xxx.xxx)
- `v-mask:ipv6` - IPv6 address (supports full and compressed formats)
- `v-mask:mac` - MAC address (xx:xx:xx:xx:xx:xx)

## Behavior

### IPv4
- Automatically limits each segment to 0-255
- Auto-inserts dots after completing segments
- Prevents leading zeros
- Maximum 4 segments

### IPv6
- Supports hexadecimal characters (0-9, a-f, A-F)
- Allows double-colon (::) for compression
- Maximum 4 characters per hextet
- Validates proper IPv6 format

### MAC
- Automatically formats hex pairs with colons
- Supports 12 hexadecimal characters
- Auto-inserts colons after every 2 characters
- Validates format: XX:XX:XX:XX:XX:XX

## Browser Support

Works with all modern browsers that support Vue 3.

## License

MIT

## Contributing

Issues and pull requests are welcome!

