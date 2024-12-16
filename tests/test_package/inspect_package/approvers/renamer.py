from copy import copy

from evalu8r_ai.approval import Approval, Approver, approver
from evalu8r_ai.solver import TaskState
from evalu8r_ai.tool import ToolCall, ToolCallView


@approver
def renamer(function_name: str) -> Approver:
    async def approve(
        message: str,
        call: ToolCall,
        view: ToolCallView,
        state: TaskState | None = None,
    ) -> Approval:
        call = copy(call)
        call.function = function_name
        return Approval(decision="modify", modified=call)

    return approve
