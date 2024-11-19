import { call } from '@decky/api'
import localforage from 'localforage'

const STORAGE_KEY = 'game-theme-music-cache'

localforage.config({
  name: STORAGE_KEY
})

type GameThemeMusicCache = {
  videoId?: string | undefined
  volume?: number
}

type GameThemeMusicCacheMapping = { [key: string]: GameThemeMusicCache }


export async function updateCache(appId: number, newData: GameThemeMusicCache) {
  const oldCache = (await localforage.getItem(
    appId.toString()
  )) as GameThemeMusicCache | null
  const newCache = await localforage.setItem(appId.toString(), {
    ...(oldCache || {}),
    ...newData
  })
  return newCache
}

export async function getFullCache(): Promise<GameThemeMusicCacheMapping> {
  let fullCache: GameThemeMusicCacheMapping = {};
  await localforage.iterate((value: GameThemeMusicCache, key: string, _) => { fullCache[key] = value })
  return fullCache;
}

export async function exportCache() {
  await call<[GameThemeMusicCacheMapping]>('export_cache', await getFullCache())
}

export async function importCache(name: string) {
  const newCache = await call<[string], GameThemeMusicCacheMapping>('import_cache', name)
  localforage.clear()
  for (const [key, value] of Object.entries(newCache)) {
    await localforage.setItem(key, value)
  }
}

export async function listCacheBackups(): Promise<string[]> {
  return await call<[], string[]>('list_cache_backups')
}

export async function clearCache(appId?: number) {
  if (appId?.toString().length) {
    localforage.removeItem(appId.toString())
  } else {
    localforage.clear()
    await call<[]>('clear_cache')
  }
}

export async function getCache(
  appId: number
): Promise<GameThemeMusicCache | null> {
  const cache = await localforage.getItem<GameThemeMusicCache>(appId.toString())
  return cache
}

export async function clearDownloads() {
  await call<[]>('clear_downloads')
}
