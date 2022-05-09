# webhooks-example

Example of a Node/Typescript/Express server capable of registering, verifying and handling webhooks from the [Bigblue Store API](https://bigblue.notion.site/Bigblue-Store-API-Documentation-4e9c3d052a1a4b73b59709edfe8b7457#37656a7836d84928843b7dd4533ea131).

The example contains two important Express middlewares:

1. `validateBigblueSignature`: Performs the sha256 HMAC request body payload verification.

2. `handleBigblueWebhookChallenge`:  Enables webhook endpoints to be registered in the Bigblue merchant application by responding to the URL_VERIFICATION challenge.


## Trying the application locally

1. Create a `.env` file containing the following environment variables:

```
PORT=3000
BIGBLUE_WEBHOOK_SECRET=secret copied from the bigblue app
```

2. Start the local server.

```sh
npm install
npm run dev
```

3. Expose your server to the internet, e.g. by using [ngrok](https://ngrok.com/).

```sh
ngrok http 3000
```

4. Copy the temporary ngrok URL into the Bigblue application.
