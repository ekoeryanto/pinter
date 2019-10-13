<template>
  <v-container
    class="fill-height"
    fluid
  >
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        sm="8"
        md="6"
      >
        <v-card class="elevation-12">
          <v-toolbar flat>
            <v-toolbar-title>Pinter Settings</v-toolbar-title>
            <div class="flex-grow-1"></div>
            <div v-if="server.listening">
              http://{{server.listening.address}}:{{server.listening.port}}
            </div>
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text>
            <v-form>
              <v-select
                label="Printer"
                :items="printers"
                item-value="name"
                item-text="name"
                v-model="printer"
                :prepend-icon="icons.printer"
              ></v-select>

              <v-select
                v-if="paper"
                label="Paper"
                v-model="paper"
                item-value="name"
                item-text="name"
                item-disabled="disabled"
                :items="pageSizes"
                :prepend-icon="icons.paper"
              ></v-select>

              <v-select
                label="Format"
                v-model="format"
                :items="formats"
                :prepend-icon="icons.paper"
              ></v-select>

              <v-select
                label="Bind Address"
                v-model="ip"
                :items="ips"
                item-text="address"
                item-value="address"
                :prepend-icon="icons.network"
              ></v-select>

              <v-text-field
                label="Port"
                name="port"
                v-model="port"
                :prepend-icon="icons.port"
                type="number"
              ></v-text-field>

              <v-text-field
                label="PIN"
                name="pin"
                :prepend-icon="icons.pin"
                :append-icon="showPin ? icons.hide : icons.show"
                @click:append="showPin = !showPin"
                @click:append-outer="regeneratePin"
                :append-outer-icon="icons.refresh"
                :value="pin"
                readonly
                @click.prevent="copyPin"
                :type="showPin ? 'text' : 'password'"
                hint="Click value to copy"
                persistent-hint
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <div v-if="server.listening">
              <v-icon color="success">{{icons.check}}</v-icon>
              Server started.
            </div>
            <div v-else-if="server.error">
              <v-icon color="error">{{icons.close}}</v-icon>
              {{ server.error.message || server.error.code || server.error }}.
            </div>
            <div v-else>
              <v-icon color="error">{{icons.close}}</v-icon>
              Server stoped.
            </div>
            <v-spacer></v-spacer>
            <v-btn
              color="green"
              text
              @click="startServer"
            >{{server.listening ? 'Restart' : 'Start'}}</v-btn>
            <v-btn
              color="red"
              text
              :disabled="!server.listening"
              @click="stopServer"
            >Stop</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar.show">
      {{ snackbar.message }}
      <v-btn
        v-if="snackbar.copy"
        :color="snackbar.color || 'warning'"
        text
        @click="copyPin"
      >
        COPY
      </v-btn>
      <v-btn
        :color="snackbar.color || 'warning'"
        text
        @click="snackbar.show = false"
      >
        OK
      </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import { networkInterfaces } from 'os'
import { ipcRenderer } from 'electron'
import { mdiCheck, mdiClose, mdiPrinter, mdiFileDocument, mdiProtocol, mdiLock, mdiMidiPort, mdiRefresh, mdiEye, mdiEyeOff } from '@mdi/js'
import printer from '@pake/node-printer'
import store from '../server/store'

const ips = [].concat(...Object.values(networkInterfaces()))
  .filter(x => x.family === 'IPv4')
  .concat('0.0.0.0')

export default {
  data: () => ({
    ips,
    snackbar: {
      show: false,
      text: null,
      copy: false
    },
    server: {
      listening: null,
      error: null
    },
    printers: printer.getPrinters(),
    formats: null,
    icons: {
      close: mdiClose,
      check: mdiCheck,
      printer: mdiPrinter,
      paper: mdiFileDocument,
      network: mdiProtocol,
      port: mdiMidiPort,
      pin: mdiLock,
      refresh: mdiRefresh,
      show: mdiEye,
      hide: mdiEyeOff
    },
    showPin: false
  }),

  computed: {
    pin: {
      get () {
        return store.get('pin')
      },
      set (v) {
        store.set('pin', String(v))
      }
    },
    printer: {
      get () {
        return store.get('printer.default') || printer.getDefaultPrinterName()
      },
      set (v) {
        store.set('printer.default', v)
      }
    },
    paper: {
      get () {
        return store.get('printer.paper') || printer.getSelectedPaperSize(this.printer)
      },
      set (v) {
        store.set('printer.paper', v)
      }
    },
    format: {
      get () {
        return store.get('printer.format') || 'AUTO'
      },
      set (v) {
        store.set('printer.format', v)
      }
    },
    ip: {
      get () {
        return store.get('network.ip') || '127.0.0.1'
      },
      set (v) {
        store.set('network.ip', v)
      }
    },
    port: {
      get () {
        return store.get('network.port') || 4125
      },
      set (v) {
        store.set('network.port', v)
      }
    },
    driverOptions () {
      return printer.getPrinterDriverOptions(this.printer)
    },
    pageSizes () {
      if (!this.driverOptions) {
        return []
      }
      const sizes = this.driverOptions.PageSize
      return Object.keys(sizes).map(x => ({ name: x, disabled: !sizes[x] }))
    }
  },

  methods: {
    startServer (force = false) {
      if (this.server.listening) {
        ipcRenderer.send('server.stop')
      }

      ipcRenderer.send('server.start')
    },
    stopServer () {
      ipcRenderer.send('server.stop')
    },
    generatePin (min = 111111, max = 999999) {
      min = Math.ceil(min)
      max = Math.floor(max)
      return Math.floor(Math.random() * (max - min + 1)) + min
    },
    regeneratePin (auto = true) {
      this.pin = this.generatePin()
      if (auto) {
        this.snackbar.show = true
        this.snackbar.copy = true
        this.snackbar.message = 'PIN has been regenerated'
      }
    },
    async copyPin () {
      this.snackbar.show = false
      await navigator.clipboard.writeText(this.pin)
      this.snackbar.show = true
      this.snackbar.copy = false
      this.snackbar.message = 'PIN has been copied to clipboard'
    }
  },

  mounted () {
    this.server.listening = store.get('listening')

    ipcRenderer.on('server.error', (event, error) => {
      this.server.error = error
    })

    ipcRenderer.on('server.started', (event, address) => {
      this.server.error = null
      this.server.listening = address
    })

    ipcRenderer.on('server.stoped', () => {
      this.server.listening = null
    })

    if (process.platform !== 'win32') {
      this.formats = printer.getSupportedPrintFormats()
    }

    if (!this.pin) this.regeneratePin(false)
  }
}
</script>
