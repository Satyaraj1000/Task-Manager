'use server';
/**
 * @fileOverview An AI agent that suggests similar and relevant tasks based on a given task description.
 *
 * - suggestTasks - A function that generates task suggestions.
 * - SuggestTasksInput - The input type for the suggestTasks function.
 * - SuggestTasksOutput - The return type for the suggestTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTasksInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The description of the task for which suggestions are needed.'),
});
export type SuggestTasksInput = z.infer<typeof SuggestTasksInputSchema>;

const SuggestTasksOutputSchema = z.object({
  suggestedTasks: z
    .array(z.string())
    .describe('An array of suggested tasks based on the input task description.'),
  category: z.string().describe('The category that this task belongs to.'),
  optimalDueDate: z.string().describe('The optimal due date for the task.'),
});
export type SuggestTasksOutput = z.infer<typeof SuggestTasksOutputSchema>;

export async function suggestTasks(input: SuggestTasksInput): Promise<SuggestTasksOutput> {
  return suggestTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTasksPrompt',
  input: {schema: SuggestTasksInputSchema},
  output: {schema: SuggestTasksOutputSchema},
  prompt: `You are a task management assistant. Given a task description, you will suggest similar and relevant tasks, categorize the task, and suggest an optimal due date.

Task Description: {{{taskDescription}}}

Suggested Tasks:`,
});

const suggestTasksFlow = ai.defineFlow(
  {
    name: 'suggestTasksFlow',
    inputSchema: SuggestTasksInputSchema,
    outputSchema: SuggestTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
