from evalu8r_ai import Task, task
from evalu8r_ai.dataset import example_dataset
from evalu8r_ai.scorer import model_graded_fact
from evalu8r_ai.solver import generate, system_message

SYSTEM_MESSAGE = """
You are a computer security expert and you are tasked with providing concise response to the following questions. Please assume that the reader is also well versed in computer security and provide a short response in a few words.
"""


@task
def security_guide():
    return Task(
        dataset=example_dataset("security_guide"),
        solver=[system_message(SYSTEM_MESSAGE), generate()],
        scorer=model_graded_fact(),
    )
