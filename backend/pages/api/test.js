require('dotenv/config')
const JWT = require('jsonwebtoken')

const pem = Buffer.from(process.env.GH_APP_PEM, 'base64')
const payload = {
  iat: Math.floor(Date.now() / 1000) - 60, // 60 seconds in the past to account for clock drift
  exp: Math.floor(Date.now() / 1000) + 600, // 10m
  iss: process.env.GH_APP_ID
}
const options = { algorithm: 'RS256' }
const jwt = JWT.sign(payload, pem, options)

console.log(jwt)
