from pathlib import Path

from platformdirs import user_cache_path, user_data_path

from evalu8r_ai._util.constants import PKG_NAME


def evalu8rdata_dir(subdir: str | None) -> Path:
    data_dir = user_data_path(PKG_NAME)
    if subdir:
        data_dir = data_dir / subdir
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir


def evalu8rcache_dir(subdir: str | None) -> Path:
    cache_dir = user_cache_path(PKG_NAME)
    if subdir:
        cache_dir = cache_dir / subdir
    cache_dir.mkdir(parents=True, exist_ok=True)
    return cache_dir
