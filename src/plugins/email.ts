/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Plugin, Server } from '@hapi/hapi'
import nodemailer from 'nodemailer'

declare module '@hapi/hapi' {
    interface ServerApplicationState {
        sendEmail(email: string, data: any): Promise<void>
    }
}

export const emailPlugin: Plugin<null> = {
    name: 'app/email',
    register: async function (server: Server) {
        server.app.sendEmail = sendEmail
    }
}

async function sendEmail(email: string, data: string) {
    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: Number(process.env.MAILTRAP_PORT!),
        auth: {
            user: process.env.MAILTRAP_USER!,
            pass: process.env.MAILTRAP_PASSWORD!
        }
    })

    await transporter.sendMail({
        from: 'GraderApp Token <do-not-reply@graderapp.io>',
        to: email,
        subject: 'Login Token',
        text: `The login token for the API is: ${data}`
    })
}
