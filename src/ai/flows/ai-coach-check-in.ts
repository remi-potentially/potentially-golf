
'use server';

/**
 * @fileOverview A Genkit flow that provides a holistic coach check-in and analyzes user data.
 *
 * - getCoachCheckIn - The main function to generate the check-in message.
 * - CoachCheckInInput - The input type for the function.
 * - CoachCheckInOutput - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Simplified schemas for the prompt context
const RoundStatForPromptSchema = z.object({
  roundDate: z.string(),
  scoreToPar: z.string(),
  fairwaysInRegulation: z.string(),
  greensInRegulation: z.string(),
  puttsTotal: z.string(),
  roundType: z.string(),
});

const JournalEntryForPromptSchema = z.object({
  date: z.string(),
  drillName: z.string(),
  notes: z.string(),
});

const PendingDrillForPromptSchema = z.object({
  name: z.string(),
  category: z.string(),
});

const CoachCheckInInputSchema = z.object({
  userName: z.string().optional().describe("The user's display name."),
  allRounds: z.array(RoundStatForPromptSchema).describe("The user's logged golf rounds, sorted from most recent to oldest."),
  allJournalEntries: z.array(JournalEntryForPromptSchema).describe("The user's journal entries from completed drills."),
  pendingDrills: z.array(PendingDrillForPromptSchema).describe("A list of drills currently in the user's practice plan that are not yet complete."),
  isProactive: z.boolean().optional().describe("Whether this is a proactive check-in initiated by the system."),
});
export type CoachCheckInInput = z.infer<typeof CoachCheckInInputSchema>;

const CoachCheckInOutputSchema = z.object({
  checkInMessage: z.string().describe("A comprehensive, encouraging check-in message from the Coach, structured into paragraphs for different topics."),
});
export type CoachCheckInOutput = z.infer<typeof CoachCheckInOutputSchema>;


export async function getCoachCheckIn(input: CoachCheckInInput): Promise<CoachCheckInOutput> {
  return coachCheckInFlow(input);
}

const coachCheckInPrompt = ai.definePrompt({
  name: 'coachCheckInPrompt',
  input: {schema: CoachCheckInInputSchema},
  output: {schema: CoachCheckInOutputSchema},
  prompt: `You are 'Potentially', an expert golf coach. Your tone is insightful, measured, and professional—more like a trusted guide than a cheerleader. Avoid overly effusive praise.

{{#if isProactive}}
Welcome the user, {{#if userName}}{{userName}}{{else}}there{{/if}}, back to the app. Start by stating you've been reviewing their recent activity.
Then, your task is to analyze their entire history of rounds and practice sessions to provide a holistic, insightful report.
{{else}}
The user, {{#if userName}}{{userName}}{{else}}a player{{/if}}, has requested a progress check-in. Your task is to analyze their entire history of rounds and practice sessions to provide a holistic, insightful report.
{{/if}}

Your analysis MUST be structured into three distinct sections, each in its own paragraph separated by a double newline ('\n\n').

**CRITICAL INSTRUCTION: Prioritize on-course performance data. Use data from 'Indoor' rounds only for identifying positive reflections or breakthroughs in the user's notes, not for statistical trend analysis.**

**1. Positive Trends:**
- Analyze the user's round history (excluding 'Indoor' rounds) to find at least one clear positive statistical trend. Look at Score to Par, Fairways in Regulation, Greens in Regulation, or Total Putts over the last several rounds.
- Connect this trend to their practice history from their journal entries. For example, if their putts are decreasing, see if they have been logging putting drills.
- You MAY reference a positive feeling or breakthrough from an 'Indoor' round's reflection notes if it clearly relates to the on-course statistical improvement. Example: "The work you did on the 'Clock Drill' indoors, where you noted feeling a more confident stroke, seems to be showing up on the course with your putts per round trending down."

**2. Areas for Focus:**
- Identify one or two areas that still offer the biggest opportunity for improvement based on trends from the ON-COURSE round data only.
- Look for patterns. Is there a recurring issue mentioned in their journal notes that also shows up as a poor stat in their on-course rounds?
- Be constructive. Frame this as an "area for focus" or "opportunity," not a weakness.

**3. What's Next in Your Plan:**
- Look at the user's list of pending drills.
- Remind them what they have in their practice plan.
- Explain WHY one or two of those specific drills are important based on your analysis of their ON-COURSE performance.

**User Data for Analysis:**

**All Logged Rounds (most recent first):**
{{#each allRounds}}
- Date: {{roundDate}}, Type: {{roundType}}, Score: {{scoreToPar}}, FIR: {{fairwaysInRegulation}}%, GIR: {{greensInRegulation}}%, Putts: {{puttsTotal}}
{{/each}}

**All Journal Entries from Practice:**
{{#each allJournalEntries}}
- Date: {{date}}, Drill: {{drillName}}, Notes: "{{notes}}"
{{/each}}

**Pending Drills in Practice Plan:**
{{#if pendingDrills}}
{{#each pendingDrills}}
- {{name}} (Category: {{category}})
{{/each}}
{{else}}
- No pending drills.
{{/if}}

Now, generate the concise, insightful, and structured check-in message based on these instructions.
`,
});


const coachCheckInFlow = ai.defineFlow(
  {
    name: 'coachCheckInFlow',
    inputSchema: CoachCheckInInputSchema,
    outputSchema: CoachCheckInOutputSchema,
  },
  async (input) => {
    const {output} = await coachCheckInPrompt(input);
    return {
        checkInMessage: output!.checkInMessage,
    };
  }
);
