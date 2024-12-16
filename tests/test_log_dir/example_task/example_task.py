from evalu8r_ai import Task, task
from evalu8r_ai.dataset import Sample
from evalu8r_ai.scorer import match


@task
def example_task() -> Task:
    task = Task(
        dataset=[Sample(input="Say Hello", target="Hello")],
        scorer=match(),
        metadata={"meaning_of_life": 42},
    )
    return task
