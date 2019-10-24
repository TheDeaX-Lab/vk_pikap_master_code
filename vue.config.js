module.exports = {
  "devServer": {
    "host": "0.0.0.0",
    "port": 8080,
    "hotOnly": false,
    "https": true
  },
  publicPath: process.env.NODE_ENV === 'production'
    ? '/vk_pikap_master/'
    : '/',
  "transpileDependencies": [
    "vuetify"
  ]
}