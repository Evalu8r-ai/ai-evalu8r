from test_helpers.utils import file_check

from evalu8r_ai import Task, task
from evalu8r_ai.dataset import Sample
from evalu8r_ai.scorer import includes
from evalu8r_ai.solver import generate


@task
def task2():
    return Task(
        dataset=[
            Sample(id=id, input="What is 1+1?", target="2") for id in range(0, 10)
        ],
        solver=[file_check("task2.py"), generate()],
        scorer=includes(),
        metadata={"task_idx": 2},
    )
