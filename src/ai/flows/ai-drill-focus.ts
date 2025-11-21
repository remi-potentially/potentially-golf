
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalised insights for golf practice drills.
 *
 * It takes a drill name, description, a list of areas of potential, and user performance data as input.
 * It returns a set of structured modifications, each with a title and a personalised description
 * that justifies the advice based on the user's data.
 *
 * - aiDrillFocus - The main function to generate drill modifications.
 * - AiDrillFocusInput - The input type for the aiDrillFocus function.
 * - AiDrillFocusOutput - The output type for the aiDrillFocus function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Simplified context schemas
const RoundContextSchema = z.object({
    scoreToPar: z.string(),
    fairwaysInRegulation: z.string(),
    greensInRegulation: z.string(),
    puttsTotal: z.string(),
    generalObservations: z.string(),
}).optional();

const JournalEntryContextSchema = z.object({
    drillName: z.string(),
    notes: z.string(),
});

const AiDrillFocusInputSchema = z.object({
  drillName: z.string().describe('The name of the golf drill.'),
  drillDescription: z.string().describe('A detailed description of the golf drill.'),
  areasOfPotential: z.array(z.string()).describe('A list of areas of potential to address in the drill. These are internal tags and should not be shown to the user.'),
  lastRound: RoundContextSchema.describe("The user's most recent round stats for context."),
  relevantJournalEntries: z.array(JournalEntryContextSchema).describe("The user's past notes on this specific drill."),
});
export type AiDrillFocusInput = z.infer<typeof AiDrillFocusInputSchema>;

const AiDrillModificationItemSchema = z.object({
  title: z.string().describe('A short, bold-able title for the focus point.'),
  description: z.string().describe('A detailed, personal paragraph explaining the focus point and why it is recommended based on user data.'),
});

const AiDrillFocusOutputSchema = z.object({
  modifications: z.array(AiDrillModificationItemSchema).describe('An array of 2-3 highly specific and actionable modifications or key focus points for the drill, each with a title and description.'),
});
export type AiDrillFocusOutput = z.infer<typeof AiDrillFocusOutputSchema>;

export async function aiDrillFocus(input: AiDrillFocusInput): Promise<AiDrillFocusOutput> {
  return aiDrillFocusFlow(input);
}

const aiDrillFocusPrompt = ai.definePrompt({
  name: 'aiDrillFocusPrompt',
  input: {schema: AiDrillFocusInputSchema},
  output: {schema: AiDrillFocusOutputSchema},
  prompt: `You are an expert golf coach with a supportive and insightful tone. You must use UK English spelling (e.g., 'personalised', 'centre').

You are providing personalised focus points for a user for the drill named "{{drillName}}".

**CRITICAL RULES:**
1.  **DO NOT expose internal tags.** The user wants to work on areas related to these internal tags: \`{{#each areasOfPotential}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}\`. You MUST NOT use these exact tag words in your response. Instead, describe the issue in plain English (e.g., instead of saying "address 'girLow'", say "address your low Greens in Regulation percentage").
2.  **Use UK English spelling** throughout your entire response.

Use the following user data to make your advice deeply personal and justified. Refer to specific stats or notes when possible.

**Last Round Data:**
{{#if lastRound}}
- Score: {{lastRound.scoreToPar}}
- FIR: {{lastRound.fairwaysInRegulation}}%
- GIR: {{lastRound.greensInRegulation}}%
- Putts: {{lastRound.puttsTotal}}
- Player Observations: "{{lastRound.generalObservations}}"
{{else}}
- No recent round data available.
{{/if}}

**Past Reflections on the "{{drillName}}" drill:**
{{#if relevantJournalEntries}}
{{#each relevantJournalEntries}}
- "{{notes}}"
{{/each}}
{{else}}
- No past notes for this drill.
{{/if}}

Your Task:
Provide 2-3 highly specific and actionable modifications for the "{{drillName}}" drill. For each modification, you must provide a 'title' and a 'description'.

- **Title:** A short, clear headline for the focus point.
- **Description:** A detailed paragraph explaining the "what" and the "why". Be very concrete. Explain WHY this is important for the user by directly referencing specific numbers and percentages from their data. For example, instead of saying "you struggle with driving accuracy", say "we're targeting driving accuracy because you hit only 45% of fairways in your last round". This level of specific, data-backed justification is required for every point.

Now, generate the personalised focus points, adhering strictly to the rules.
`});

const aiDrillFocusFlow = ai.defineFlow(
  {
    name: 'aiDrillFocusFlow',
    inputSchema: AiDrillFocusInputSchema,
    outputSchema: AiDrillFocusOutputSchema,
  },
  async input => {
    const {output} = await aiDrillFocusPrompt(input);
    return output!;
  }
);
