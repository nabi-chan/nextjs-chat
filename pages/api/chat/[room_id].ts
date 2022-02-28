import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "types/next";
import { prisma } from "lib/prisma";

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  // block if method is not supported
  if (req.method !== "POST") return res.status(405).end();

  const { user_id, message } = req.body;
  const { room_id } = req.query;

  const createdAt = Date.now();
  const body = {
    ...req.body,
    createdAt,
  };

  res.socket?.server?.io?.socketsJoin(room_id);
  res?.socket?.server?.io?.to(room_id)?.emit("message", body);

  await prisma.chat.create({
    data: {
      user: {
        connect: {
          id: user_id,
        },
      },
      room: {
        connect: {
          id: String(room_id),
        },
      },
      message,
    },
  });

  res.status(201).json(body);
};