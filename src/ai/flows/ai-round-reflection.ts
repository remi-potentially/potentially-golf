

'use server';

/**
 * @fileOverview This flow now acts as an orchestrator for the post-round debrief,
 * combining the analysis of several specialist agents and automatically generating a practice plan.
 *
 * - analyzeRoundReflection - A function that analyzes a golf round, provides a reflection,
 *   and automatically prescribes and adds drills to the user's practice plan.
 * - AnalyzeRoundReflectionInput - The input type for the analyzeRoundReflection function.
 * - AnalyzeRoundReflectionOutput - The return type for the analyzeRoundReflection function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getCoordinates } from '@/services/geocodingService';
import { getWeatherForDate } from '@/services/weatherService';
import { buildPracticePlan } from './agent-coach-planning'; // Import the CPA

// Define benchmarks for various handicap levels
const handicapBenchmarks: Record<string, { drivingFIR: number; approachGIR: number; shortGameUpAndDown: number; puttingPuttsPerRound: number; putting3PuttsPerRound: number; }> = {
  'Scratch': { drivingFIR: 60, approachGIR: 67, shortGameUpAndDown: 55, puttingPuttsPerRound: 29, putting3PuttsPerRound: 0.5 },
  '5': { drivingFIR: 55, approachGIR: 55, shortGameUpAndDown: 45, puttingPuttsPerRound: 30, putting3PuttsPerRound: 1 },
  '10': { drivingFIR: 50, approachGIR: 45, shortGameUpAndDown: 35, puttingPuttsPerRound: 31, putting3PuttsPerRound: 1.5 },
  '15': { drivingFIR: 45, approachGIR: 38, shortGameUpAndDown: 30, puttingPuttsPerRound: 32, putting3PuttsPerRound: 2 },
  '20': { drivingFIR: 40, approachGIR: 30, shortGameUpAndDown: 25, puttingPuttsPerRound: 34, putting3PuttsPerRound: 2.5 },
  '25': { drivingFIR: 35, approachGIR: 25, shortGameUpAndDown: 20, puttingPuttsPerRound: 36, putting3PuttsPerRound: 3 },
  '30': { drivingFIR: 30, approachGIR: 20, shortGameUpAndDown: 15, puttingPuttsPerRound: 38, putting3PuttsPerRound: 3.5 },
};

const getWeatherForRoundTool = ai.defineTool(
    {
        name: 'getWeatherForRound',
        description: 'Gets the historical weather for a specific golf location and date, if the location is known.',
        inputSchema: z.object({
            city: z.string().optional().describe('The city where the course is located.'),
            country: z.string().optional().describe('The country where the course is located.'),
            roundDate: z.string().describe('The date of the round (YYYY-MM-DD)'),
        }),
        outputSchema: z.string(),
    },
    async ({ city, country, roundDate }) => {
        if (!city || !country) {
            return 'Location not provided for round.';
        }
        try {
            const coordinates = await getCoordinates(city, country);
            if (!coordinates) {
                return 'Could not determine location from provided info.';
            }
            return await getWeatherForDate(coordinates.lat, coordinates.lon, new Date(roundDate));
        } catch (error: any) {
            return `Could not retrieve weather: ${error.message}`;
        }
    }
);

const SelectedGoalSchema = z.object({
    description: z.string(),
    type: z.enum(['Outcome', 'Process']),
});

const IdentifiedAreaOfPotentialSchema = z.object({
  tag: z.string(),
  score: z.number(),
});

// Input schema for the prompt, including optional benchmark data
const AnalyzeRoundReflectionPromptInputSchema = z.object({
  roundId: z.string().describe("The unique ID of the round being analyzed."),
  userName: z.string().optional().describe("The user's display name."),
  currentHandicap: z.string().describe('The current handicap of the player.'),
  roundType: z.string().describe('The type of round played (e.g., Casual, Competition).'),
  holesPlayed: z.string().describe('The number of holes played (9 or 18).'),
  grossScore: z.string().describe('The gross score of the round.'),
  coursePar: z.string().describe('The course par for the round.'),
  scoreToPar: z.string().describe('The score to par for the round.'),
  fairwaysInRegulation: z.string().describe('The percentage of fairways hit in regulation. Empty if not logged.'),
  greensInRegulation: z.string().describe('The percentage of greens hit in regulation. Empty if not logged.'),
  upAndDown: z.string().optional().describe('The percentage of up and downs achieved. Empty if not logged.'),
  sandSavesAttempted: z.string().optional().describe('The number of sand save attempts. Empty if not logged.'),
  sandSavesMade: z.string().optional().describe('The number of sand saves made. Empty if not logged.'),
  puttsTotal: z.string().describe('The total number of putts for the round. Empty if not logged.'),
  threePuttsOrMore: z.string().describe('The number of three putts or more. Empty if not logged.'),
  puttingSummary: z.string().describe('A summary of putting performance by distance.'),
  courseName: z.string().describe('The name of the course played.'),
  city: z.string().optional().describe('The city where the course is located.'),
  country: z.string().optional().describe('The country where the course is located.'),
  roundDate: z.string().describe('The date of the round in YYYY-MM-DD format.'),
  teePlayedOff: z.string().describe('The tee played off during the round.'),
  generalObservations: z.string().describe('The general observations from the round, including any notes on physical condition like tiredness or injury.'),
  targetHandicap: z.string().describe('The target handicap the player is aspiring to.'),
  targetBenchmark: z.any().optional().describe('Benchmark stats for the target handicap, if available.'),
  effectiveTargetHandicap: z.string().optional().describe('The display name of the target handicap used for benchmark comparison.'),
  selectedGoals: z.array(SelectedGoalSchema).optional().describe("The specific goals the user selected to focus on for this round."),
  areasOfPotential: z.array(IdentifiedAreaOfPotentialSchema).describe("The user's statistically identified areas of potential, sorted by priority. This is the primary input for identifying weaknesses."),
});


const RecommendedDrillSchema = z.object({
  drillId: z.string().describe('The unique ID of the recommended drill.'),
  rationale: z.string().describe('A concise, data-driven justification for why this specific drill was recommended, referencing the user\'s areas of potential.'),
});

const AnalyzeRoundReflectionOutputSchema = z.object({
  roundId: z.string().describe("The unique ID of the round that was analyzed."),
  reflection: z.string().describe("A concise reflection on the round from the Coach, highlighting strengths, areas for improvement, and comparison to target handicap if provided."),
  recommendedDrills: z.array(RecommendedDrillSchema).optional().describe("An optional array of recommended drills, each with a drillId and a rationale for its inclusion."),
});
export type AnalyzeRoundReflectionOutput = z.infer<typeof AnalyzeRoundReflectionOutputSchema>;

const DrillSchemaForUi = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
});

// Schema for what the UI will pass to the analyzeRoundReflection function
const AnalyzeRoundReflectionUiInputSchema = z.object({
  roundId: z.string(),
  userName: z.string().optional(),
  currentHandicap: z.string(),
  roundType: z.string(),
  holesPlayed: z.string(),
  grossScore: z.string(),
  coursePar: z.string(),
  scoreToPar: z.string(),
  fairwaysInRegulation: z.string(),
  greensInRegulation: z.string(),
  upAndDown: z.string().optional(),
  sandSavesAttempted: z.string().optional(),
  sandSavesMade: z.string().optional(),
  puttsTotal: z.string(),
  threePuttsOrMore: z.string(),
  puttingSummary: z.string(),
  courseName: z.string(),
  city: z.string().optional(),
  country: z.string().optional(),
  roundDate: z.string(),
  teePlayedOff: z.string(),
  generalObservations: z.string(),
  targetHandicap: z.string(),
  selectedGoals: z.array(SelectedGoalSchema).optional(),
  availableDrills: z.array(DrillSchemaForUi), // Pass full drill objects now
  drillCompletionTarget: z.number().optional(),
});

// Type for what the UI will pass to the analyzeRoundReflection function
export type AnalyzeRoundReflectionInput = z.infer<typeof AnalyzeRoundReflectionUiInputSchema>;

/**
 * The Round Data Agent (RDA).
 * This agent's only job is to analyze raw stats and identify areas of potential.
 * It does not use an LLM and is deterministic.
 */
