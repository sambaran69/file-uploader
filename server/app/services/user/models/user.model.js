'use strict';

const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    id        : Number,
    name      : String
});

module.exports = mongoose.model('MediaSchema', mediaSchema);
