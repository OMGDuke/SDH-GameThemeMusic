import localforage from 'localforage'

const STORAGE_KEY = 'game-theme-music-cache'

localforage.config({
  name: STORAGE_KEY
})

type GameThemeMusicCache = {
  videoId: string | undefined
}

export async function updateCache(appId: number, newData: GameThemeMusicCache) {
  const newCache = await localforage.setItem(appId.toString(), newData)
  return newCache
}

export function clearCache(appId?: number) {
  if (appId?.toString().length) {
    localforage.removeItem(appId.toString())
  } else {
    localforage.clear()
  }
}

export async function getCache(
  appId: number
): Promise<GameThemeMusicCache | null> {
  const cache = await localforage.getItem<GameThemeMusicCache>(appId.toString())
  return cache
}
