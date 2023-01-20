const mongoose = require("mongoose")

const seriesSchema = new mongoose.Schema({
    title: {
        type: String
    },
    free: {
        type: Boolean,
    },
    description: {
        type: String
    },
    donation: {
        type: Boolean,
    },
    price: {
        type: Number,
        trim: true,
        required: true
    },
    image: {
        type: String
    },
    banner: {
        type: String
    },
    type: {
        type: String,
        default: "Series"
    },
    seasons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seasons"
    }]
}, {
    timestamps: true
})

module.exports = mongoose.model("Series", seriesSchema)