import localforage from 'localforage'

const STORAGE_KEY = 'game-theme-music-cache'

localforage.config({
  name: STORAGE_KEY
})

type GameThemeMusicCache = {
  appName: string
  title: string
  videoId: string | 'off'
  disabled?: boolean
}

export async function updateCache(appId: number, newData: GameThemeMusicCache) {
  const oldCache = await localforage.getItem<GameThemeMusicCache>(
    appId.toString()
  )
  const newCache: GameThemeMusicCache = { ...oldCache, ...newData }
  await localforage.setItem(appId.toString(), newCache)
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
  const data = await localforage.getItem<GameThemeMusicCache>(appId.toString())
  return data
}
