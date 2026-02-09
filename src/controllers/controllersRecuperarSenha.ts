import { PrismaClient } from "@prisma/client";
import nodemailer from 'nodemailer';
import SMTPTransport from "nodemailer/lib/smtp-transport";
import bcrypt from 'bcrypt';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

if(!process.env.SENDGRID_API_KEY){
    throw new Error('A variável de ambiente não está definida');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const prisma = new PrismaClient();

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

        const msg = {
            to: email,
            from: process.env.EMAIL_FROM!,
            subject: 'Recuperação de senha - Ninja Animes',
            html: `<h1>Pediu troca de senha genin? aqui está!</h1>
            <strong>Seu código é: ${code}</strong>`
        }

        await sgMail.send(msg);
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
