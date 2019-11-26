const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;

const ExtractJWT = require('passport-jwt').ExtractJwt;

const UserModel = require('../database/models/').Customer;
const secret = require('./jwtConfig');
const { FACEBOOK_APP_ID } = require('./jwtConfig');
const { FACEBOOK_APP_SECRET } = require('./jwtConfig');

// A passport middleware to handle user registration
passport.use(
  'create',
  // eslint-disable-next-line no-undef
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    // eslint-disable-next-line consistent-return
    async (email, password, done) => {
      try {
        // Save the information provided by the user to the the database
        const user = await UserModel.create({ email, password });
        // Send the user information to the next middleware
        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

// A passport middleware to handle User login
passport.use(
  'login',
  // eslint-disable-next-line no-undef
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        // Find the user associated with the email provided by the user
        const user = await UserModel.findOne({
          where: {
            // eslint-disable-next-line object-shorthand
            email: email,
          },
        });
        if (!user) {
          // If the user isn't found in the database, return a message
          return done(null, false, { message: 'User not found' });
        }

        // If the passwords match, it returns a value of true.
        const validate = await user.validatePassword(password);
        if (!validate) {
          return done(null, false, { message: 'Wrong Password' });
        }
        // Send the user information to the next middleware
        return done(null, user, { message: 'Logged in Successfully' });
      } catch (error) {
        return done(error);
      }
    }
  )
);

// This verifies that the token sent by the user is valid
passport.use(
  new JwtStrategy(
    {
      secretOrKey: `${secret}`,

      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    // eslint-disable-next-line consistent-return
    async (token, done) => {
      try {
        // Find the user associated with the email provided by the user
        const user = await UserModel.findOne({
          where: {
            // eslint-disable-next-line object-shorthand
            email: token.email,
          },
        });
        if (!user) {
          // If the user isn't found in the database, return a message
          return done(null, false, { message: 'User not found' });
        }

        // Send the user information to the next middleware
        return done(null, user, { message: 'Logged in Successfully' });
      } catch (error) {
        done(error);
      }
    }
  )
);

// A passport middleware to handle facebook  User login
passport.use(
  new FacebookTokenStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      fbGraphVersion: 'v3.0',
      profileFields: ['id', 'emails', 'name'],
    },
    // eslint-disable-next-line func-names
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await UserModel.findOne({
          where: {
            // eslint-disable-next-line object-shorthand
            email: profile.emails[0].value,
          },
        });
        if (!user) {
          // If the user isn't found in the database, return a message
          return done(null, false, { message: 'User not found' });
        }

        // Send the user information to the next middleware
        return done(null, user, { message: 'Logged in Successfully' });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
