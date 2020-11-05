import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import sanitizeUser from "utils/sanitizeUser";
import { USER_PAGE_SIZE } from "../readMany";

const prisma = new PrismaClient();

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const pageNumber: number = Number(req.query.pageNumber) || 0;
  try {
    const user = await prisma.user.findMany({
      skip: USER_PAGE_SIZE * pageNumber,
      take: USER_PAGE_SIZE,
      where: {
        viewedByPermissions: {
          some: {
            relationship_type: "player",
          },
        },
      },
    });

    if (!user) {
      res
        .status(404)
        .json({ statusCode: 404, message: "User does not exist." });
    } else {
      res.json({ users: user.map(sanitizeUser) });
    }
  } catch (err) {
    res.status(500);
    res.json({ statusCode: 500, message: err.message });
  }
};