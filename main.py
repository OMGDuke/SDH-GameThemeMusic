import os
import base64
import glob
import subprocess
import json
from typing_extensions import Optional
import decky_plugin
from settings import SettingsManager


class Plugin:
    yt_process: Optional[subprocess.Popen] = None
    music_path = f"{decky_plugin.DECKY_PLUGIN_RUNTIME_DIR}/music"

    async def _main(self):
        self.settings = SettingsManager(
            name="config", settings_directory=decky_plugin.DECKY_PLUGIN_SETTINGS_DIR
        )

    async def _unload(self):
        if self.yt_process is not None:
            self.yt_process.terminate()

    async def set_setting(self, key, value):
        self.settings.setSetting(key, value)

    async def get_setting(self, key, default):
        return self.settings.getSetting(key, default)

    async def search_yt(self, term: str):
        if self.yt_process is not None:
            self.yt_process.terminate()
        self.yt_process = subprocess.Popen(
            [
                f"{decky_plugin.DECKY_PLUGIN_DIR}/yt-dlp",
                f"ytsearch10:{term}",
                "-j",
                "-f",
                "bestaudio",
                "--match-filters",
                f"duration<?{20*60}",  # 20 minutes is too long.
            ],
            stdout=subprocess.PIPE,
        )

    async def next_yt_result(self):
        if (
            not self.yt_process
            or not (output := self.yt_process.stdout)
            or not (line := output.readline().strip())
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

    async def single_yt_url(self, id: str):
        local_matches = [
            x for x in glob.glob(f"{self.music_path}/{id}.*") if os.path.isfile(x)
        ]
        if len(local_matches) > 0:
            assert (
                len(local_matches) == 1
            ), "More than one downloaded audio with same ID found."
            # The audio has already been downloaded, so we can just use that one.
            # However, we cannot use local paths in the <audio> elements, so we'll
            # convert this to a base64-encoded data URL first.
            extension = local_matches[0].split(".")[-1]
            with open(local_matches[0], "rb") as file:
                return f"data:audio/{extension};base64,{base64.b64encode(file.read()).decode()}"
        result = subprocess.run(
            [
                f"{decky_plugin.DECKY_PLUGIN_DIR}/yt-dlp",
                f"{id}",
                "-j",
                "-f",
                "bestaudio",
            ],
            stdout=subprocess.PIPE,
        )
        if len(output := result.stdout.strip()) == 0:
            return None
        entry = json.loads(output)
        return entry["url"]

    async def download_yt_audio(self, id: str):
        subprocess.run(
            [
                f"{decky_plugin.DECKY_PLUGIN_DIR}/yt-dlp",
                f"{id}",
                "-f",
                "bestaudio",
                "-o",
                "%(id)s.%(ext)s",
                "-P",
                self.music_path,
            ],
        )

    async def clear_downloads(self):
        for file in glob.glob(f"{self.music_path}/*"):
            if os.path.isfile(file):
                os.remove(file)
