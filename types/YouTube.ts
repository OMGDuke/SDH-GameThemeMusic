export type YouTubeVideo = { id: string; url?: string }

export type YouTubeVideoPreview = YouTubeVideo & {
  title: string
  thumbnail: string
}

export type YouTubeInitialData = {
  title: string
  videoId: string
  videoThumbnails: { quality: string; url: string }[]
}[]

export type Audio = {
  type: string
  url: string
  audioSampleRate: number
}
