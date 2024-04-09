import localforage from 'localforage'

const STORAGE_KEY = 'game-theme-music-cache'

localforage.config({
  name: STORAGE_KEY
})

type GameSongSettings = {
  videoId?: string | undefined
  volume?: number
}

export async function updateSongSettings(
  appId: number,
  newData: GameSongSettings
) {
  const oldSongSettings = (await localforage.getItem(
    appId.toString()
  )) as GameSongSettings | null
  const newSongSettings = await localforage.setItem(appId.toString(), {
    ...(oldSongSettings || {}),
    ...newData
  })
  return newSongSettings
}

export function clearSongSettings(appId?: number) {
  if (appId?.toString().length) {
    localforage.removeItem(appId.toString())
  } else {
    localforage.clear()
  }
}

export async function getSongSettings(
  appId: number
): Promise<GameSongSettings | null> {
  const songSettings = await localforage.getItem<GameSongSettings>(
    appId.toString()
  )
  return songSettings
}
