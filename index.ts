import express, { Express, NextFunction, Request, Response } from 'express'
import dotenv from 'dotenv'
import crypto from 'crypto'
import { IncomingMessage } from 'http'

dotenv.config()

const EVENT_TYPE_HEADER = 'x-bigblue-event-type'
const EVENT_SIGNATURE_HEADER = 'x-bigblue-hmac-sha256'
const EVENT_URL_VERIFICATION = 'URL_VERIFICATION'

const BIGBLUE_WEBHOOK_SECRET = process.env.BIGBLUE_WEBHOOK_SECRET ?? ''

const app: Express = express()
const port = process.env.PORT

app.use(
    express.json({
        limit: '10mb',
        verify: (req: IncomingMessage & { rawBody?: Buffer }, res, buf) => {
            req.rawBody = buf
        },
    })
)

/*
    validateBigblueSignature
    Performs the sha256 HMAC request body payload verification.
 */
const validateBigblueSignature = async (
    req: Request & { rawBody?: Buffer },
    res: Response,
    next: NextFunction
) => {
    try {
        const rawBody = req.rawBody
        if (typeof rawBody == 'undefined') {
            throw new Error(
                'validateBigblueSignature: req.rawBody is undefined. Please make sure the raw request body is available as req.rawBody.'
            )
        }
        const hmac = req.headers[EVENT_SIGNATURE_HEADER] as string | undefined
        if (!hmac) {
            res.status(403)
            return res.send('Unauthorized')
        }

        const hash = crypto
            .createHmac('sha256', BIGBLUE_WEBHOOK_SECRET)
            .update(rawBody)
            .digest('base64')

        const signatureOk = crypto.timingSafeEqual(
            Buffer.from(hash),
            Buffer.from(hmac)
        )
        if (!signatureOk) {
            res.status(403)
            return res.send('Unauthorized')
        }
        next()
    } catch (err) {
        next(err)
    }
}

/*
    handleBigblueWebhookChallenge
    Enables webhook endpoints to be registered in the Bigblue merchant application by responding to
    the URL_VERIFICATION challenge.
 */
const handleBigblueWebhookChallenge = async (
    req: Request & { rawBody?: Buffer },
    res: Response,
    next: NextFunction
) => {
    if (req.headers[EVENT_TYPE_HEADER] === EVENT_URL_VERIFICATION) {
        res.setHeader('Content-Type', 'application/json')
        return res.send(
            JSON.stringify({
                challenge: req.body.challenge,
            })
        )
    }

    next()
}

app.post(
    '/',
    validateBigblueSignature,
    handleBigblueWebhookChallenge,
    (req: Request, res: Response) => {
        console.log('received webhhok: ', JSON.stringify(req.body))
        res.send('OK')
    }
)

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})
