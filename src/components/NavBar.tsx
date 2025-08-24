import ThemeSwitch from "./ThemeSwitch";
import ColorSwitch from "./ColorSwitch";
import LanguageSwitch from "./Language";
import LoginDialog from "./Login";
import FloatingMenu from "./FloatingMenu";
import { Link } from "react-router-dom";
import { usePublicInfo } from "@/contexts/PublicInfoContext";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
const NavBar = () => {
  const { publicInfo } = usePublicInfo();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  
  return (
    <>
      <nav className="nav-bar flex rounded-b-lg items-center gap-3 max-h-16 justify-end min-w-full p-2 px-4">
        <div className="mr-auto flex">
          {/* <img src="/assets/logo.png" alt="Komari Logo" className="w-10 object-cover mr-2 self-center"/> */}
          <Link to="/">
            <label className="text-3xl font-bold ">{publicInfo?.sitename}</label>
          </Link>
          <div className="hidden flex-row items-end md:flex">
            <div
              style={{ color: "var(--accent-3)" }}
              className="border-solid border-r-2 mr-1 mb-1 w-2 h-2/3"
            />
            <label
              className="text-base font-bold"
              style={{ color: "var(--accent-4)" }}
            >
              Komari Monitor
            </label>
          </div>
        </div>

        {/* Desktop buttons - hide on mobile */}
        {!isMobile && (
          <>
            <ThemeSwitch />
            <ColorSwitch />
            <LanguageSwitch />
            {publicInfo?.private_site ? (<LoginDialog
              autoOpen={publicInfo?.private_site}
              info={t('common.private_site')}
              onLoginSuccess={() => { window.location.reload(); }}
            />) : (<LoginDialog />)}
          </>
        )}
      </nav>
      
      {/* Floating menu for mobile */}
      <FloatingMenu />
    </>
  );
};
export default NavBar;
