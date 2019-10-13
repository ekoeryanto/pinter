import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import id from 'vuetify/es5/locale/id'
import en from 'vuetify/es5/locale/en'

Vue.use(Vuetify)

export default new Vuetify({
  lang: {
    locales: { id, en },
    current: 'en'
  },
  icons: {
    iconfont: 'mdiSvg'
  }
})