const roundDataAgent = ai.defineFlow(
  {
    name: 'roundDataAgent',
    inputSchema: AnalyzeRoundReflectionUiInputSchema,
    outputSchema: z.array(IdentifiedAreaOfPotentialSchema),
  },
  async (round) => {
      const areasOfPotentialWithScores: z.infer<typeof IdentifiedAreaOfPotentialSchema>[] = [];
      const addAreaOfPotential = (tag: string, score: number) => {
          const existing = areasOfPotentialWithScores.find(w => w.tag === tag);
          if (existing) {
              existing.score += score;
          } else {
              areasOfPotentialWithScores.push({ tag, score });
          }
      };

      const isNineHoleRound = round.holesPlayed === '9';

      const firThreshold = isNineHoleRound ? 40 : 50;
      const girThreshold = isNineHoleRound ? 33 : 40;
      const puttsTotalThreshold = isNineHoleRound ? 18 : 32;
      const threePuttThreshold = isNineHoleRound ? 1 : 2;

      if (parseFloat(round.fairwaysInRegulation) < firThreshold) addAreaOfPotential('drivingAccuracyGeneral', 3);
      if (parseInt(round.drivingPenalties || '0') > (isNineHoleRound ? 0 : 1)) addAreaOfPotential('drivingPenaltiesHigh', 3);
      if (parseFloat(round.greensInRegulation) < girThreshold) addAreaOfPotential('girLow', 4);
      if (parseInt(round.puttsTotal) > puttsTotalThreshold) addAreaOfPotential('puttingConsistencyGeneral', 3);
      if (parseInt(round.threePuttsOrMore) >= threePuttThreshold) addAreaOfPotential('threePuttHigh', 5);
      if (parseFloat(round.upAndDown || '0') < (isNineHoleRound ? 25 : 30)) addAreaOfPotential('upAndDownLow', 3);
      
      const sandSavesAttempted = parseInt(round.sandSavesAttempted || '0');
      if (sandSavesAttempted > 0) {
          const sandSavesMade = parseInt(round.sandSavesMade || '0');
          const sandSavePerc = (sandSavesMade / sandSavesAttempted) * 100;
          if (sandSavePerc < 25) addAreaOfPotential('sandSavesLow', 3);
      }

      areasOfPotentialWithScores.sort((a, b) => b.score - a.score);
      return areasOfPotentialWithScores;
  }
);


