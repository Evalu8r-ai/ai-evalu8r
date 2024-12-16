from evalu8r_ai import Task, task
from evalu8r_ai.dataset import Sample
from evalu8r_ai.scorer import includes
from evalu8r_ai.solver import generate, use_tools
from evalu8r_ai.tool import web_browser


@task
def browser():
    return Task(
        dataset=[
            Sample(
                input=""
            )
        ],
        solver=[
            use_tools(web_browser()),
            generate(),
        ],
        scorer=includes(),
        sandbox="docker",
    )
