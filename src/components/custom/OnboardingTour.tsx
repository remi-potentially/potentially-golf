
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingTourProps {
  step: number;
  onNext: () => void;
  onEnd: () => void;
  onGoToProfile: () => void;
}

const tourSteps = [
    {
    headline: "Welcome to Your Personalised Feedback!",
    coachsVoice: "Hi, I'm your Coach. Great round! I've taken a look at your stats and your personal observations. This is your Round Reflection. After every round, I'll give you a quick summary of your performance, highlighting strengths and identifying key areas of potential for us to work on.",
    buttonText: "Next: Your Practice Plan",
  },
  {
    headline: "From Data to Drills",
    coachsVoice: "This is where the magic happens! Based on my analysis of your round, I've created a prioritised list of Recommended Drills just for you. These are designed to target your biggest areas of potential, so you can stop guessing and start improving with structured, purposeful practice.",
    buttonText: "Next: Build Your Plan",
  },
  {
    headline: "Build Your Next Practice Session",
    coachsVoice: "Ready to get to work? Simply tap the 'Add to Practice Plan' button on the drills you want to focus on before your next session. You can choose as many as you like, but starting with 2 or 3 of the top recommendations is always a great way to begin.",
    buttonText: "Next: Track Your Journey",
  },
  {
    headline: "Your Golf Journey, All in One Place",
    coachsVoice: "You're all set! Now that you know your way around, let's complete your profile.",
    buttonText: "Complete Your Profile",
  },
];


export function OnboardingTour({ step, onNext, onEnd, onGoToProfile }: OnboardingTourProps) {
  const currentStepData = tourSteps[step - 1];

  if (!currentStepData) {
    return null;
  }

  const isLastStep = step === tourSteps.length;

  const handleButtonClick = () => {
    if (isLastStep) {
      onGoToProfile();
    } else {
      onNext();
    }
  };

  return (
    // This container creates an invisible backdrop that closes the tour when clicked.
    <div className="fixed inset-0 z-40" onClick={onEnd}>
      <div 
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-xl"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the card from closing it
      >
        <Card className="bg-card border-primary shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground font-headline text-center">{currentStepData.headline}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground whitespace-pre-wrap">
            <p>{currentStepData.coachsVoice}</p>
          </CardContent>
          <CardFooter>
             <Button
              onClick={handleButtonClick}
              className={cn("w-full bg-[#fffb46] text-black hover:bg-[#fffb46]/90")}
              variant="default"
            >
              {currentStepData.buttonText}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
