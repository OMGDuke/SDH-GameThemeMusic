declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '@decky/manifest' {
  const name: string
  const author: string
  const flags: string[]
  const api_version: number | undefined
  const publish: {
    tags: string[]
    description: string
    image: string
  }
}

declare module '@decky/pkg' {
  const name: string
  const version: string
  const description: string
  const type: string
  const scripts: {
    [key: string]: string
  }
  const repository: {
    type: string
    url: string
  }
  const keywords: string[]
  const author: string
  const license: string
  const bugs: {
    url: string
  }
  const homepage: string
  const remote_binary: {
    name: string
    url: string
    sha265hash: string
  }[]
  const devDependencies: {
    [key: string]: string
  }
  const dependencies: {
    [key: string]: string
  }
  const pnpm: {
    peerDependencyRules: {
      ignoreMissing: string[]
    }
  }
}
