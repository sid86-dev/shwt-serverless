const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const ShortUrl = require('../models/shortUrl')
const Parser = require('shortid');
require('dotenv').config();

const app = express();
const router = express.Router();

app.use(express.urlencoded({ extended: false }))
app.use('/.netlify/functions/api', router);

mongoose.connect(process.env.MONGO_URI)

router.get('/getUrl/:id', async (req, res) => {
    const shortId = req.params.id
    const shortUrl = await ShortUrl.findOne({ short: shortId })
    if (shortUrl == null) return res.json({
        'status': 'url does not exist'
    })

    shortUrl.clicks++
    shortUrl.save()

    res.json({
        'fullUrl': shortUrl.full,
        'shortId': shortId
    })
})


router.post('/shortUrl', async (req, res) => {
    const fullUrl = req.body.fullUrl
    const shortId = await Parser.generate()

    await ShortUrl.create({ full: fullUrl, short: shortId })

    res.json({
        'fullUrl': fullUrl,
        'shortId': shortId
    })
})



module.exports.handler = serverless(app);