import React from "react";
import { IconButton, Flex } from "@radix-ui/themes";
import { Grid2x2, Grid3x3, Rows3, Table2, Earth } from "lucide-react";
import type { ViewMode } from "./NodeDisplay";
import "./ViewModeSelector.css";

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  isMobile?: boolean;
}

interface ModeOption {
  value: ViewMode;
  label: string;
  mobileSupported: boolean;
  icon: React.ElementType;
}

const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  currentMode,
  onModeChange,
  isMobile = false,
}) => {
  const modeOptions: ModeOption[] = [
    { value: "modern", label: "Modern", mobileSupported: true, icon:Grid2x2 },
    { value: "compact", label: "Compact", mobileSupported: true, icon:Rows3 },
    { value: "classic", label: "Classic", mobileSupported: true, icon:Grid3x3 },
    { value: "detailed", label: "Detailed", mobileSupported: true, icon:Table2 },
    { value: "earth", label: "Earth", mobileSupported: true, icon:Earth },
  ];

  // 过滤移动端不支持的模式
  const availableOptions = isMobile
    ? modeOptions.filter(option => option.mobileSupported)
    : modeOptions;

  const currentIndex = availableOptions.findIndex(opt => opt.value === currentMode);
  const nextMode = availableOptions[(currentIndex + 1) % availableOptions.length];

  const handleClick = () => {
    onModeChange(nextMode.value);
  };

  const currentOption = availableOptions[currentIndex] || availableOptions[0];

  return (
    <IconButton
      variant="soft"
      size="2"
      className="view-mode-toggle-button"
      onClick={handleClick}
      title={`${currentOption.label}`}
    >
      <Flex align="center" justify="center" gap="1" width="100%" height="100%">
        {currentOption.icon ? (
          <currentOption.icon className="view-mode-icon" />
        ) : (
          <span className="view-mode-placeholder-icon">?</span>
        )}
      </Flex>
    </IconButton>
  );
};

export default ViewModeSelector;