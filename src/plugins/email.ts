import { Plugin, Server } from '@hapi/hapi'
import { MailtrapClient } from 'mailtrap'

let client: MailtrapClient

declare module '@hapi/hapi' {
    interface ServerApplicationState {
        sendEmail(email: string, data: any): Promise<void>
    }
}

export const emailPlugin: Plugin<null> = {
    name: 'app/email',
    register: async function (server: Server) {
        if (!process.env.EMAIL_API_KEY) {
            console.log(
                `The SMPT_API_KEY env var must be set, otherwise the API won't be able to send emails.`,
                `Using debug mode which logs the email tokens instead.`
            )
            server.app.sendEmail = debugSendEmailToken
        } else {
            client = new MailtrapClient({
                token: process.env.EMAIL_API_KEY
            })
            server.app.sendEmail = sendEmail
        }
    }
}

async function sendEmail(email: string, data: string) {
    await client.send({
        from: { name: 'GraderApp Token', email: 'tokenizer@graderapp.io' },
        to: [{ email }],
        subject: 'Login Token',
        text: `The login token for the API is: ${data}`
    })
}

async function debugSendEmailToken(email: string, data: string) {
    console.log(`email token for ${email}: ${data} `)
}
