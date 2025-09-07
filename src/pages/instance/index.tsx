import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLiveData } from "../../contexts/LiveDataContext";
import { useTranslation } from "react-i18next";
import type { Record } from "../../types/LiveData";
import Flag from "../../components/Flag";
import { Flex, SegmentedControl, Text } from "@radix-ui/themes";
import { useNodeList } from "@/contexts/NodeListContext";
import { liveDataToRecords } from "@/utils/RecordHelper";
import EnhancedLoadChart from "./EnhancedLoadChart";
import PingChartV2 from "./PingChartV2";
import { MobileDetailsCard } from "@/components/MobileDetailsCard";
import { MobileLoadChart } from "@/components/MobileLoadChart";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopDetailsCard } from "@/components/DesktopDetailsCard";

export default function InstancePage() {
  const { t } = useTranslation();
  const { onRefresh, live_data } = useLiveData();
  const { uuid } = useParams<{ uuid: string }>();
  const [recent, setRecent] = useState<Record[]>([]);
  const { nodeList } = useNodeList();
  const length = 60 * 5;
  const [chartView, setChartView] = useState<"load" | "ping">("load");
  const isMobile = useIsMobile();
  // #region 初始数据加载
  const node = nodeList?.find((n) => n.uuid === uuid);
  const isOnline = live_data?.data?.online?.includes(uuid || "") || false;
  const liveNodeData = uuid ? live_data?.data?.data?.[uuid] : undefined;

  useEffect(() => {
    fetch(`/api/recent/${uuid}`)
      .then((res) => res.json())
      .then((data) => setRecent(data.data.slice(-length)))
      .catch((err) => console.error("Failed to fetch recent data:", err));
  }, [uuid]);
  // 动态追加数据
  useEffect(() => {
    const unsubscribe = onRefresh((resp) => {
      if (!uuid) return;
      const data = resp.data.data[uuid];
      if (!data) return;

      setRecent((prev) => {
        const newRecord: Record = data;
        // 追加新数据，限制总长度为length（FIFO）
        // 检查是否已存在相同时间戳的记录
        const exists = prev.some(
          (item) => item.updated_at === newRecord.updated_at
        );
        if (exists) {
          return prev; // 如果已存在，不添加新记录
        }

        // 否则，追加新记录
        const updated = [...prev, newRecord].slice(-length);
        return updated;
      });
    });

    // 清理订阅
    return unsubscribe;
  }, [onRefresh, uuid]);
  // #region 布局
  if (isMobile && node) {
    return (
      <Flex className="items-center" direction={"column"} gap="2" style={{ width: "100%" }}>
        {/* 移动端标题栏 */}
        <div className="w-full px-3 py-2" style={{ backgroundColor: "var(--accent-2)", borderRadius: "12px", margin: "0 12px" }}>
          <Flex align="center" gap="2" className="mb-2">
            <Flag flag={node?.region ?? ""} />
            <Text size="3" weight="bold" className="truncate flex-1">
              {node?.name ?? uuid}
            </Text>
          </Flex>
          <Text size="1" color="gray" className="px-2">
            {node?.uuid}
          </Text>
        </div>

        {/* 移动端详情卡片 */}
        <MobileDetailsCard 
          node={node} 
          liveData={liveNodeData} 
          isOnline={isOnline}
        />

        {/* 图表切换 */}
        <div className="w-full px-3 mb-3">
          <SegmentedControl.Root
            radius="full"
            value={chartView}
            onValueChange={(value) => setChartView(value as "load" | "ping")}
            className="w-full"
          >
            <SegmentedControl.Item 
              value="load" 
              className="flex-1"
            >
              {t("nodeCard.load")}
            </SegmentedControl.Item>
            <SegmentedControl.Item 
              value="ping" 
              className="flex-1"
            >
              {t("nodeCard.ping")}
            </SegmentedControl.Item>
          </SegmentedControl.Root>
        </div>

        {/* 图表 */}
        <div className="w-full px-3 pb-4">
          {chartView === "load" ? (
            <MobileLoadChart 
              data={liveDataToRecords(uuid ?? "", recent)} 
              liveData={liveNodeData}
              node={node}
              uuid={uuid}
            />
          ) : (
            <PingChartV2 uuid={uuid ?? ""} />
          )}
        </div>
      </Flex>
    );
  }

  // 桌面端布局
  return (
    <Flex className="items-center" direction={"column"} gap="4" style={{ padding: "0 20px" }}>
      {/* 标题区域 */}
      <div className="w-full max-w-7xl">
        <div className="flex flex-col gap-2 md:p-4 p-3 border-0 rounded-lg" style={{ backgroundColor: "var(--accent-2)" }}>
          <h1 className="flex items-center flex-wrap gap-2">
            <Flag flag={node?.region ?? ""} />
            <Text size="4" weight="bold" wrap="nowrap">
              {node?.name ?? uuid}
            </Text>
            <Text
              size="2"
              style={{
                marginLeft: "8px",
              }}
              className="text-accent-6"
              wrap="nowrap"
            >
              {node?.uuid}
            </Text>
          </h1>
        </div>
      </div>

      {/* 详情卡片 */}
      {node && (
        <DesktopDetailsCard 
          node={node}
          liveData={liveNodeData}
          isOnline={isOnline}
          uuid={uuid ?? ""}
        />
      )}

      {/* 图表切换 */}
      <SegmentedControl.Root
        radius="full"
        value={chartView}
        onValueChange={(value) => setChartView(value as "load" | "ping")}
        size="2"
      >
        <SegmentedControl.Item value="load">
          {t("nodeCard.load")}
        </SegmentedControl.Item>
        <SegmentedControl.Item value="ping">
          {t("nodeCard.ping")}
        </SegmentedControl.Item>
      </SegmentedControl.Root>

      {/* 图表 */}
      <div className="w-full max-w-7xl">
        {chartView === "load" ? (
          <EnhancedLoadChart data={liveDataToRecords(uuid ?? "", recent)} />
        ) : (
          <PingChartV2 uuid={uuid ?? ""} />
        )}
      </div>
    </Flex>
  );
}



