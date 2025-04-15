const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

// Serializar usuario para la sesión
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializar usuario de la sesión
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Configurar estrategia de Google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
      callbackURL: `${process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace('5173', '5002') : 'http://localhost:5002'}/api/users/auth/google/callback`,
      scope: ['profile', 'email'],
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Verificar si el usuario ya existe
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
          return done(null, user);
        }
        
        // Verificar si existe un usuario con el mismo email
        const existingUser = await User.findOne({ email: profile.emails[0].value });
        
        if (existingUser) {
          // Actualizar el usuario existente con el ID de Google
          existingUser.googleId = profile.id;
          await existingUser.save();
          return done(null, existingUser);
        }
        
        // Crear un nuevo usuario con valores por defecto para campos opcionales
        const userData = {
          googleId: profile.id,
          email: profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@google.com`,
          // Campos opcionales con valores por defecto
          firstName: profile.name && profile.name.givenName ? profile.name.givenName : (profile.displayName ? profile.displayName.split(' ')[0] : 'Usuario'),
          lastName: profile.name && profile.name.familyName ? profile.name.familyName : (profile.displayName && profile.displayName.split(' ').length > 1 ? profile.displayName.split(' ').slice(1).join(' ') : 'Google'),
          phone: '',
          profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
          // Generar contraseña aleatoria (no será usada para iniciar sesión)
          password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
        };
        
        user = await User.create(userData);
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Configurar estrategia de Facebook
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID',
      clientSecret: process.env.FACEBOOK_APP_SECRET || 'YOUR_FACEBOOK_APP_SECRET',
      callbackURL: `${process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace('5173', '5002') : 'http://localhost:5002'}/api/users/auth/facebook/callback`,
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Verificar si el usuario ya existe
        let user = await User.findOne({ facebookId: profile.id });
        
        if (user) {
          return done(null, user);
        }
        
        // Verificar si existe un usuario con el mismo email
        if (profile.emails && profile.emails.length > 0) {
          const existingUser = await User.findOne({ email: profile.emails[0].value });
          
          if (existingUser) {
            // Actualizar el usuario existente con el ID de Facebook
            existingUser.facebookId = profile.id;
            await existingUser.save();
            return done(null, existingUser);
          }
        }
        
        // Crear un nuevo usuario con valores por defecto para campos opcionales
        const userData = {
          facebookId: profile.id,
          email: profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@facebook.com`,
          // Campos opcionales con valores por defecto
          firstName: profile.name && profile.name.givenName ? profile.name.givenName : (profile.displayName ? profile.displayName.split(' ')[0] : 'Usuario'),
          lastName: profile.name && profile.name.familyName ? profile.name.familyName : (profile.displayName && profile.displayName.split(' ').length > 1 ? profile.displayName.split(' ').slice(1).join(' ') : 'Facebook'),
          phone: '',
          profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
          // Generar contraseña aleatoria (no será usada para iniciar sesión)
          password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
        };
        
        user = await User.create(userData);
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
