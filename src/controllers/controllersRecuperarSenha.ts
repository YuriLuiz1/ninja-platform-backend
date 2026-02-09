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
          subject: "Recuperação de senha - Ninja Animes",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
              <div style="text-align: center; background-color: #333; padding: 10px; border-radius: 5px;">
                <h1 style="color: #fff; margin: 0;">Ninja Animes</h1>
              </div>
              <div style="padding: 20px 0; color: #333; line-height: 1.6;">
                <h2 style="color: #333;">Olá, Ninja! 🥷</h2>
                <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
                <p>Se você não fez essa solicitação, pode ignorar este e-mail com segurança.</p>
                <p>Para prosseguir, utilize o código de verificação abaixo:</p>
                <div style="background-color: #f4f4f4; border: 1px dashed #333; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                  ${code}
                </div>
                <p>Este código é válido por apenas <strong>1 hora</strong>.</p>
              </div>
              <div style="text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px;">
                <p>Esta é uma mensagem automática, por favor não responda.</p>
              </div>
            </div>
            `,
        };

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
