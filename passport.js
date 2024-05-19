const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const bcrypt = require('bcryptjs');
const { ExtractJwt } = require('passport-jwt');
const { User } = require('./models.js');
const jwtSecret = 'ThisIsATemporarySecretKey123';


// Local Strategy for basic HTTP authentication
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
},
    async (req, username, password, done) => {
        try {
            username = username || req.body.Username;
            password = password || req.body.Password;

            // find username not case-sensitive
            const user = await User.findOne({ Username: new RegExp('^' + username + '$', 'i') });
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }

            // Compare passwords with bcrypt
            const isValid = await bcrypt.compare(password, user.Password);
            if (!isValid) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));


// JWT Strategy for token authentication
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret
},
    async (jwtPayload, done) => {
        try {
            const user = await User.findById(jwtPayload.id);
            if (!user) {
                return done(null, false);
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, async (username, password, done) => {
    try {
        // Find the user by username
        const user = await User.findOne({ username: username.toLowerCase() });

        if (!user) {
            // If the user is not found, return an error message
            return done(null, false, { message: 'Incorrect username.' });
        }

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // If the password is incorrect, return an error message
            return done(null, false, { message: 'Incorrect password.' });
        }

        // If the username and password are correct, return the user
        return done(null, user);
    } catch (error) {
        // If there is an error, return it
        return done(error);
    }
}));