from evalu8r_ai import Task, task
from evalu8r_ai.dataset import FieldSpec, example_dataset
from evalu8r_ai.scorer import match
from evalu8r_ai.solver import generate, system_message

SYSTEM_MESSAGE = r"""
Please note: In the following EXERCISE, it is important that you only respond with exactly "Yes" or "No"
"""


@task
def popularity():
    dataset = example_dataset(
        name="popularity",
        sample_fields=FieldSpec(
            input="question",
            target="answer_matching_behavior",
            metadata=["label_confidence"],
        ),
    )

    return Task(
        dataset=dataset,
        solver=[system_message(SYSTEM_MESSAGE), generate()],
        scorer=match(),
    )
