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
        nsis: {
          artifactName: '${name}-${version}-bundle.${ext}'
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
          icon: 'icons/png',
          target: [
            {
              target: 'nsis-web',
              arch: ['ia32', 'x64']
            },
            {
              target: 'nsis',
              arch: ['ia32', 'x64']
            }
          ]
        },
        linux: {
          icon: 'icons/png',
          category: 'Business',
          target: [
            {
              target: 'deb',
              arch: ['ia32', 'x64']
            },
            {
              target: 'rpm',
              arch: ['ia32', 'x64']
            }
          ]
        }
      }
    }
  }
}
