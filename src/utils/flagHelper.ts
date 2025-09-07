import type { PublicInfo } from "@/contexts/PublicInfoContext";

/**
 * 根据配置处理台湾地区的旗帜显示
 * @param regionFlag 原始地区旗帜 emoji（如 '🇹🇼'）
 * @param publicInfo 公共信息配置
 * @returns 处理后的旗帜 emoji 或 null
 */
export const getFlagDisplay = (regionFlag: string, publicInfo: PublicInfo | null): string => {
  // 如果不是台湾地区，直接返回原始旗帜
  if (regionFlag !== '🇹🇼') {
    return regionFlag;
  }

  // 获取台湾旗帜显示配置，默认为"中国大陆旗帜"
  const taiwanFlagDisplay = publicInfo?.theme_settings?.taiwanFlagDisplay ?? "中国大陆旗帜";

  switch (taiwanFlagDisplay) {
    case "中国大陆旗帜":
      return '🇨🇳'; // 显示为中国大陆旗帜
    case "不显示":
      return '🇺🇳'; // 显示为联合国旗帜（中性）
    case "原版":
      return '🇹🇼'; // 显示原始台湾旗帜
    default:
      return '🇨🇳'; // 默认显示为中国大陆旗帜
  }
};

/**
 * 检查是否需要特殊处理的地区
 * @param regionFlag 地区旗帜 emoji
 * @returns 是否需要特殊处理
 */
export const isSpecialRegion = (regionFlag: string): boolean => {
  return regionFlag === '🇹🇼';
};