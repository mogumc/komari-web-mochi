import React from "react";
import {
  Flex,
} from "@radix-ui/themes";
import { useNodeList } from "@/contexts/NodeListContext";
import { useLiveData } from "@/contexts/LiveDataContext";
import type { NodeBasicInfo } from "@/contexts/NodeListContext";
import type { LiveData } from "@/types/LiveData";
import "./index.css";
import TaskDisplay from "./TaskDisplay";

interface NodeDisplayProps {
  nodes: NodeBasicInfo[];
  liveData: LiveData;
  forceShowTrafficText?: boolean;
}

const defaultLiveData: LiveData = {
  online: [],
  data: {},
};

const Monitor: React.FC<NodeDisplayProps> = ({ }) => {
  const { nodeList } = useNodeList();
  const { live_data } = useLiveData();
  const nodes = nodeList || [];
  const liveData = live_data?.data || defaultLiveData;
  return (
    <div className="w-full">
      {/* 控制栏 */}
      <Flex
        direction={{ initial: "column", sm: "row" }}
        justify="between"
        align={{ initial: "stretch", sm: "center" }}
        gap="4"
        className="control-bar mb-2 p-4 rounded-lg"
      >
      </Flex>

      {/* 节点显示区域 */}
        <>
            <TaskDisplay nodes={nodes} liveData={liveData} />
        </>
    </div>
  );
};

export default Monitor;