'use strict';

const mongoose = require('mongoose');

var mediaSchema = new mongoose.Schema({
    id        : Number,
    name      : String,
    mime      : String,
    path      : String,
    ext       : String,
    size      : Number,
    userId    : Number,
    private   : Boolean,
    secure    : Boolean,
    createdAt : { type : Date, default: Date.now },
    updatedAt : { type : Date, default: Date.now }
});

module.exports = mongoose.model('MediaSchema', mediaSchema);
