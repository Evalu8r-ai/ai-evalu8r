from test_helpers.utils import file_check

from evalu8r_ai import Task, task
from evalu8r_ai.dataset import Sample
from evalu8r_ai.scorer import includes
from evalu8r_ai.solver import generate


@task
def task1():
    return Task(
        dataset=[Sample(input="What is 1+1?", target="2")],
        solver=[file_check("task1.py"), generate()],
        scorer=includes(),
        metadata={"task_idx": 1},
    )
