import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      },
    });

    // Criar configurações padrão
    await prisma.userSettings.create({
      data: {
        userId: user.id,
        interval: "15min",
        maxRisk: 2.5,
        capital: 150000,
        stopLoss: 2.0,
        takeProfit: 4.0,
      },
    });

    await createSession(user.id);

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 });
  }
}