export async function analyzeRoundReflection(input: AnalyzeRoundReflectionInput): Promise<AnalyzeRoundReflectionOutput> {
  
  // 1. Call the Round Data Agent (RDA) to get statistical areas of potential.
  const areasOfPotential = await roundDataAgent(input);

  const promptInputArgs: z.infer<typeof AnalyzeRoundReflectionPromptInputSchema> = {
    ...input,
    targetBenchmark: undefined,
    effectiveTargetHandicap: undefined,
    areasOfPotential: areasOfPotential,
  };

  if (handicapBenchmarks[input.targetHandicap as keyof typeof handicapBenchmarks]) {
    promptInputArgs.targetBenchmark = handicapBenchmarks[input.targetHandicap as keyof typeof handicapBenchmarks];
    promptInputArgs.effectiveTargetHandicap = input.targetHandicap;
  }
  
  // 2. Call the main reflection agent (UEA) with the structured data.
  const reflectionPromise = userEngagementAndPlanningAgent(promptInputArgs);

  // 3. In parallel, call the Coach Planning Agent (CPA) if there are areas of potential.
  let planPromise: Promise<any> | null = null;
  if (areasOfPotential.length > 0) {
      planPromise = buildPracticePlan({
          allDrills: input.availableDrills,
          identifiedAreasOfPotential: areasOfPotential,
          targetDrillCount: input.drillCompletionTarget || 3,
      });
  }

  // 4. Await all results.
  const [reflectionResult, planResult] = await Promise.all([reflectionPromise, planPromise]);

  return {
    ...reflectionResult,
    recommendedDrills: planResult ? planResult.recommendedDrills : [],
  };
}

