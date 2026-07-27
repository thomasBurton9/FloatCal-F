import { markTaskComplete, markTaskIncomplete } from "../api/completionApi";
import { CompletionApiResult } from "../types/api/completionApi";

// date has type string given the task.date is type string
export async function handleTaskComplete(
  value: boolean,
  taskId: number,
  date: string,
): Promise<CompletionApiResult> {
  let result: CompletionApiResult;
  if (value) {
    result = await markTaskComplete(taskId, date);
  } else {
    result = await markTaskIncomplete(taskId, date);
  }

  return result;
}
