const ExtractJWT = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = function(passport){
    passport.use(new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        async (req, username, password, done) => {
            try {
                const user = await User.findOne({ username });
                if (!user) return done(null, false, { message: 'Користувача не знайдено' });

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) return done(null, false, { message: 'Невірний пароль' });
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    ));
    const opts ={
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
    };
    passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            const user = await User.findById(jwt_payload.sub);
            user ? done(null, user) : done(null, false);
        } catch (err) {
            done(err, false);
        }
    }));
}