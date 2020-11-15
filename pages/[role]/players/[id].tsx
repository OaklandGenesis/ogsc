import {
  Absence,
  PrismaClient,
  ProfileField,
  User,
  ViewingPermission,
} from "@prisma/client";
import DashboardLayout from "components/DashboardLayout";
import PlayerProfile from "components/Player/Profile";
import { NextPageContext } from "next";
import sanitizeUser from "utils/sanitizeUser";
import buildUserProfile from "utils/buildUserProfile";

type Props = {
  player?: Omit<
    User & {
      absences: Absence[];
      viewedByPermissions: ViewingPermission[];
      profileFields: ProfileField[];
    },
    "hashedPassword"
  >;
};

export async function getServerSideProps(
  context: NextPageContext
): Promise<{ props: Props }> {
  const prisma = new PrismaClient();
  const id = context.query.id as string;
  const user = await prisma.user.findOne({
    where: { id: Number(id) },
    include: {
      absences: true,
      profileFields: true,
      viewedByPermissions: true,
    },
  });

  if (user === null) {
    // TODO: Set statusCode to 404
    return { props: {} };
  }

  return {
    props: {
      player: JSON.parse(JSON.stringify(sanitizeUser(user))),
    },
  };
}

const PlayerProfilePage: React.FunctionComponent<Props> = ({
  player,
}: Props) => {
  if (!player) {
    return <DashboardLayout>No player found</DashboardLayout>;
  }
  const hydratedPlayer = buildUserProfile(player);

  return (
    <DashboardLayout>
      <div className="flex mt-20 flex-wrap space-y-6 flex-col mx-16">
        <div className="header flex items-center">
          <div className="picture flex mr-10">
            <img
              src="/placeholder-profile.png"
              alt={hydratedPlayer.name || "player"}
              className="bg-button rounded-full max-w-full align-middle border-none w-24 h-24"
            />
          </div>
          <div className="player-info grid grid-rows-2">
            <p className="pt-6 text-2xl font-semibold">{hydratedPlayer.name}</p>
            <p className="pt-2 text-sm font-medium">
              {hydratedPlayer.profile?.PlayerNumber.current &&
                `#${hydratedPlayer.profile?.PlayerNumber.current}`}
            </p>
          </div>
        </div>
        <PlayerProfile player={hydratedPlayer} />
      </div>
    </DashboardLayout>
  );
};

PlayerProfilePage.defaultProps = {
  player: undefined,
};

export default PlayerProfilePage;