module.exports = {
  transpileDependencies: [
    // 'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: 'app.pake.pinter',
        productName: 'Pinter',
        directories: {
          buildResources: 'res'
        },
        mainProcessWatch: ['./src/server/']
        // options placed here will be merged with default configuration and passed to electron-builder
      }
    }
  }
}
