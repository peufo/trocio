var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	mail = require('../controllers/mail')
	bcrypt = require('bcrypt'),
	SALT_WORK_FACTOR = 10,
	MAX_LOGIN_ATTEMPTS = 10,
	LOCK_TIME = 2*60*60*1000 // 2h
	EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

var userModel = new Schema({
	name: {type: String, required: true},
	ref: Number, //Old id
	birth: Date,
	phone: String,
	mail: {type: String, required: true, lowercase: true, unique: true, validate: EMAIL_REGEX},
	mailvalided : { type: Boolean, default: false},
	password: {type: String, required: true},
	loginAttempts: {type: Number, required: true, default: 0},
	lockUntil: Number,
	creditTroc: {type: Number, default: 0},
	acceptTerms: {type: Boolean, default: false}
})

userModel.set('timestamps', true)

userModel.virtual('isLocked').get(() => {
	return !!(this.lockUntil && this.lockUntil > Date.now())
})

userModel.pre('save', function(next) { //Password
	var user = this
	if (!user.isModified('password')) return next()
	bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
		if (err) return next(err)
		bcrypt.hash(user.password, salt, (err, hash) => {
			if (err) return next(err)
			user.password = hash;
			next()
		})
	})
})

userModel.pre('save', function(next) { //Mail - pre save
	var user = this
	if (!user.isModified('mail') || user.isNew) return next()
	user.mailvalided = false
	next()
})

userModel.post('save', function(user, next) { //Mail - post save
	if (!user.isModified('mail') || user.isNew) return next()
	mail.sendValidMail(user, next)		
})

userModel.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
		if (err) return cb(err)
		cb(null, isMatch)
	})
}

userModel.methods.incLoginAttempts = function(cb) {
	if (this.lockUntil && this.lockUntil < Date.now()) {
		return this.update({
			$set: {loginAttempts: 1},
			$unset: {lockUntil: 1}
		}, cb)
	}
	var updates = {$inc: {loginAttempts: 1}}
	if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
		updates.$set = {lockUntil: Date.now() + LOCK_TIME}
	}
	return this.update(updates, cb)
}

var reasons = userModel.statics.failedLogin = {
	NOT_FOUND: 0,
	PASSWORD_INCORRECT: 1,
	MAX_ATTEMPTS: 2
}

userModel.statics.getAuthenticated = function(mail, password, cb) {

	this.findOne({mail: mail}, (err, user) => {
		if (err) return cb(err)
		if (!user) return cb(null, null, reasons.NOT_FOUND)
		if (user.isLocked) {
			return user.incLoginAttempts(err =>{
				if (err) return cb(err)
				return cb(null, null, reasons.MAX_ATTEMPTS)
			})
		}

		user.comparePassword(password, (err, isMatch) => {
			if (err) return cb(err)
			if (isMatch) {
				if (!user.loginAttempts && !user.lockUntil) return cb(null, user)
				var updates = {
					$set: {loginAttempts: 0},
					$unset: {lockUntil: 1}
				}
				return user.update(updates, err => {
					if (err) return cb(err)
					return cb(null, user)
				})
			}

			user.incLoginAttempts(err => {
				if (err) return cd(err)
				return cb(null, null, reasons.PASSWORD_INCORRECT)
			})
		})
	})
}

module.exports = mongoose.model('user', userModel);