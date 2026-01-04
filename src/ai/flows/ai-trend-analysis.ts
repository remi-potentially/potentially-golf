
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TrendAnalysisInputSchema = z.object({
  statName: z.string().describe('The name of the statistic being analyzed (e.g., "Handicap", "Fairways in Regulation").'),
  statHistory: z.array(z.object({
    date: z.string(),
    value: z.number().nullable(),
  })).describe('An array of historical data points for the statistic, sorted from oldest to newest.'),
});

const TrendAnalysisOutputSchema = z.object({
  analysis: z.string().describe('A concise, encouraging paragraph analyzing the trend. It should identify the direction (improving, declining, steady), mention the recent performance, and suggest what continued focus could achieve.'),
});

export async function getTrendAnalysis(input: z.infer<typeof TrendAnalysisInputSchema>): Promise<z.infer<typeof TrendAnalysisOutputSchema>> {
  return trendAnalysisFlow(input);
}

const trendAnalysisPrompt = ai.definePrompt({
  name: 'trendAnalysisPrompt',
  input: { schema: TrendAnalysisInputSchema },
  output: { schema: TrendAnalysisOutputSchema },
  prompt: `You are an expert golf coach who is insightful and encouraging. Your task is to analyze a player's performance trend for a specific statistic.

Statistic to Analyze: {{statName}}

Historical Data (Oldest to Newest):
{{#each statHistory}}
- {{date}}: {{#if value}}{{value}}{{else}}N/A{{/if}}
{{/each}}

Analyze the data provided. Your response must be a single, concise paragraph (around 3-4 sentences).

1.  **Identify the Trend:** Is the stat generally improving, declining, or staying steady? For stats like 'Score to Par' or 'Putts', a lower number is better (declining is good). For stats like 'Fairways in Regulation' or 'Greens in Regulation', a higher number is better (improving is good).
2.  **Acknowledge Recent Performance:** Briefly mention the performance over the last few rounds.
3.  **Provide Actionable Insight:** Frame the analysis in an encouraging way. If it's improving, praise the hard work. If it's declining, frame it as a clear area of opportunity.
4.  **Suggest Future Impact:** Briefly explain what continued focus or improvement in this area will mean for their overall game (e.g., "will lead to more birdie opportunities," "will help eliminate costly double bogeys").

Example (for an improving GIR):
"Your hard work on approach shots is clearly paying off. Your Greens in Regulation percentage has been on a steady upward trend over the last several rounds, which is fantastic to see. Continuing this focus will create more birdie chances and take a lot of pressure off your short game."

Example (for a declining Score to Par):
"This is a great trend to see. Your average score to par has been steadily declining, showing that your overall game is getting sharper. Keeping this momentum will be key to consistently shooting lower scores and reaching your target handicap."

Now, generate the analysis for the "{{statName}}" statistic.`,
});

const trendAnalysisFlow = ai.defineFlow(
  {
    name: 'trendAnalysisFlow',
    inputSchema: TrendAnalysisInputSchema,
    outputSchema: TrendAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await trendAnalysisPrompt(input);
    if (!output) {
      throw new Error("The AI agent failed to generate a trend analysis.");
    }
    return output;
  }
);
