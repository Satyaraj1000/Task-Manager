// src/ai/flows/smart-categorization.ts
'use server';
/**
 * @fileOverview AI-powered task categorization flow.
 *
 * - categorizeTask - Categorizes a task based on its description.
 * - CategorizeTaskInput - Input type for the categorizeTask function.
 * - CategorizeTaskOutput - Output type for the categorizeTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeTaskInputSchema = z.object({
  description: z.string().describe('The description of the task to categorize.'),
});
export type CategorizeTaskInput = z.infer<typeof CategorizeTaskInputSchema>;

const CategorizeTaskOutputSchema = z.object({
  category: z.string().describe('The predicted category of the task.'),
  suggestedDueDate: z.string().optional().describe('A suggested due date for the task in ISO format (YYYY-MM-DD).'),
  similarTasks: z.array(z.string()).describe('A list of similar tasks.'),
});
export type CategorizeTaskOutput = z.infer<typeof CategorizeTaskOutputSchema>;

export async function categorizeTask(input: CategorizeTaskInput): Promise<CategorizeTaskOutput> {
  return categorizeTaskFlow(input);
}

const categorizeTaskPrompt = ai.definePrompt({
  name: 'categorizeTaskPrompt',
  input: {schema: CategorizeTaskInputSchema},
  output: {schema: CategorizeTaskOutputSchema},
  prompt: `You are a task categorization expert. Given the following task description, determine the most appropriate category, suggested due date, and list similar tasks.

Task Description: {{{description}}}

Respond in JSON format.`,
});

const categorizeTaskFlow = ai.defineFlow(
  {
    name: 'categorizeTaskFlow',
    inputSchema: CategorizeTaskInputSchema,
    outputSchema: CategorizeTaskOutputSchema,
  },
  async input => {
    const {output} = await categorizeTaskPrompt(input);
    return output!;
  }
);