const prompt = ai.definePrompt({
  name: 'analyzeRoundReflectionPrompt',
  input: { schema: AnalyzeRoundReflectionPromptInputSchema },
  output: { schema: z.object({ reflection: z.string() }) }, // Only reflection is needed from this prompt now
  prompt: `You are 'Potentially', an expert golf coach and performance partner. Your tone is insightful, measured, and authentic—more like a real coach providing feedback than a cheerleader. Your goal is to help the user understand the story of their round, connecting their stats to their feelings. Be a guide, not just a reporter. Avoid overly effusive praise.

If the user has provided a city and country for the round, you must use the getWeatherForRound tool to get the weather for that round before responding. Incorporate the weather into your analysis, particularly if it seems relevant to the player's performance or observations.

CONTEXT 1: PLAYER & ROUND DATA
Player: {{#if userName}}{{userName}}{{else}}a player{{/if}}
Current Handicap: {{currentHandicap}}
Target Handicap: {{targetHandicap}}
Round Type: {{roundType}}
Holes Played: {{holesPlayed}}
Course: {{courseName}}, Tees: {{teePlayedOff}}
Gross Score: {{grossScore}} (Par: {{coursePar}}, To Par: {{scoreToPar}})

CONTEXT 2: STATISTICAL ANALYSIS (from the Round Data Agent)
The key statistical areas of potential from this round are:
{{#each areasOfPotential}}
- {{tag}} (Priority Score: {{score}})
{{/each}}
These are internal tags. You must translate them into natural, encouraging language. For example, 'threePuttHigh' should be discussed as "an opportunity to improve distance control on the greens."

CONTEXT 3: USER'S PERSONAL REFLECTION
Locked-in Goals for the Round: {{#if selectedGoals}}{{#each selectedGoals}}- {{this.description}} ({{this.type}}){{/each}}{{else}}None{{/if}}
Player's General Observations: {{generalObservations}}

YOUR TASK:
Generate a structured, conversational debrief. Use double newlines (\n\n) to create distinct paragraphs. Be insightful and focus on actionable takeaways.

Opening Paragraph:
Start with a direct, professional opening that acknowledges the score in the context of their handicap and the round type. (e.g., "Okay {{userName}}, let's break down this round.").

Goals Reflection:
{{#if selectedGoals}}
CRITICAL TONE INSTRUCTION: Weave this into the narrative. Instead of a separate section, make this the second paragraph.
Seamlessly integrate feedback on their selected goals, connecting their success or failure directly to their stats and asking a question about their process goals.
{{/if}}

The Story of the Round (Multiple Paragraphs):
Paragraph 1 (The Big Positive): Identify one clear strength from this round. Crucially, connect the stat to their own generalObservations to show you are listening. (e.g., "Your putting seems to have been a real asset today. You mentioned you felt good on the greens, and the stats back that up – only {{threePuttsOrMore}} 3-putt is solid work.").

Paragraph 2 (The Biggest Opportunity): Based on the statistical "Areas of Potential" provided, identify the single biggest opportunity for improvement. Frame it as an "opportunity," not a weakness.
Example: "The data shows that Greens in Regulation is our biggest opportunity right now. Since you also mentioned in your notes that you were thinning your irons, this is a clear area for us to focus on."

Closing Insight Paragraph:
Offer a brief, insightful summary that connects everything together. If weather data is available from the tool, use it here to add context, but do not make it the main focus. The player's performance is the focus.

Target Handicap Comparison:
{{#if targetBenchmark}}
CRITICAL TONE INSTRUCTION: Make this a strategic summary, not just a list.
Start a new paragraph with: "So, how does this stack up against your {{targetHandicap}} handicap goal?"
Instead of a robotic list, create a short narrative.
Example of what TO DO: "Your putting was a standout today, performing better than the benchmark for your target. The data shows the biggest gap between you and a {{targetHandicap}}-handicapper right now is on approach play ({{greensInRegulation}}% vs. the {{targetBenchmark.approachGIR}}% benchmark). Closing that gap is the fastest path to getting your handicap down."
Conclude with a clear, direct sentence like: "This gives us a clear focus for our next practice session."
{{/if}}

Be insightful and focus on actionable takeaways. Do not repeat information already covered by the player's own observations unless you are adding a new insight to it.
`,
});

const userEngagementAndPlanningAgent = ai.defineFlow(
  {
    name: 'userEngagementAndPlanningAgent',
    inputSchema: AnalyzeRoundReflectionPromptInputSchema,
    // The output now includes recommended drills from the CPA
    outputSchema: z.object({
        roundId: z.string(),
        reflection: z.string(),
    }),
  },
  async (promptInputArgs) => {
    const { output } = await prompt(promptInputArgs);
    
    return {
        roundId: promptInputArgs.roundId,
        reflection: output!.reflection,
    };
  }
);
