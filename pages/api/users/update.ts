import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import Joi from "joi";

const prisma = new PrismaClient();
type userDTO = {
  id: number;
  name: string;
  email: string;
  emailVerified: Date;
  image: string;
  createdAt: Date;
  updatedAt: Date;
};

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  try {
    const expectedBody = Joi.object({
      id: Joi.number().required(),
      name: Joi.string(),
      email: Joi.string(),
      emailVerified: Joi.date(),
      image: Joi.string(),
      createdAt: Joi.date(),
      updatedAt: Joi.date(),
    });

    const { value, error } = expectedBody.validate(req.body);
    if (error) {
      throw new Error(error.message);
    }
    const body = value as userDTO;

    await prisma.user.update({
      where: { id: body.id },
      data: {
        name: body.name,
        email: body.email,
        emailVerified: body.emailVerified,
        image: body.image,
        createdAt: body.createdAt,
        updatedAt: body.updatedAt,
      },
    });
  } catch (err) {
    res.status(500);
    res.json({ statusCode: 500, message: err.message });
  }
};
