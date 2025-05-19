'use server';
/**
 * @fileOverview An AI agent that suggests optimal due dates for tasks based on historical data and task descriptions.
 *
 * - suggestOptimalDueDate - A function that suggests an optimal due date for a task.
 * - SuggestOptimalDueDateInput - The input type for the suggestOptimalDueDate function.
 * - SuggestOptimalDueDateOutput - The return type for the suggestOptimalDueDate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalDueDateInputSchema = z.object({
  taskDescription: z.string().describe('The description of the task.'),
  historicalData: z.string().describe('Historical data of completed tasks, including completion times.'),
});
export type SuggestOptimalDueDateInput = z.infer<typeof SuggestOptimalDueDateInputSchema>;

const SuggestOptimalDueDateOutputSchema = z.object({
  suggestedDueDate: z.string().describe('The suggested due date for the task, in ISO format (YYYY-MM-DD).'),
  reasoning: z.string().describe('The reasoning behind the suggested due date.'),
});
export type SuggestOptimalDueDateOutput = z.infer<typeof SuggestOptimalDueDateOutputSchema>;

export async function suggestOptimalDueDate(input: SuggestOptimalDueDateInput): Promise<SuggestOptimalDueDateOutput> {
  return suggestOptimalDueDateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalDueDatePrompt',
  input: {schema: SuggestOptimalDueDateInputSchema},
  output: {schema: SuggestOptimalDueDateOutputSchema},
  prompt: `You are an AI assistant that suggests optimal due dates for tasks.

  Based on the task description and historical data, determine an appropriate due date for the task.
  Consider the complexity of the task, the user's past performance, and any relevant deadlines.
  Provide the due date in YYYY-MM-DD format.

  Task Description: {{{taskDescription}}}
  Historical Data: {{{historicalData}}}
  `,
});

const suggestOptimalDueDateFlow = ai.defineFlow(
  {
    name: 'suggestOptimalDueDateFlow',
    inputSchema: SuggestOptimalDueDateInputSchema,
    outputSchema: SuggestOptimalDueDateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
