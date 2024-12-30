import asyncio
import base64
import datetime
import glob
import json
import logging
import mimetypes
import os
import shutil
import ssl
import sys

import aiohttp
import certifi

import decky  # type: ignore
from settings import SettingsManager  # type: ignore


class Plugin:
    logger: logging.Logger
    yt_process: asyncio.subprocess.Process | None = None
    # We need this lock to make sure the process output isn't read by two concurrent readers at once.
    yt_process_lock = asyncio.Lock()
    music_path = f"{decky.DECKY_PLUGIN_RUNTIME_DIR}/music"
    cache_path = f"{decky.DECKY_PLUGIN_RUNTIME_DIR}/cache"
    ssl_context = ssl.create_default_context(cafile=certifi.where())

    async def _main(self):
        self.logger = decky.logger
        self.settings = SettingsManager(
            name="config", settings_directory=decky.DECKY_PLUGIN_SETTINGS_DIR
        )

    async def _unload(self):
        # Add a check to make sure the process is still running before trying to terminate to avoid ProcessLookupError
        if self.yt_process is not None and self.yt_process.returncode is None:
            self.yt_process.terminate()
            # Wait for process to terminate.
            async with self.yt_process_lock:
                try:
                    # Allow up to 5 seconds for termination.
                    await asyncio.wait_for(self.yt_process.communicate(), timeout=5)
                except TimeoutError:
                    # Otherwise, send SIGKILL.
                    self.yt_process.kill()

    async def set_setting(self, key, value):
        self.settings.setSetting(key, value)

    async def get_setting(self, key, default):
        return self.settings.getSetting(key, default)

    async def search_yt(self, term: str):
        # Add a check to make sure the process is still running before trying to terminate to avoid ProcessLookupError
        if self.yt_process is not None and self.yt_process.returncode is None:
            self.yt_process.terminate()
            # Wait for process to terminate.
            async with self.yt_process_lock:
                await self.yt_process.communicate()
        self.yt_process = await asyncio.create_subprocess_exec(
            f"{decky.DECKY_PLUGIN_DIR}/bin/yt-dlp",
            f"ytsearch10:{term}",
            "-j",
            "-f",
            "bestaudio",
            "--match-filters",
            f"duration<?{20*60}",  # 20 minutes is too long.
            stdout=asyncio.subprocess.PIPE,
            # The returned JSON can get rather big, so we set a generous limit of 10 MB.
            limit=10 * 1024**2,
        )

    async def next_yt_result(self):
        async with self.yt_process_lock:
            if (
                not self.yt_process
                or not (output := self.yt_process.stdout)
                or not (line := (await output.readline()).strip())
            ):
                return None
            entry = json.loads(line)
            return self.entry_to_info(entry)

    @staticmethod
    def entry_to_info(entry):
        return {
            "url": entry["url"],
            "title": entry["title"],
            "id": entry["id"],
            "thumbnail": entry["thumbnail"],
        }

    def local_match(self, id: str) -> str | None:
        local_matches = [
            x for x in glob.glob(f"{self.music_path}/{id}.*") if os.path.isfile(x)
        ]
        if len(local_matches) == 0:
            return None

        assert (
            len(local_matches) == 1
        ), "More than one downloaded audio with same ID found."
        return local_matches[0]

    async def single_yt_url(self, id: str):
        local_match = self.local_match(id)
        if local_match is not None:
            # The audio has already been downloaded, so we can just use that one.
            # However, we cannot use local paths in the <audio> elements, so we'll
            # convert this to a base64-encoded data URL first.
            with open(local_match, "rb") as file:
                if sys.version_info.major == 3 and sys.version_info.minor < 13:
                    mime_type, _ = mimetypes.guess_type(local_match, strict=False)
                else:
                    mime_type, _ = mimetypes.guess_file_type(local_match, strict=False)
                if mime_type is None:
                    self.logger.error(f"Could not determine MIME type for {local_match}")
                    return None
                elif not mime_type.startswith("audio/") and mime_type != "video/webm":
                    self.logger.error(f"File {local_match} is not an audio file")
                    return None
                if mime_type == "video/webm":
                    self.logger.warning("File contains a video extension, assuming it as audio for back compatibility")
                    mime_type = "audio/webm"
                return f"data:{mime_type};base64,{base64.b64encode(file.read()).decode()}"
        result = await asyncio.create_subprocess_exec(
            f"{decky.DECKY_PLUGIN_DIR}/bin/yt-dlp",
            f"{id}",
            "-j",
            "-f",
            "bestaudio",
            stdout=asyncio.subprocess.PIPE,
        )
        if (
            result.stdout is None
            or len(output := (await result.stdout.read()).strip()) == 0
        ):
            return None
        entry = json.loads(output)
        return entry["url"]

    async def download_yt_audio(self, id: str):
        if self.local_match(id) is not None:
            # Already downloaded—there's nothing we need to do.
            return
        process = await asyncio.create_subprocess_exec(
            f"{decky.DECKY_PLUGIN_DIR}/bin/yt-dlp",
            f"{id}",
            "-f",
            "bestaudio",
            "-o",
            "%(id)s.%(ext)s",
            "-P",
            self.music_path,
        )
        await process.communicate()

    async def download_url(self, url: str, id: str):
        async with aiohttp.ClientSession() as session:
            res = await session.get(url, ssl=self.ssl_context)
            res.raise_for_status()
            with open(f"{self.music_path}/{id}.weba", "wb") as file:
                async for chunk in res.content.iter_chunked(1024):
                    file.write(chunk)

    async def clear_downloads(self):
        for file in glob.glob(f"{self.music_path}/*"):
            if os.path.isfile(file):
                os.remove(file)

    async def export_cache(self, cache: dict):
        os.makedirs(self.cache_path, exist_ok=True)
        filename = f"backup-{datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}.json"
        with open(f"{self.cache_path}/{filename}", "w") as file:
            json.dump(cache, file)

    async def list_cache_backups(self):
        return [
            file.split("/")[-1].rsplit(".", 1)[0]
            for file in glob.glob(f"{self.cache_path}/*")
        ]

    async def import_cache(self, name: str):
        with open(f"{self.cache_path}/{name}.json", "r") as file:
            return json.load(file)

    async def clear_cache(self):
        for file in glob.glob(f"{self.cache_path}/*"):
            if os.path.isfile(file):
                os.remove(file)

    async def get_env(self, key: str):
        return getattr(decky, key)

    async def import_audio(self, file: str):
        shutil.copy(file, self.music_path)
        return f"{self.music_path}/{file.split('/')[-1]}"
