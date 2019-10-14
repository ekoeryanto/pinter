module.exports = {
  transpileDependencies: [
    // 'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      mainProcessWatch: ['./src/server/'],
      builderOptions: {
        appId: 'app.pake.pinter',
        productName: 'Pinter',
        directories: {
          buildResources: 'res'
        },
        win: {
          icon: 'icons/png'
        }
      }
    }
  }
}
