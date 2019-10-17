require('dotenv').config();

module.exports = {
  secret: process.env.JWT_KEY,
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
  TESTACCESSTOKEN: process.env.TESTACCESSTOKEN,
};
