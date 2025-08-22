import React, { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import type { NodeBasicInfo } from "@/contexts/NodeListContext";
import type { Record } from "@/types/LiveData";
import { ModernCardStatic } from "./NodeModernCardStatic";
import { ModernCardDynamic } from "./NodeModernCardDynamic";

interface ModernCardProps {
  basic: NodeBasicInfo;
  live: Record | undefined;
  online: boolean;
  forceShowTrafficText?: boolean;
}

const ModernCardComponent: React.FC<ModernCardProps> = ({ basic, live, online, forceShowTrafficText = false }) => {
  const staticProps = useMemo(
    () => ({
      basic,
      online,
      errorMessage: live?.message,
    }),
    [basic, online, live?.message]
  );

  const dynamicProps = useMemo(
    () => ({
      basic,
      live,
      online,
      forceShowTrafficText,
    }),
    [basic, live, online, forceShowTrafficText]
  );

  return (
    <Link
      to={`/instance/${basic.uuid}`}
      className="modern-card-link h-full block"
      style={{
        contain: "layout style paint",
        contentVisibility: "auto",
        containIntrinsicSize: "auto 300px",
        transition: "none",
        willChange: "auto",
      }}
    >
      <ModernCardDynamic {...dynamicProps}>
        <ModernCardStatic {...staticProps} />
      </ModernCardDynamic>
    </Link>
  );
};

export const ModernCard = memo(
  ModernCardComponent,
  (prevProps, nextProps) =>
    prevProps.basic.uuid === nextProps.basic.uuid &&
    prevProps.online === nextProps.online &&
    prevProps.forceShowTrafficText === nextProps.forceShowTrafficText &&
    prevProps.live?.updated_at === nextProps.live?.updated_at
);