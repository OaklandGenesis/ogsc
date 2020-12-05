import { PrismaClient } from "@prisma/client";
import { NextApiResponse } from "next";
import Joi from "joi";
import { ValidatedNextApiRequest } from "interfaces";
import flattenUserRoles from "utils/flattenUserRoles";
import sanitizeUser from "utils/sanitizeUser";
import { validateBody } from "pages/api/helpers";
import { adminOnlyHandler } from "../helpers";

const prisma = new PrismaClient();
type UserDTO = {
  id?: number;
};

const expectedBody = Joi.object<UserDTO>({
  id: Joi.number(),
});

const handler = async (
  req: ValidatedNextApiRequest<UserDTO>,
  res: NextApiResponse
): Promise<void> => {
  try {
    const user = await prisma.user.findOne({
      // where: { id: req.body.id || Number(req.query.id) },
      // include: {
      //   viewerPermissions: true,
      // },
      include: { roles: true },
    });

    if (!user) {
      res
        .status(404)
        .json({ statusCode: 404, message: "User does not exist." });
    } else {
      res.json({ user: flattenUserRoles(sanitizeUser(user)) });
    }
  } catch (err) {
    res.status(500);
    res.json({ statusCode: 500, message: err.message });
  }
};

export default validateBody(adminOnlyHandler(handler), expectedBody);
