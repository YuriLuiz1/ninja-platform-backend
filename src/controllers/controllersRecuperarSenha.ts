import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const RESET_SECRET = process.env.RESET_TOKEN_SECRET || 'ninja-reset-secret';

export const esqueciSenha = async (req: any, res: any) => {
    const { email, user: username } = req.body;

    if (!email || !username) {
        return res.status(400).json({ error: 'E-mail e nome de usuário são obrigatórios.' });
    }

    try {
        const user = await prisma.users.findFirst({ where: { email, user: username } });

        if (!user) {
            return res.status(404).json({ error: 'Credenciais não encontradas na base Ninja.' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            RESET_SECRET,
            { expiresIn: '1h' }
        );

        const expireAt = new Date();
        expireAt.setHours(expireAt.getHours() + 1);

        await prisma.users.update({
            where: { email },
            data: {
                resetToken: token,
                resetTokenExpires: expireAt
            }
        });

        return res.json({ resetToken: token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao gerar token de recuperação.' });
    }
};

export const redifinirSenha = async (req: any, res: any) => {
    const { token, newPassword } = req.body;

    try {
        let payload: any;

        try {
            payload = jwt.verify(token, RESET_SECRET);
        } catch {
            return res.status(400).json({ error: 'Token inválido ou expirado.' });
        }

        const user = await prisma.users.findUnique({ where: { id: payload.userId } });

        if (!user) return res.status(400).json({ error: 'Usuário não encontrado.' });
        if (user.resetToken !== token) return res.status(400).json({ error: 'Token inválido.' });
        if (!user.resetTokenExpires || new Date() > user.resetTokenExpires) {
            return res.status(400).json({ error: 'Token expirado.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.users.update({
            where: { id: payload.userId },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpires: null
            }
        });

        return res.json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao redefinir senha.' });
    }
};
