/* eslint-disable no-template-curly-in-string */
module.exports = {
  transpileDependencies: [
    // 'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      mainProcessWatch: ['./src/server/'],
      externals: ['polka'],
      builderOptions: {
        appId: 'app.pake.pinter',
        productName: 'Pinter',
        publish: ['github'],
        directories: {
          buildResources: 'res'
        },
        nsisWeb: {
          artifactName: '${name}-${version}-${arch}.${ext}'
        },
        rpm: {
          depends: ['libcups2-devel']
        },
        deb: {
          depends: ['gconf2', 'gconf-service', 'libnotify4', 'libappindicator1', 'libxtst6', 'libnss3', 'libcups2-dev']
        },
        win: {
          target: [
            {
              target: 'nsis-web',
              arch: ['ia32', 'x64']
            }
          ]
        },
        linux: {
          category: 'Business',
          target: [
            {
              target: 'deb'
            },
            {
              target: 'rpm'
            }
          ]
        }
      }
    }
  }
}
