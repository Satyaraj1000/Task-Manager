import { config } from 'dotenv';
config();

import '@/ai/flows/smart-categorization.ts';
import '@/ai/flows/optimal-due-dates.ts';
import '@/ai/flows/task-suggestions.ts';