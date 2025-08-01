import localforage from 'localforage';
import { Knife } from '../app/components/canvas3D/constant/MaterialData';

// 配置localforage
localforage.config({
  name: 'material-management-system',
  storeName: 'knife-cache'
});

// 生成缓存键
export function generateCacheKey(materialId: string, modelId: string, modelFilePath: string): string {
  return `${materialId}-${modelId}-${modelFilePath}`;
}

// 缓存刀版数据
export async function cacheKnifeData(
  materialId: string, 
  modelId: string, 
  modelFilePath: string, 
  knives: Knife[]
): Promise<void> {
  try {
    const key = generateCacheKey(materialId, modelId, modelFilePath);
    await localforage.setItem(key, knives);
    console.log('刀版数据已缓存:', key);
  } catch (error) {
    console.error('缓存刀版数据失败:', error);
  }
}

// 获取缓存的刀版数据
export async function getCachedKnifeData(
  materialId: string, 
  modelId: string, 
  modelFilePath: string
): Promise<Knife[] | null> {
  try {
    const key = generateCacheKey(materialId, modelId, modelFilePath);
    const cachedData = await localforage.getItem<Knife[]>(key);
    if (cachedData) {
      console.log('从缓存获取刀版数据:', key);
      return cachedData;
    }
    return null;
  } catch (error) {
    console.error('获取缓存刀版数据失败:', error);
    return null;
  }
}

// 清除特定物料的刀版缓存
export async function clearKnifeCache(
  materialId: string, 
  modelId: string, 
  modelFilePath: string
): Promise<void> {
  try {
    const key = generateCacheKey(materialId, modelId, modelFilePath);
    await localforage.removeItem(key);
    console.log('刀版缓存已清除:', key);
  } catch (error) {
    console.error('清除刀版缓存失败:', error);
  }
}

// 清除所有刀版缓存
export async function clearAllKnifeCache(): Promise<void> {
  try {
    await localforage.clear();
    console.log('所有刀版缓存已清除');
  } catch (error) {
    console.error('清除所有刀版缓存失败:', error);
  }
}

// 获取所有缓存键
export async function getAllCacheKeys(): Promise<string[]> {
  try {
    return await localforage.keys();
  } catch (error) {
    console.error('获取缓存键失败:', error);
    return [];
  }
}

// 检查缓存是否存在
export async function hasKnifeCache(
  materialId: string, 
  modelId: string, 
  modelFilePath: string
): Promise<boolean> {
  try {
    const key = generateCacheKey(materialId, modelId, modelFilePath);
    const cachedData = await localforage.getItem(key);
    return cachedData !== null;
  } catch (error) {
    console.error('检查刀版缓存失败:', error);
    return false;
  }
} 