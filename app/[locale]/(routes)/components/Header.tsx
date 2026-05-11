import { getUser } from "@/actions/get-user";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotificationComponent from "@/components/notification";
import FulltextSearch from "./FulltextSearch";
import { HeaderAvatar } from "./Avatar";

type Props = {
  id: string;
  lang: string;
};

const Header = async ({ id, lang }: Props) => {
  const user = await getUser();

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-20">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <FulltextSearch />
        </div>
        <div className="flex items-center gap-2">
          {/* <CommandComponent /> */}
          {/* <Feedback /> */}
          <ThemeToggle />
          <NotificationComponent />

          <HeaderAvatar
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
            }}
          />
        </div>
      </div>
      <Separator />
    </>
  );
};

export default Header;
