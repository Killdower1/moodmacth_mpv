import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { email, name, password } = await req.json();
  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash: hashed },
    select: { id: true, email: true, name: true },
  });
  const userCheck = await prisma.user.findUnique({ where: { email } });
  if (!userCheck || !userCheck.passwordHash) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }
  const valid = await bcrypt.compare(password, userCheck.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid credentials!" },
      { status: 401 }
    );
  }
  return NextResponse.redirect("/api/auth/register", 307);
}