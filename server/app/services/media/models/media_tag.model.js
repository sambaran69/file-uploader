'use strict';

const mongoose = require('mongoose');

var mediaTagSchema = new mongoose.Schema({
    id        : Number,
    mediaId   : Number,
    tag       : String,
    createdAt : { type : Date, default: Date.now },
    updatedAt : { type : Date, default: Date.now }
});

module.exports = mongoose.model('MediaTagSchema', mediaTagSchema);
