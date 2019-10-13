module.exports = {
  transpileDependencies: [
    // 'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        mainProcessWatch: ['./src/server/']
        // options placed here will be merged with default configuration and passed to electron-builder
      }
    }
  }
}
