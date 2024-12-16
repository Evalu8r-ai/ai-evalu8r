import pytest
from test_helpers.utils import skip_if_no_openai

from evalu8r_ai import Task, eval
from evalu8r_ai._util.environ import environ_var
from evalu8r_ai.model._model import get_model


@skip_if_no_openai
def test_disable_model_api_raise_error():
    with environ_var("EVALU8R_DISABLE_MODEL_API", "1"):
        with pytest.raises(RuntimeError):
            eval(Task(), model="openai/gpt-4o", debug_errors=True)


@skip_if_no_openai
def test_disable_model_api():
    with environ_var("EVALU8R_DISABLE_MODEL_API", "1"):
        log = eval(Task(), model="openai/gpt-4o")[0]
        assert log.status == "error"
        assert log.error
        assert "EVALU8R_DISABLE_MODEL_API" in log.error.message


def test_disable_model_api_mockllm():
    with environ_var("EVALU8R_DISABLE_MODEL_API", "1"):
        eval(Task(), model="mockllm/model")


@skip_if_no_openai
def test_disable_model_api_only_on_generate():
    with environ_var("EVALU8R_DISABLE_MODEL_API", "1"):
        get_model("openai/gpt-4o")
