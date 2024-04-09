import os
from urllib.parse import parse_qs, quote, urlparse
import urllib.request
import decky_plugin
from settings import SettingsManager





class Plugin:
    async def _main(self):
         self.settings = SettingsManager(name="config", settings_directory=decky_plugin.DECKY_PLUGIN_SETTINGS_DIR)

    async def _unload(self):
        pass

    async def set_setting(self, key, value):
        self.settings.setSetting(key, value)

    async def get_setting(self, key, default):
        return self.settings.getSetting(key, default)
    
    async def _get_path_from_app_id(self, app_id: str) -> str:
        """
        Get the file path if the appId exists, otherwise return None
        """
        file_path: str = os.path.join(
            decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, f"{app_id}.mp3"
        )
        if os.path.exists(file_path):
            return file_path
        return None

    def _download_audio(self, url: str, video_id: str, audio_type: str) -> str:
        """
        Downloads the video from the url and saves it to the video folder.
        """
        decky_plugin.logger.info(f"download audio started {video_id}")
        headers: dict = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
        }
        file_path: str = os.path.join(
            decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, f"{video_id}.{audio_type}"
        )
        request = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(
            request
        ) as response:
            if response.status == 200:
                with open(file_path, "wb") as file:
                    while True:
                        chunk = response.read(500 * 1024)  # Read 500kb at a time
                        if not chunk:
                            break
                        file.write(chunk)
            else:
                decky_plugin.logger.error(
                    f"Failed to download audio for {video_id}: status {response.status}"
                )
        return file_path