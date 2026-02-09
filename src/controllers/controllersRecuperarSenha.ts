import { PrismaClient } from "@prisma/client";
import nodemailer from 'nodemailer';
import SMTPTransport from "nodemailer/lib/smtp-transport";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
    },
    tls: {
        rejectUnauthorized: false
    }
} as SMTPTransport.Options);

export const esqueciSenha = async (req: any, res: any) => {
    const { email } = req.body;

    try{
        const user = await prisma.users.findUnique({ where: { email } });

        if (!user){
            return res.status(404).json({ error: 'E-mail não encontrado na base Ninja.'})
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const expireAt = new Date();
        expireAt.setHours(expireAt.getHours() + 1);

        await prisma.users.update({
            where: { email },
            data: {
                resetToken: code,
                resetTokenExpires: expireAt
            }
        });

       transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Recuperação de Senha - Ninja Animes',
            html: `
                <div style="font-family: Nunito, sans-serif; color #333;">
                    <h2>Olá, Ninja! 🥷</h2>
                    <p>Você solicitou a recuperação de senha.</p>
                    <p>Seu código de verificação é:</p>
                    <h2 style="color: #e63946; letter-spacing: 5px;">${code}</h2>
                    <p>Este código expira em 1 hora.</p>
                </div>
            `
        }).then(() => {
            console.log(email)
        })
        return res.json({ message: "Código de recuperação enviado!"})
    }catch(error){
        console.error(error);
        return res.status(500).json({ error: 'Erro ao enviar código.' })
    }
}

export const redifinirSenha = async (req: any, res: any) => {
    const { email, code, newPassword } = req.body;

    try{
        const user = await prisma.users.findUnique({ where: { email } });

        if(!user) return res.status(400).json({ error: "Usuário não encontrado" });
        if(user.resetToken !== code) return res.status(400).json({ error: "Código inválido"});
        if(!user.resetTokenExpires || new Date() > user.resetTokenExpires){
            return res.status(400).json({ error: 'O código expirou'});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.users.update({
            where: { email },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpires: null
            }
        });

        return res.json({ message: 'Senha alterada com sucesso!' });
    }catch(error){
        return res.status(500).json({ error: 'Erro ao redefinir senha.'});
    }
};
