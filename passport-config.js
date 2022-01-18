const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail, getUserById){
    const authenticateUser = async (email, password, done) =>{
        const user = getUserByEmail(email)
        // if the user doesnt exist in the db
        if (user == null){
            return done(null, false, {message: 'No user with that email'})
        }
        try{
            // if the user logged in successfully
            if (await bcrypt.compare(password, user.password)){
                return done(null, user)
            }
            else{
                return done(null, false, {message: 'Password incorrect'})
            }
        }
        catch (err){
            return done(err)
        }
    }

    passport.use(new localStrategy({ usernameField: 'email'}, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}

module.exports = initialize;