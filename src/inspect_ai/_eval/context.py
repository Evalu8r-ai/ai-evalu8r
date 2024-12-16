from evalu8r_ai._util.dotenv import init_dotenv
from evalu8r_ai._util.hooks import init_hooks
from evalu8r_ai._util.logger import init_http_rate_limit_count, init_logger
from evalu8r_ai.approval._human.manager import init_human_approval_manager
from evalu8r_ai.log._samples import init_active_samples
from evalu8r_ai.model import GenerateConfig, Model
from evalu8r_ai.model._model import init_active_model, init_model_usage
from evalu8r_ai.util._concurrency import init_concurrency
from evalu8r_ai.util._subprocess import init_max_subprocesses


def init_eval_context(
    log_level: str | None,
    log_level_transcript: str | None,
    max_subprocesses: int | None = None,
) -> None:
    init_dotenv()
    init_logger(log_level, log_level_transcript)
    init_concurrency()
    init_max_subprocesses(max_subprocesses)
    init_http_rate_limit_count()
    init_hooks()
    init_active_samples()
    init_human_approval_manager()


def init_task_context(model: Model, config: GenerateConfig = GenerateConfig()) -> None:
    init_active_model(model, config)
    init_model_usage()
