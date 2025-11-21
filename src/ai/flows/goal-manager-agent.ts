
'use server';
/**
 * @fileOverview The Goal Manager Agent (GMA).
 *
 * This agent is responsible for autonomously tracking the user's performance against
 * their medium-term goals and updating their primary coaching focus. It operates
 * purely on data analysis and does not use an LLM.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  GMAInput,
  GMAResult,
  RoundStats,
  UserProfile,
  IdentifiedAreaOfPotential,
} from '@/lib/types';

// Define Zod schemas for the inputs and outputs, even though it's not an LLM flow.
// This maintains consistency and allows for potential future integration.
const GMAInputSchema = z.object({
  userProfile: z.any(), // Using `any` because UserProfile type is complex
  allRounds: z.array(z.any()),
  areasOfPotential: z.array(z.any()),
});

const GMAResultSchema = z.object({
  focusHasChanged: z.boolean(),
  newFocus: z.string().nullable(),
  message: z.string().nullable(),
});

/**
 * Calculates the average of a specific stat over a slice of rounds.
 * @param rounds - The slice of rounds to analyze.
 * @param stat - The key of the stat to average.
 * @returns The average value, or null if not possible.
 */
function calculateAverage(
  rounds: RoundStats[],
  stat: keyof RoundStats
): number | null {
  const validRounds = rounds.filter(
    (r) =>
      r[stat] !== null &&
      r[stat] !== undefined &&
      r[stat] !== '' &&
      !isNaN(parseFloat(r[stat] as string))
  );

  if (validRounds.length === 0) {
    return null;
  }

  const sum = validRounds.reduce(
    (acc, r) => acc + parseFloat(r[stat] as string),
    0
  );
  return sum / validRounds.length;
}

/**
 * The main entry point for the Goal Manager Agent.
 * It analyzes performance trends and determines if the user's primary focus should change.
 * @param {GMAInput} input - The user's profile, all their rounds, and current areas of potential.
 * @returns {Promise<GMAResult>} The result of the analysis.
 */
export const goalManagerAgent = ai.defineFlow(
  {
    name: 'goalManagerAgent',
    inputSchema: GMAInputSchema,
    outputSchema: GMAResultSchema,
  },
  async (input: GMAInput): Promise<GMAResult> => {
    const { userProfile, allRounds, areasOfPotential } = input;
    const currentFocus = userProfile.primaryFocus;

    if (!currentFocus) {
      // If there's no focus, set it to the top weakness.
      const newFocus = areasOfPotential[0]?.tag || null;
      if (newFocus) {
        return {
          focusHasChanged: true,
          newFocus: newFocus,
          message: `New coaching focus set to: ${newFocus}.`,
        };
      }
      return {
        focusHasChanged: false,
        newFocus: null,
        message: 'No current focus and no new areas of potential identified.',
      };
    }

    const outdoorRounds = allRounds
      .filter((r) => r.roundType !== 'Indoor' && r.holesPlayed === '18') // Only consider 18-hole outdoor rounds for trend analysis
      .sort(
        (a, b) =>
          new Date(a.roundDate).getTime() - new Date(b.roundDate).getTime()
      );

    let success = false;
    let successMessage = '';

    // Medium-Term Goal: Driving Focus
    if (
      currentFocus === 'drivingAccuracyGeneral' &&
      outdoorRounds.length >= 8
    ) {
      const recentRounds = outdoorRounds.slice(-4);
      const previousRounds = outdoorRounds.slice(-8, -4);
      const recentAvg = calculateAverage(recentRounds, 'fairwaysInRegulation');
      const previousAvg = calculateAverage(
        previousRounds,
        'fairwaysInRegulation'
      );

      if (recentAvg !== null && previousAvg !== null && recentAvg >= previousAvg + 5) {
        success = true;
        successMessage = `Driving Accuracy improved by ${ (recentAvg - previousAvg).toFixed(1) }%!`;
      }
    }

    // Medium-Term Goal: Approach Play Focus
    if (currentFocus === 'girLow' && outdoorRounds.length >= 12) {
      const recent6Rounds = outdoorRounds.slice(-6);
      const previous6Rounds = outdoorRounds.slice(-12, -6);
      const recentAvg = calculateAverage(recent6Rounds, 'greensInRegulation');
      const previousAvg = calculateAverage(previous6Rounds, 'greensInRegulation');
      
      if (recentAvg !== null && previousAvg !== null && recentAvg >= previousAvg + 8) {
          success = true;
          successMessage = `Greens in Regulation improved by ${(recentAvg - previousAvg).toFixed(1)}% over the last 6 rounds!`;
      }
    }

    // Medium-Term Goal: Short Game Focus
    if (currentFocus === 'upAndDownLow' && outdoorRounds.length >= 12) {
        const recent6Rounds = outdoorRounds.slice(-6);
        const previous6Rounds = outdoorRounds.slice(-12, -6);
        const recentAvg = calculateAverage(recent6Rounds, 'upAndDown');
        const previousAvg = calculateAverage(previous6Rounds, 'upAndDown');

        if (recentAvg !== null && previousAvg !== null && recentAvg >= previousAvg + 10) {
            success = true;
            successMessage = `Your scrambling has improved by ${(recentAvg - previousAvg).toFixed(1)}%!`;
        }
    }

    // Medium-Term Goal: Putting Focus
    if ((currentFocus === 'threePuttHigh' || currentFocus === 'puttingConsistencyGeneral') && outdoorRounds.length >= 12) {
        const recent6Rounds = outdoorRounds.slice(-6);
        const previous6Rounds = outdoorRounds.slice(-12, -6);
        const recentAvg = calculateAverage(recent6Rounds, 'puttsTotal');
        const previousAvg = calculateAverage(previous6Rounds, 'puttsTotal');

        // For putting, lower is better. We check for a decrease.
        if (recentAvg !== null && previousAvg !== null && recentAvg <= previousAvg - 2) {
            success = true;
            successMessage = `You've lowered your average putts per round by ${(previousAvg - recentAvg).toFixed(1)}!`;
        }
    }


    if (success) {
      // Find the next weakest area that is NOT the focus we just succeeded in.
      const nextWeakestArea = areasOfPotential.find(
        (aop) => aop.tag !== currentFocus
      );
      const newFocus = nextWeakestArea?.tag || null;

      return {
        focusHasChanged: true,
        newFocus: newFocus,
        message: `${successMessage} Great work! Your new focus is now ${newFocus}.`,
      };
    }

    // If no success, the focus remains the same.
    return {
      focusHasChanged: false,
      newFocus: currentFocus,
      message: 'Keep working on the current focus. Progress is being tracked.',
    };
  }
);
