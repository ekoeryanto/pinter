<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <v-icon large>{{ icons.printer }}</v-icon>
        pinter
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-icon>{{ icons.settings }}</v-icon>
    </v-app-bar>

    <v-content>
      <HelloWorld />
    </v-content>
  </v-app>
</template>

<script>
import { mdiPrinterWireless, mdiSettings } from '@mdi/js'

import HelloWorld from './components/HelloWorld'

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  data: () => ({
    icons: {
      printer: mdiPrinterWireless,
      settings: mdiSettings
    }
  })
}
</script>

<style>
html {
  overflow: auto !important;
}
</style>
