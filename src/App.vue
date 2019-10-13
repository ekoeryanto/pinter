<template>
  <v-app>
    <v-content>
      <Settings />
    </v-content>
  </v-app>
</template>

<script>
import { mdiPrinterWireless, mdiSettings } from '@mdi/js'

import Settings from './components/Settings'

export default {
  name: 'App',
  components: {
    Settings
  },
  data: () => ({
    icons: {
      printer: mdiPrinterWireless,
      settings: mdiSettings
    }
  }),
  created () {
    this.$vuetify.theme.dark = true
  }
}
</script>

<style>
html {
  overflow: auto !important;
}
</style>
