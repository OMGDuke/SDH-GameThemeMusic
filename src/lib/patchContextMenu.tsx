/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'

import {
  afterPatch,
  fakeRenderComponent,
  findInReactTree,
  findInTree,
  MenuItem,
  Navigation
} from 'decky-frontend-lib'
import useTranslations from '../hooks/useTranslations'

function ChangeLanguageButton({ appId }: { appId: number }) {
  const t = useTranslations()
  return (
    <MenuItem
      key="game-theme-music-change-music"
      onSelected={() => {
        Navigation.Navigate(`/gamethememusic/${appId}`)
      }}
    >
      {t('changeThemeMusic')}...
    </MenuItem>
  )
}

const spliceArtworkItem = (children: any[], appid: number) => {
  children.splice(-1, 0, <ChangeLanguageButton appId={appid} />)
}

const contextMenuPatch = (LibraryContextMenu: any) => {
  return afterPatch(
    LibraryContextMenu.prototype,
    'render',
    (_: Record<string, unknown>[], component: any) => {
      const appid: number = component._owner.pendingProps.overview.appid
      afterPatch(
        component.type.prototype,
        'shouldComponentUpdate',
        ([nextProps]: any, shouldUpdate: any) => {
          if (
            shouldUpdate === true &&
            !nextProps.children.find(
              (x: any) => x?.key === 'game-theme-music-change-music'
            )
          ) {
            let updatedAppid: number = appid
            const parentOverview = nextProps.children.find(
              (x: any) =>
                x?._owner?.pendingProps?.overview?.appid &&
                x._owner.pendingProps.overview.appid !== appid
            )
            if (parentOverview) {
              updatedAppid = parentOverview._owner.pendingProps.overview.appid
            }
            spliceArtworkItem(nextProps.children, updatedAppid)
          }
          return shouldUpdate
        },
        { singleShot: true }
      )

      spliceArtworkItem(component.props.children, appid)
      return component
    }
  )
}

export const getMenu = async () => {
  while (!(window as any).DeckyPluginLoader?.routerHook?.routes) {
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  let LibraryContextMenu = findInReactTree(
    fakeRenderComponent(
      findInTree(
        fakeRenderComponent(
          (window as any).DeckyPluginLoader.routerHook.routes.find(
            (x: any) => x?.props?.path == '/zoo'
          ).props.children.type
        ),
        (x) => x?.route === '/zoo/modals',
        {
          walkable: ['props', 'children', 'child', 'pages']
        }
      ).content.type
    ),
    (x) => x?.title?.includes('AppActionsMenu')
  ).children.type

  if (!LibraryContextMenu?.prototype?.AddToHidden) {
    LibraryContextMenu = fakeRenderComponent(LibraryContextMenu).type
  }
  return LibraryContextMenu
}

export default contextMenuPatch
