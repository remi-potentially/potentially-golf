
'use server';

/**
 * @fileOverview A Genkit flow that provides a holistic, in-depth pre-round briefing and focus "cheat sheet"
 * by synthesizing user input, historical data, and live weather information.
 *
 * - getPreRoundFocus - The main function to generate the advice.
 * - PreRoundFocusInput - The input type for the function.
 * - PreRoundFocusOutput - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getCoordinates } from '@/services/geocodingService';
import { getHistoricalWeather, getTodaysForecast } from '@/services/weatherService';

const RoundForPromptSchema = z.object({
  roundDate: z.string(),
  scoreToPar: z.string(),
  fairwaysInRegulation: z.string(),
  greensInRegulation: z.string(),
  puttsTotal: z.string(),
  generalObservations: z.string(),
  courseName: z.string(),
  roundType: z.string(),
});

const JournalEntryForPromptSchema = z.object({
  date: z.string(),
  drillName: z.string(),
  notes: z.string(),
});

const PreRoundFocusInputSchema = z.object({
  userName: z.string().optional().describe("The user's display name."),
  confidence: z.string().describe("The player's self-described areas of confidence before the round."),
  worries: z.string().describe("The player's self-described worries or concerns before the round."),
  courseName: z.string().describe("The name of the course the player is about to play."),
  city: z.string().describe("The city where the course is located."),
  country: z.string().describe("The country where the course is located."),
  playDate: z.string().describe("The date the user will be playing, in YYYY-MM-DD format."),
  allRounds: z.array(RoundForPromptSchema).describe("The user's entire history of logged golf rounds, sorted from most recent to oldest."),
  allJournalEntries: z.array(JournalEntryForPromptSchema).describe("The user's entire history of journal entries from completed drills and round reflections."),
  identifiedAreasOfPotential: z.array(z.string()).describe("A list of the player's statistically identified weaknesses."),
  userHandicap: z.string().optional().describe("The player's current handicap."),
});
export type PreRoundFocusInput = z.infer<typeof PreRoundFocusInputSchema>;

const ProposedGoalSchema = z.object({
    description: z.string().describe("A concise, actionable goal for the round."),
    type: z.enum(['Outcome', 'Process']).describe("The type of goal: 'Outcome' (a measurable result) or 'Process' (a behavioral focus)."),
});

const PreRoundFocusOutputSchema = z.object({
    mainFocus: z.string().describe("A single, concise paragraph that serves as the main mental key for the round. It must acknowledge the user's confidence/worries and connect a statistical weakness to a practice breakthrough."),
    statInsight: z.string().describe("A data-driven insight linking a specific stat improvement to potential shots saved."),
    cheatSheet: z.array(z.string()).describe("An array of 2-3 actionable, simple bullet points for the player to remember on the course, directly referencing their own practice notes."),
    tacticalStrategy: z.string().describe("A concise, tactical paragraph on how to approach the course and conditions, synthesizing weather data with the player's game."),
    proposedGoals: z.array(ProposedGoalSchema).describe("An array of 3-4 relevant, AI-suggested targets (a mix of 'Outcome' and 'Process' goals) based on the analysis."),
});
export type PreRoundFocusOutput = z.infer<typeof PreRoundFocusOutputSchema>;

const getWeatherForGolfTool = ai.defineTool(
    {
        name: 'getWeatherForGolf',
        description: 'Gets the historical and forecast weather for a specific golf location and date.',
        inputSchema: z.object({
            city: z.string().describe('The city where the course is located.'),
            country: z.string().describe('The country where the course is located.'),
            playDate: z.string().describe('The date of play (YYYY-MM-DD)'),
        }),
        outputSchema: z.string(),
    },
    async ({ city, country, playDate }) => {
        try {
            const coordinates = await getCoordinates(city, country);
            if (!coordinates) {
                return 'Could not find location. Please ask the user to be more specific with city and country.';
            }
            const [forecast, historical] = await Promise.all([
                getTodaysForecast(coordinates.lat, coordinates.lon, playDate),
                getHistoricalWeather(coordinates.lat, coordinates.lon),
            ]);
            return `Today's Forecast: ${forecast}\nRecent Weather (Past 5 Days Summary): ${historical}`;
        } catch (error: any) {
            console.error("Error in getWeatherForGolfTool:", error);
            // Return a user-friendly error message to the AI model
            return `An error occurred while fetching weather data: ${error.message}. Please inform the user that weather could not be retrieved.`;
        }
    }
);


const preRoundFocusPrompt = ai.definePrompt({
  name: 'preRoundFocusPrompt',
  tools: [getWeatherForGolfTool],
  input: { schema: PreRoundFocusInputSchema },
  output: { schema: PreRoundFocusOutputSchema },
  prompt: `You must use the getWeatherForGolf tool to get the weather for the user's round before responding. Use the city, country, and playDate from the input to call the tool.

ROLE AND GOAL:
You are 'Potentially', an expert golf coach and course strategist. Your tone is insightful, measured, and tactical. Your primary goal is to provide fresh, evolving insights by synthesising all available data. Act as a trusted guide, helping the user build a clear and confident game plan. Avoid overly effusive or cheerful language.

CRITICAL DATA HIERARCHY:
1.  **User's Live Input (Confidence/Worries):** This is the most important context. Always address their current mental state first.
2.  **Recent ON-COURSE Performance Data:** Statistical weaknesses ('identifiedAreasOfPotential') and journal entries from on-course rounds are the next most important.
3.  **Recent Practice Breakthroughs:** Journal entries from drills (both indoor and outdoor) are used to find positive "feels" and breakthroughs.
4.  **Historical Data & Handicap:** Use for general context, but they are less important than recent trends.
5.  **Indoor Round Data:** ONLY use journal reflections or explicitly positive stats from 'Indoor' rounds to reinforce confidence. Do NOT use poor stats from indoor rounds to identify weaknesses.

CONTEXT 1: PRE-ROUND MENTAL CHECK-IN (User's Live Input)
Feeling Confident About: {{confidence}}
Feeling Worried About: {{worries}}

CONTEXT 2: HISTORICAL PLAYER PROFILE (Data from Firebase)
Current Handicap: {{#if userHandicap}}{{userHandicap}}{{else}}N/A{{/if}}
Identified Areas of Potential (Weaknesses from last 5 ON-COURSE rounds):
{{#each identifiedAreasOfPotential}}
- {{{this}}}
{{/each}}
Recent Breakthroughs & Reflections (from last 3 Journal Entries, including indoor):
{{#each allJournalEntries}}
- {{this.date}} ({{this.drillName}}): "{{this.notes}}"
{{/each}}

CONTEXT 3: COURSE DATA (Data from User Input)
Course Name: {{courseName}}

CONTEXT 4: WEATHER DATA (Must be fetched via tools)
You must use the provided getWeatherForGolf tool to get the weather for the specified location ({{city}}, {{country}}) on the play date ({{playDate}}) to inform your strategy.

YOUR TASK:
Based on all four contexts above, generate a complete pre-round briefing for the user {{userName}}. Your response must have five distinct parts and use varied, natural language.

1.  **Main Focus:**
    *   **CRITICAL TONE INSTRUCTION:** Do not just repeat the user's confidence and worries. Interpret and rephrase their feelings into a direct, professional opening.
    *   Example of what TO DO: "It's good that you're feeling positive about your game. Let's use that as a foundation and manage any specific worries with a clear plan, rather than letting them affect the good feelings you've built in practice."
    *   Synthesise this mental state with their on-course statistical data and a recent practice breakthrough (from any practice type) to create a single, powerful "Main Focus".

2.  **Stat Insight:**
    *   Identify the single biggest statistical opportunity from their "Areas of Potential" based on ON-COURSE data.
    *   Create a single, motivating sentence that quantifies the potential gain (e.g., "A 10% improvement in GIR could save you 2-3 strokes this round.").

3.  **Cheat Sheet:**
    *   Generate 2-3 very short, actionable bullet points.
    *   Each bullet must distill the feeling or key action from one of their "Recent Breakthroughs & Reflections" into a simple swing thought.

4.  **Tactical Course & Conditions Strategy:**
    *   **CRITICAL TONE INSTRUCTION:** Be direct and conversational. Briefly acknowledge the conditions, but immediately pivot to how the player can use their specific skills to manage them. The focus is on the player's game, not the weather.
    *   Example: "Okay, let's think our way around the course. The forecast calls for some wind, which makes that alignment check you've been practicing your key move. A smooth tempo to the centre of the green is the correct play. If the ground is soft, remember the feeling from the 'Towel Drill' to ensure a clean strike—this will help combat that tendency to come up short."
    *   Connect the forecast and inferred ground conditions to a specific skill or feeling the player has been working on in their practice drills.

5.  **Proposed Goals:**
    *   **CRITICAL INSTRUCTION:** Based on your entire analysis of on-course data and recent practice, generate 3-4 actionable goals.
    *   **MIX OF GOALS:** You MUST provide at least one 'Outcome' goal and at least one 'Process' goal.
    *   **RELEVANCE:** The goals must be related to the user's identified weaknesses, worries, or recent practice breakthroughs. One goal should directly address their stated 'worries'.

Now, generate the Main Focus, the Stat Insight, the Cheat Sheet, the Tactical Strategy, and the Proposed Goals.
`,
});


const preRoundFocusFlow = ai.defineFlow(
  {
    name: 'preRoundFocusFlow',
    inputSchema: PreRoundFocusInputSchema,
    outputSchema: PreRoundFocusOutputSchema,
  },
  async (input) => {
    const { output } = await preRoundFocusPrompt(input);
    return output!;
  }
);

export async function getPreRoundFocus(input: PreRoundFocusInput): Promise<PreRoundFocusOutput> {
  return preRoundFocusFlow(input);
}
