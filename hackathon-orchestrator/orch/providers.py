"""OpenRouter wiring for the OpenAI Agents SDK.

We expose a ready-to-use MultiProvider backed by an AsyncOpenAI client whose
base_url points at OpenRouter. Every Agents SDK Runner call in this project
goes through this provider so that model names like "anthropic/claude-sonnet-4"
or "openai/gpt-4o-mini" are resolved by OpenRouter.
"""

from __future__ import annotations

from functools import lru_cache

from agents import set_tracing_disabled
from agents.models.multi_provider import MultiProvider
from openai import AsyncOpenAI

from .config import Settings


@lru_cache(maxsize=1)
def _client(settings: Settings) -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=settings.openrouter_api_key,
        base_url=settings.openrouter_base_url,
    )


def build_provider(settings: Settings) -> MultiProvider:
    """Build a MultiProvider that routes OpenAI-compatible calls to OpenRouter."""
    # OpenRouter does not implement OpenAI's tracing ingestion, so we disable it
    # to avoid noisy warnings and extra network calls during hackathon runs.
    set_tracing_disabled(True)

    client = _client(settings)
    return MultiProvider(
        openai_client=client,
        # Let model IDs like "anthropic/claude-sonnet-4" pass through to the
        # OpenAI-compatible backend (OpenRouter) instead of treating "anthropic"
        # as a MultiProvider-specific prefix.
        unknown_prefix_mode="model_id",
    )
