import React, { useState } from 'react';
import { Flex, Text, Card, IconButton } from '@radix-ui/themes';
import { ChevronDown, ChevronUp, Cpu, MemoryStick, HardDrive, ArrowDownUp, Activity, Gauge } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatBytes, formatUptime, getTrafficStats } from '@/utils';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Flag from './Flag';
import type { NodeBasicInfo } from '@/contexts/NodeListContext';
import type { Record as LiveNodeData } from '@/types/LiveData';
import './NodeCompactCard.css';

interface NodeCompactCardProps {
  basic: NodeBasicInfo;
  live: LiveNodeData | undefined;
  online: boolean;
}

const NodeCompactCard: React.FC<NodeCompactCardProps> = ({ basic, live, online }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useTranslation();


  const cpuUsage = live?.cpu?.usage ?? 0;
  const memUsage = basic.mem_total > 0 && live?.ram?.used ? (live.ram.used / basic.mem_total) * 100 : 0;
  const diskUsage = basic.disk_total > 0 && live?.disk?.used ? (live.disk.used / basic.disk_total) * 100 : 0;
  const load1 = live?.load?.load1 ?? 0;
  
  // 使用缓存的流量计算
  const trafficStats = getTrafficStats(
    live?.network?.totalUp ?? 0,
    live?.network?.totalDown ?? 0,
    basic.traffic_limit,
    basic.traffic_limit_type
  );
  
  const trafficInfo = (basic.traffic_limit && basic.traffic_limit > 0 && basic.traffic_limit_type) ? {
    usage: trafficStats.usage,
    limit: basic.traffic_limit,
    percentage: trafficStats.percentage
  } : null;

  return (
    <Card size="2" className={`node-compact-card ${isExpanded ? 'expanded' : ''}`}>
      <Flex direction="column" gap="3">
        {/* Collapsed View */}
        <div>
          <Flex justify="between" align="center">
            <Flex align="center" gap="3">
              <div className={`status-indicator ${online ? 'online' : 'offline'}`} />
              <Flag flag={basic.region} />
              <Flex direction="column" gap="1">
                <Link to={`/instance/${basic.uuid}`} className="modern-card-link">
                  <Text weight="bold" size="3">{basic.name}</Text>
                </Link>
              </Flex>
            </Flex>
            <IconButton variant="ghost" size="1" className="expand-button" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </IconButton>
          </Flex>
          <Flex direction="column" gap="2" mt="2">
            <Flex align="center" gap="3" wrap="wrap" className="micro-dashboard" style={{ cursor: 'pointer' }} onClick={() => setIsExpanded(!isExpanded)}>
              <Flex align="center" gap="1" title="CPU Usage">
                <Cpu size={12} />
                <Text size="1">{isMobile ? cpuUsage.toFixed(0) : cpuUsage.toFixed(2)}%</Text>
              </Flex>
              <Flex align="center" gap="1" title="Memory Usage">
                <MemoryStick size={12} />
                <Text size="1">{isMobile ? memUsage.toFixed(0) : memUsage.toFixed(2)}%</Text>
              </Flex>
              <Flex align="center" gap="1" title="Disk Usage">
                <HardDrive size={12} />
                <Text size="1">{isMobile ? diskUsage.toFixed(0) : diskUsage.toFixed(2)}%</Text>
              </Flex>
              <Flex align="center" gap="1" title={`Load Average (1min): ${load1.toFixed(2)}`}>
                <Activity size={12} />
                <Text size="1">{isMobile ? load1.toFixed(1) : load1.toFixed(2)}</Text>
              </Flex>
            </Flex>
            <Flex align="center" gap="3" className="overflow-x-auto" style={{ cursor: 'pointer', flexWrap: 'nowrap' }} onClick={() => setIsExpanded(!isExpanded)}>
              <Flex align="center" gap="1" title="Network Speed" style={{ flexShrink: 0 }}>
                <ArrowDownUp size={12} />
                <Text size="1" style={{ whiteSpace: 'nowrap' }}>
                  ↓{formatBytes(live?.network?.down ?? 0, isMobile)}/s ↑{formatBytes(live?.network?.up ?? 0, isMobile)}/s
                </Text>
              </Flex>
              {trafficInfo && (
                <Flex align="center" gap="1" title={`Traffic: ${formatBytes(trafficInfo.usage)} / ${formatBytes(trafficInfo.limit)} (${trafficInfo.percentage.toFixed(1)}%)`} style={{ flexShrink: 0 }}>
                  <Gauge size={12} />
                  <Text size="1" style={{ whiteSpace: 'nowrap' }}>
                    <span>
                      {isMobile ? trafficInfo.percentage.toFixed(0) : trafficInfo.percentage.toFixed(1)}%
                    </span>
                    <span style={{ marginLeft: '4px' }}>
                      {formatBytes(trafficInfo.usage, isMobile)}/{formatBytes(trafficInfo.limit, isMobile)}
                    </span>
                  </Text>
                </Flex>
              )}
            </Flex>
          </Flex>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="expanded-content">
            <div 
              className="pt-3 border-t border-gray-5"
              style={{
                gap: isMobile ? '8px' : '16px',
                marginTop: isMobile ? '8px' : '12px'
              }}
            >
              {/* 1. System Info */}
              <div className="p-2 bg-gray-a2 rounded" style={{ minHeight: isMobile ? '100px' : '120px' }}>
                <Text size="2" weight="bold" color="gray" className={isMobile ? "mb-1 block" : "mb-2 block"}>System</Text>
                <Flex direction="column" gap="1">
                  <Flex justify="between" align="center">
                    <Text size="1" color="gray">OS:</Text>
                    <Text size="1" style={{ textAlign: 'right', maxWidth: '60%', overflow: isMobile ? 'auto' : 'hidden', textOverflow: isMobile ? 'unset' : 'ellipsis', wordBreak: isMobile ? 'break-word' : 'normal' }}>
                      {basic.os}
                    </Text>
                  </Flex>
                  <Flex justify="between" align="center">
                    <Text size="1" color="gray">Arch:</Text>
                    <Text size="1">{basic.arch}</Text>
                  </Flex>
                  {basic.virtualization && (
                    <Flex justify="between" align="center">
                      <Text size="1" color="gray">Virt:</Text>
                      <Text size="1">{basic.virtualization}</Text>
                    </Flex>
                  )}
                  {basic.kernel_version && !isMobile && (
                    <Flex justify="between" align="center">
                      <Text size="1" color="gray">Kernel:</Text>
                      <Text size="1" style={{ fontSize: '10px', textAlign: 'right', maxWidth: '60%', overflow: isMobile ? 'auto' : 'hidden', textOverflow: isMobile ? 'unset' : 'ellipsis', wordBreak: isMobile ? 'break-word' : 'normal' }}>
                        {basic.kernel_version}
                      </Text>
                    </Flex>
                  )}
                </Flex>
              </div>

              {/* 2. Hardware */}
              <div className="p-2 bg-gray-a2 rounded" style={{ minHeight: isMobile ? '100px' : '120px' }}>
                <Text size="2" weight="bold" color="gray" className={isMobile ? "mb-1 block" : "mb-2 block"}>Hardware</Text>
                <Flex direction="column" gap="1">
                  <Flex justify="between" align="center">
                    <Text size="1" color="gray">CPU:</Text>
                    <Text size="1" title={basic.cpu_name} style={{ textAlign: 'right', maxWidth: '60%', overflow: isMobile ? 'auto' : 'hidden', textOverflow: isMobile ? 'unset' : 'ellipsis', wordBreak: isMobile ? 'break-word' : 'normal' }}>
                      {basic.cpu_cores} Cores
                    </Text>
                  </Flex>
                  <Flex justify="between" align="center">
                    <Text size="1" color="gray">Memory:</Text>
                    <Text size="1">{formatBytes(basic.mem_total, isMobile)}</Text>
                  </Flex>
                  <Flex justify="between" align="center">
                    <Text size="1" color="gray">Disk:</Text>
                    <Text size="1">{formatBytes(basic.disk_total, isMobile)}</Text>
                  </Flex>
                  {basic.gpu_name && (
                    <Flex justify="between" align="center">
                      <Text size="1" color="gray">GPU:</Text>
                      <Text size="1" title={basic.gpu_name} style={{ fontSize: '10px', textAlign: 'right', maxWidth: '60%', overflow: isMobile ? 'auto' : 'hidden', textOverflow: isMobile ? 'unset' : 'ellipsis', wordBreak: isMobile ? 'break-word' : 'normal' }}>
                        {isMobile ? basic.gpu_name : basic.gpu_name.split(' ').slice(0, 2).join(' ')}
                      </Text>
                    </Flex>
                  )}
                </Flex>
              </div>

              {/* 3. Load & Process */}
              <div className="p-2 bg-gray-a2 rounded" style={{ minHeight: isMobile ? '100px' : '120px' }}>
                <Text size="2" weight="bold" color="gray" className={isMobile ? "mb-1 block" : "mb-2 block"}>Load & Process</Text>
                {live ? (
                  <Flex direction="column" gap="1">
                    <Flex justify="between" align="center">
                      <Text size="1" color="gray">Load 1m:</Text>
                      <Text size="1" weight="bold">
                        {live.load?.load1?.toFixed(2) ?? '-'}
                      </Text>
                    </Flex>
                    <Flex justify="between" align="center">
                      <Text size="1" color="gray">Load 5m:</Text>
                      <Text size="1" weight="bold">
                        {live.load?.load5?.toFixed(2) ?? '-'}
                      </Text>
                    </Flex>
                    <Flex justify="between" align="center">
                      <Text size="1" color="gray">Load 15m:</Text>
                      <Text size="1" weight="bold">
                        {live.load?.load15?.toFixed(2) ?? '-'}
                      </Text>
                    </Flex>
                    <Flex justify="between" align="center">
                      <Text size="1" color="gray">Process:</Text>
                      <Text size="1" weight="bold">{live.process ?? 0}</Text>
                    </Flex>
                  </Flex>
                ) : (
                  <Text size="1" color="gray">No data</Text>
                )}
              </div>

              {/* 4. Resource Usage */}
              <div className="p-2 bg-gray-a2 rounded" style={{ minHeight: isMobile ? '100px' : '120px' }}>
                <Text size="2" weight="bold" color="gray" className={isMobile ? "mb-1 block" : "mb-2 block"}>Resources</Text>
                {live ? (
                  <Flex direction="column" gap="1">
                    <Flex justify="between" align="center">
                      <Text size="1" color="gray">Memory:</Text>
                      <Text size="1">
                        {formatBytes(live.ram?.used ?? 0, isMobile)}/{formatBytes(basic.mem_total, isMobile)}
                      </Text>
                    </Flex>
                    {basic.swap_total > 0 && (
                      <Flex justify="between" align="center">
                        <Text size="1" color="gray">Swap:</Text>
                        <Text size="1">
                          {formatBytes(live.swap?.used ?? 0, isMobile)}/{formatBytes(basic.swap_total, isMobile)}
                        </Text>
                      </Flex>
                    )}
                    <Flex justify="between" align="center">
                      <Text size="1" color="gray">Disk:</Text>
                      <Text size="1">
                        {formatBytes(live.disk?.used ?? 0, isMobile)}/{formatBytes(basic.disk_total, isMobile)}
                      </Text>
                    </Flex>
                    <Flex justify="between" align="center">
                      <Text size="1" color="gray">TCP/UDP:</Text>
                      <Text size="1">{live.connections?.tcp ?? 0}/{live.connections?.udp ?? 0}</Text>
                    </Flex>
                  </Flex>
                ) : (
                  <Text size="1" color="gray">No data</Text>
                )}
              </div>

              {/* 5. Network */}
              <div className="p-2 bg-gray-a2 rounded" style={{ minHeight: isMobile ? '100px' : '120px' }}>
                <Text size="2" weight="bold" color="gray" className={isMobile ? "mb-1 block" : "mb-2 block"}>Network</Text>
                {live ? (
                  <Flex direction="column" gap="1">
                    <Flex justify="between" align="center">
                      <Text size="1" color="gray">Speed:</Text>
                      <Flex direction="column" align="end" gap="0">
                        <Text size="1" style={{ lineHeight: '1.2' }}>
                          ↓{formatBytes(live?.network?.down ?? 0, isMobile)}/s
                        </Text>
                        <Text size="1" style={{ lineHeight: '1.2' }}>
                          ↑{formatBytes(live?.network?.up ?? 0, isMobile)}/s
                        </Text>
                      </Flex>
                    </Flex>
                    <Flex justify="between" align="center">
                      <Text size="1" color="gray">Total:</Text>
                      <Flex direction="column" align="end" gap="0">
                        <Text size="1" style={{ lineHeight: '1.2' }}>
                          ↓{formatBytes(live?.network?.totalDown ?? 0, isMobile)}
                        </Text>
                        <Text size="1" style={{ lineHeight: '1.2' }}>
                          ↑{formatBytes(live?.network?.totalUp ?? 0, isMobile)}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                ) : (
                  <Text size="1" color="gray">No data</Text>
                )}
              </div>

              {/* 6. Status */}
              <div className="p-2 bg-gray-a2 rounded" style={{ minHeight: isMobile ? '100px' : '120px' }}>
                <Text size="2" weight="bold" color="gray" className={isMobile ? "mb-1 block" : "mb-2 block"}>Status</Text>
                {live ? (
                  <Flex direction="column" gap="1">
                    <Flex justify="between" align="center">
                      <Text size="1" color="gray">Uptime:</Text>
                      <Text size="1">{formatUptime(live.uptime, t)}</Text>
                    </Flex>
                    {live.updated_at && (
                      <Flex justify="between" align="center">
                        <Text size="1" color="gray">Updated:</Text>
                        <Text size="1">{new Date(live.updated_at).toLocaleTimeString()}</Text>
                      </Flex>
                    )}
                    {basic.version && (
                      <Flex justify="between" align="center">
                        <Text size="1" color="gray">Version:</Text>
                        <Text size="1">{basic.version}</Text>
                      </Flex>
                    )}
                    {live.message && (
                      <Flex justify="between" align="center">
                        <Text size="1" color="gray">Message:</Text>
                        <Text size="1" title={live.message} style={{ fontSize: '10px', textAlign: 'right', maxWidth: '60%', overflow: isMobile ? 'auto' : 'hidden', textOverflow: isMobile ? 'unset' : 'ellipsis', wordBreak: isMobile ? 'break-word' : 'normal' }}>
                          {live.message}
                        </Text>
                      </Flex>
                    )}
                  </Flex>
                ) : (
                  <Text size="1" color="gray">Offline</Text>
                )}
              </div>
            </div>
          </div>
        )}
      </Flex>
    </Card>
  );
};

export default NodeCompactCard;