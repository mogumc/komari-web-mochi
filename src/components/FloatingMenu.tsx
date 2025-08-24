import React, { useState } from "react";
import { IconButton, Flex } from "@radix-ui/themes";
import { Menu, X, Sun, Palette, Languages, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import ThemeSwitch from "./ThemeSwitch";
import ColorSwitch from "./ColorSwitch";
import LanguageSwitch from "./Language";
import LoginDialog from "./Login";
import { usePublicInfo } from "@/contexts/PublicInfoContext";
import { useTranslation } from "react-i18next";
import "./FloatingMenu.css";

const FloatingMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { publicInfo } = usePublicInfo();
  const { t } = useTranslation();

  // Only show on mobile
  if (!isMobile) return null;

  const menuItems = [
    {
      id: "theme",
      icon: <Sun size={20} />,
      label: t("Theme"),
      component: <ThemeSwitch />
    },
    {
      id: "color",
      icon: <Palette size={20} />,
      label: t("Color"),
      component: <ColorSwitch />
    },
    {
      id: "language",
      icon: <Languages size={20} />,
      label: t("Language"),
      component: <LanguageSwitch />
    },
    {
      id: "login",
      icon: <Settings size={20} />,
      label: t("Settings"),
      component: <LoginDialog />
    }
  ];

  return (
    <>
      {/* Private site login dialog for mobile */}
      {publicInfo?.private_site && (
        <LoginDialog
          autoOpen={true}
          showSettings={false}
          info={t('common.private_site')}
          onLoginSuccess={() => { window.location.reload(); }}
        />
      )}
      
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-20 right-4 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <IconButton
          size="3"
          variant="solid"
          className="floating-menu-trigger shadow-lg"
          style={{
            background: isOpen ? "var(--red-9)" : "var(--accent-9)",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90 }}
                animate={{ rotate: 0 }}
                exit={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90 }}
                animate={{ rotate: 0 }}
                exit={{ rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <Menu size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </IconButton>
      </motion.div>

      {/* Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-36 right-4 z-45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Flex direction="column" gap="3" align="end">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                  className="flex items-center gap-3"
                >
                  {/* Label */}
                  <motion.div
                    className="bg-gray-1 px-3 py-1.5 rounded-lg shadow-md border border-gray-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                  >
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  </motion.div>

                  {/* Button or Component */}
                  <div className="floating-menu-item">
                    {item.component}
                  </div>
                </motion.div>
              ))}
            </Flex>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingMenu;