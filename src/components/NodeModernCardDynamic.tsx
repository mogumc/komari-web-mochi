import React, { useMemo, memo } from "react";
import { Card, Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import {
  Activity,
  HardDrive,
  Cpu,
  MemoryStick,
  TrendingUp,
  Network,
  TrendingDown,
  Clock,
  Zap
} from "lucide-react";
import type { NodeBasicInfo } from "@/contexts/NodeListContext";
import type { Record } from "@/types/LiveData";
import { formatUptime } from "./Node";
import { formatBytes, getTrafficStats } from "@/utils";
import "./NodeModernCard.css";

interface ModernCardDynamicProps {
  basic: NodeBasicInfo;
  live: Record | undefined;
  online: boolean;
  forceShowTrafficText?: boolean;
  children: React.ReactNode;
}

const ModernCardDynamicComponent: React.FC<ModernCardDynamicProps> = ({
  basic,
  live,
  online,
  forceShowTrafficText = false,
  children
}) => {
  const { t } = useTranslation();

  const defaultLive: Record = {
    cpu: { usage: 0 },
    ram: { used: 0 },
    swap: { used: 0 },
    load: { load1: 0, load5: 0, load15: 0 },
    disk: { used: 0 },
    network: { up: 0, down: 0, totalUp: 0, totalDown: 0 },
    connections: { tcp: 0, udp: 0 },
    uptime: 0,
    process: 0,
    message: "",
    updated_at: ""
  };

  const liveData = live || defaultLive;

  const memoryPercent = basic.mem_total ? (liveData.ram.used / basic.mem_total) * 100 : 0;
  const diskPercent = basic.disk_total ? (liveData.disk.used / basic.disk_total) * 100 : 0;

  const trafficStats = getTrafficStats(
    liveData.network.totalUp,
    liveData.network.totalDown,
    basic.traffic_limit,
    basic.traffic_limit_type
  );
  const trafficPercentage = trafficStats.percentage;
  const trafficUsage = trafficStats.usage;

  const staticFormattedBytes = useMemo(() => ({
    ramTotal: formatBytes(basic.mem_total),
    ramTotalCompact: formatBytes(basic.mem_total, true),
    diskTotal: formatBytes(basic.disk_total),
    diskTotalCompact: formatBytes(basic.disk_total, true),
    trafficLimit: formatBytes(basic.traffic_limit || 0),
    trafficLimitCompact: formatBytes(basic.traffic_limit || 0, true)
  }), [basic.mem_total, basic.disk_total, basic.traffic_limit]);

  const getProgressColor = (value: number) => {
    if (value > 90) return "#ef4444";
    if (value > 70) return "#f59e0b";
    if (value > 50) return "#3b82f6";
    return "#10b981";
  };

  const progressColors = {
    cpu: getProgressColor(liveData.cpu.usage),
    memory: getProgressColor(memoryPercent),
    disk: getProgressColor(diskPercent),
    traffic: getProgressColor(trafficPercentage)
  };

const StatBlock = memo(({ label, value, usage, color, icon, unit = "%", smallNote}: {
  label: string;
  value: number;
  usage: number;
  color: string;
  icon: React.ReactNode;
  unit?: string;
  smallNote?: React.ReactNode;
}) => {
    const finalUsage = Math.min(100, Math.max(0, usage));

    return (
      <div
        className="bg-accent-2/50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-accent-4 hover:bg-accent-3/50 min-w-0"
        style={{
          contain: "layout style paint",
          contentVisibility: "auto",
          containIntrinsicSize: "auto 100px",
        }}
      >
        <Flex justify="between" align="center" mb="2">
          <Flex gap="1" align="center">
            {icon}
            <Text size="1" weight="medium">{label}</Text>
          </Flex>
          <Text size="2" weight="bold" style={{ color }}>
            {value.toFixed(1)}{unit}
          </Text>
        </Flex>
        <div className="w-full bg-accent-4 rounded-full h-2 overflow-hidden">
          <div
            style={{
              transform: `scaleX(${finalUsage / 100})`,
              transformOrigin: "left center",
              height: "100%",
              background: color,
              borderRadius: "9999px",
              transition: "transform 0.25s ease-out",
              willChange: "transform"
            }}
          />
        </div>
        {smallNote && (
          <Text size="1" color="gray" className="mt-1 hidden sm:block">
            {smallNote}
          </Text>
        )}
      </div>
    );
  }, (prev, next) => {
    return (
      prev.label === next.label &&
      prev.value === next.value &&
      prev.usage === next.usage &&
      prev.color === next.color &&
      prev.unit === next.unit
    );
  });

  const getStatusColor = () => {
    if (!online) return "from-gray-500/5 to-gray-600/5";
    if (liveData.cpu.usage > 90 || memoryPercent > 90) {
      return "from-red-500/5 to-orange-500/5";
    }
    if (liveData.cpu.usage > 70 || memoryPercent > 70) {
      return "from-orange-500/5 to-yellow-500/5";
    }
    return "from-green-500/5 to-emerald-500/5";
  };

  const getStatusGlow = () => {
    return online
      ? liveData.cpu.usage > 90 || memoryPercent > 90
        ? "shadow-lg shadow-red-500/20"
        : liveData.cpu.usage > 70 || memoryPercent > 70
          ? "shadow-lg shadow-orange-500/20"
          : "shadow-lg shadow-green-500/20"
      : "";
  };

  return (
    <Card
      className={`
        modern-card modern-card-hover modern-card-shadow
        relative overflow-visible
        bg-gradient-to-br ${getStatusColor()}
        border border-accent-5 hover:border-accent-8
        cursor-pointer ${getStatusGlow()}
        h-full min-h-fit
      `}
      style={{
        transform: 'scale(1)',
        transformOrigin: 'center'
      }}
    >
      {/* 状态条 */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          online ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-500' : 'bg-gray-500'
        }`}
        style={{
          boxShadow: online ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none'
        }}
      />

      <Flex direction="column" gap="3" className="p-3 sm:p-4 relative z-10">
        {children}

        {/* 资源使用网格 */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 min-w-0">
          {/* CPU */}
          <StatBlock
            label="CPU"
            value={liveData.cpu.usage}
            usage={liveData.cpu.usage}
            color={progressColors.cpu}
            icon={<Cpu size={14} className="text-accent-10" />}
            smallNote={basic.cpu_cores?.toString() && `${basic.cpu_cores?.toString()} cores`}
          />

          {/* 内存 */}
          <StatBlock
            label="RAM"
            value={memoryPercent}
            usage={memoryPercent}
            color={progressColors.memory}
            unit="%"
            icon={<MemoryStick size={14} className="text-accent-10" />}
            smallNote={
              <span className="hidden sm:inline">
                {formatBytes(liveData.ram.used)} / {staticFormattedBytes.ramTotal}
              </span>
            }
          />

          {/* 磁盘和流量 */}
          <div className="bg-accent-2/50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-accent-4 hover:bg-accent-3/50 min-w-0 flex flex-col gap-2 h-full">
            {/* 磁盘 */}
            <div className="flex-1">
              <Flex justify="between" align="center" mb="1">
                <Flex gap="1" align="center">
                  <HardDrive size={12} className="text-accent-10" />
                  <Text size="1" weight="medium" className="text-xs">Disk</Text>
                </Flex>
                <Text size="1" weight="bold" style={{ color: progressColors.disk }}>
                  {diskPercent.toFixed(1)}%
                </Text>
              </Flex>
              <div className="w-full bg-accent-4 rounded-full h-1.5 overflow-hidden">
                <div
                  style={{
                    transform: `scaleX(${diskPercent / 100})`,
                    transformOrigin: "left center",
                    height: "100%",
                    background: progressColors.disk,
                    borderRadius: "9999px",
                    transition: "transform 0.25s ease-out",
                    willChange: "transform"
                  }}
                />
              </div>
              <div className="mt-0.5 text-[10px] sm:text-xs whitespace-nowrap overflow-hidden">
                <Text size="1" color="gray">
                  {formatBytes(liveData.disk.used)} / {staticFormattedBytes.diskTotal}
                </Text>
              </div>
            </div>
            
            {/* 分隔线 */}
            <div className="w-full h-[1px] bg-accent-4" />

            {/* 总流量 */}
            <div className="flex-1 min-h-[4rem]">
              <Flex justify="between" align="center" mb="1">
                <Flex gap="1" align="center">
                  <Activity size={12} className="text-accent-10" />
                  <Text size="1" weight="medium" className="text-xs">Traffic</Text>
                </Flex>
                {Number(basic.traffic_limit) > 0 && !forceShowTrafficText && basic.traffic_limit_type && (
                  <Text size="1" weight="bold" style={{ 
                    color: progressColors.traffic
                  }}>
                    {trafficPercentage.toFixed(1)}%
                  </Text>
                )}
              </Flex>
              {Number(basic.traffic_limit) > 0 && !forceShowTrafficText && basic.traffic_limit_type ? (
                <>
                  <div className="w-full bg-accent-4 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="usage-fill-modern h-full rounded-full relative"
                      style={{
                        '--progress-width': `${Math.min(trafficPercentage, 100)}%`,
                        '--progress-color': progressColors.traffic
                      } as React.CSSProperties}
                    />
                  </div>
                  <div className="mt-0.5 text-[10px] sm:text-xs whitespace-nowrap overflow-hidden">
                    <div className="transform origin-left scale-[0.75] sm:scale-100 inline-block">
                      <Text size="1" color="gray">
                        <span className="inline sm:hidden">
                          {formatBytes(trafficUsage, true)}/{staticFormattedBytes.trafficLimitCompact}
                        </span>
                        <span className="hidden sm:inline">
                          {formatBytes(trafficUsage)} / {staticFormattedBytes.trafficLimit}
                        </span>
                      </Text>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-0.5 text-[10px] sm:text-xs whitespace-nowrap overflow-hidden">
                  <div className="transform origin-left scale-[0.75] sm:scale-100 inline-block">
                    <Text size="1" color="gray">
                      <span className="inline sm:hidden">↑{formatBytes(liveData.network.totalUp, true)} ↓{formatBytes(liveData.network.totalDown, true)}</span>
                      <span className="hidden sm:inline">↑ {formatBytes(liveData.network.totalUp)} ↓ {formatBytes(liveData.network.totalDown)}</span>
                    </Text>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 网络速度 */}
          <div className="bg-accent-2/50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-accent-4 hover:bg-accent-3/50 min-w-0">
            <Flex gap="1" align="center" mb="2">
              <Network size={14} className="text-accent-10" />
              <Text size="1" weight="medium">Speed</Text>
            </Flex>
            <Flex direction="column" gap="1" className="sm:gap-2">
              <Flex justify="between" align="center" className="bg-green-500/10 rounded px-1.5 sm:px-2 py-0.5 sm:py-1 min-w-0">
                <Flex gap="1" align="center">
                  <TrendingUp size={10} className="text-green-500 sm:w-3 sm:h-3" />
                  <Text size="1" weight="medium" className="text-xs sm:text-sm hidden sm:inline">Up</Text>
                </Flex>
                <div className="overflow-hidden">
                  <div className="transform origin-right scale-[0.85] sm:scale-100 inline-block">
                    <Text size="1" weight="bold" className="text-green-600 text-xs sm:text-sm whitespace-nowrap">
                      {formatBytes(liveData.network.up)}/s
                    </Text>
                  </div>
                </div>
              </Flex>
              <Flex justify="between" align="center" className="bg-blue-500/10 rounded px-1.5 sm:px-2 py-0.5 sm:py-1 min-w-0">
                <Flex gap="1" align="center">
                  <TrendingDown size={10} className="text-blue-500 sm:w-3 sm:h-3" />
                  <Text size="1" weight="medium" className="text-xs sm:text-sm hidden sm:inline">Down</Text>
                </Flex>
                <div className="overflow-hidden">
                  <div className="transform origin-right scale-[0.85] sm:scale-100 inline-block">
                    <Text size="1" weight="bold" className="text-blue-600 text-xs sm:text-sm whitespace-nowrap">
                      {formatBytes(liveData.network.down)}/s
                    </Text>
                  </div>
                </div>
              </Flex>
            </Flex>
          </div>
        </div>

        {/* 底部信息 */}
        <Flex justify="between" align="center" className="pt-2 sm:pt-3 border-t border-accent-4">
          <Flex gap="2 sm:gap-3" align="center" className="min-w-0 flex-1">
            <Flex gap="1" align="center" className="min-w-0">
              <Clock size={10} className="text-accent-10 sm:w-3 sm:h-3 flex-shrink-0" />
              <div className="transform origin-left scale-[0.8] sm:scale-100 inline-block">
                <Text size="1" color="gray" className="whitespace-nowrap">
                  {online ? formatUptime(liveData.uptime, t) : t("nodeCard.offline")}
                </Text>
              </div>
            </Flex>
          </Flex>
          {online && (
            <Flex gap="2 sm:gap-3" align="center" className="flex-shrink-0">
              <Flex gap="1" align="center" className="min-w-0 mr-0 sm:mr-3">
                <Zap size={10} className="text-yellow-500 sm:w-3 sm:h-3 flex-shrink-0" />
                <div className="transform origin-left scale-[0.8] sm:scale-100 inline-block">
                  <Text size="1" color="gray" className="whitespace-nowrap">
                    Load: {liveData.load?.load1?.toFixed(2) || "0.00"}
                  </Text>
                </div>
              </Flex>
              <Flex gap="1" align="center" className="flex-shrink-0">
                <Activity size={10} className="text-green-500 sm:w-3 sm:h-3" />
                <div className="transform origin-right scale-[0.8] sm:scale-100 inline-block">
                  <Text size="1" weight="medium" className="text-green-600 whitespace-nowrap">
                    Active
                  </Text>
                </div>
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};

// 使用 React.memo 控制整体渲染优化
export const ModernCardDynamic = React.memo(ModernCardDynamicComponent, (prev, next) => {
  if (prev.basic.uuid !== next.basic.uuid) return false;
  if (prev.basic.mem_total !== next.basic.mem_total) return false;
  if (prev.basic.disk_total !== next.basic.disk_total) return false;
  if (prev.basic.traffic_limit !== next.basic.traffic_limit) return false;
  if (prev.basic.traffic_limit_type !== next.basic.traffic_limit_type) return false;
  if (prev.basic.cpu_cores !== next.basic.cpu_cores) return false;

  if (prev.online !== next.online) return false;
  if (prev.forceShowTrafficText !== next.forceShowTrafficText) return false;

  if (!prev.live && !next.live) return true;
  if (!prev.live || !next.live) return false;

  const prevLive = prev.live;
  const nextLive = next.live;

  return (
    prevLive.cpu.usage === nextLive.cpu.usage &&
    prevLive.ram.used === nextLive.ram.used &&
    prevLive.disk.used === nextLive.disk.used &&
    prevLive.network.up === nextLive.network.up &&
    prevLive.network.down === nextLive.network.down &&
    prevLive.network.totalUp === nextLive.network.totalUp &&
    prevLive.network.totalDown === nextLive.network.totalDown &&
    prevLive.load.load1 === nextLive.load.load1 &&
    prevLive.uptime === nextLive.uptime &&
    prevLive.message === nextLive.message
  );
});