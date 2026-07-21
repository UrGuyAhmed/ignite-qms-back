import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth";

async function main() {
  const email = "ayahriche@gmail.com";
  const plainPassword = "iyasse01";

  const hashed = await hashPassword(plainPassword);

  await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });

  console.log("Password updated for", email);
}

main().then(() => process.exit(0));
