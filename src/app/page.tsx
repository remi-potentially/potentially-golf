
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Target, TrendingUp, PlusCircle, CheckCircle, Edit3, Trash2, CalendarDays,
  Search, Flag, ListChecks, ClipboardEdit, NotebookText, Info, LineChart as LineChartIcon,
  Zap, Repeat, ListTodo, History, Sparkles, MessageSquareText, Goal, LibrarySquare, ChevronLeft, Menu as MenuIcon, BarChartHorizontalBig, BookOpenText, Settings, UserCircle, Star, ArrowUp, InfoIcon, Lock as LockIcon, Trophy, Headphones, LocateFixed, ClipboardList, Brain, Send, Loader2, LogOut, Upload, HelpCircle, FileQuestion, X, Calendar as CalendarIcon, Save, Minus, Plus, Check, CheckCheck, Bell, Sun, Moon, Map as MapIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, Label, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format, parseISO, startOfDay, isWithinInterval, subWeeks } from 'date-fns';
import { useSwipeable } from 'react-swipeable';
import { useTheme } from "next-themes";
import dynamic from 'next/dynamic';


import { Button, buttonVariants } from "@/components/ui/button";
import { Card as ShadCard, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label as ShadLabel } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


import { NavButton } from '@/components/custom/NavButton';
import { InfoMessageCard } from '@/components/custom/InfoMessageCard';
import { InputField, TextAreaField } from '@/components/custom/InputField';
import { StatsChart } from '@/components/custom/StatsChart';
import { AboutDialog } from '@/components/custom/AboutDialog';
import { CustomCard } from '@/components/custom/CustomCard';
import { Separator } from '@/components/ui/separator';
import { OnboardingTour } from '@/components/custom/OnboardingTour';
import { GolfLoadingAnimation } from '@/components/custom/GolfLoadingAnimation';

import { DynamicLucideIcon } from '@/components/custom/DynamicLucideIcon';

import type { Drill, RoundStats, PracticePlanItem, JournalEntry, IdentifiedAreaOfPotential, CompletedDrillHistoryEntry, AiDrillModifications, CurrentPage, ActivePracticeTab, Achievement, AchievementData, UserProfile, HoleScore, Scorecard, ProposedGoal, SelectedGoal, PracticeSession, GolfCourse, HoleGpsData, GMAResult } from '@/lib/types';
import type { AnalyzeRoundReflectionOutput, AiDrillFocusInput, ClarifyingQuestionsInput, DrillClarifyingQuestionsInput, PreRoundFocusInput, CoachCheckInInput, AnalyzeRoundReflectionInput as UiAnalyzeRoundReflectionInput, PreRoundFocusOutput } from '@/lib/types';
import { initialDrills, initialAchievements } from '@/lib/initial-data.tsx';
import { getTodayDate, parseScoreToPar, cn } from '@/lib/utils';
import { getCoordinates } from '@/services/geocodingService';


import { analyzeRoundReflection } from '@/ai/flows/ai-round-reflection';
import { aiDrillFocus } from '@/ai/flows/ai-drill-focus';
import { getClarifyingQuestions } from '@/ai/flows/ai-clarifying-questions';
import { getDrillClarifyingQuestions } from '@/ai/flows/ai-drill-reflection';
import { getCoachCheckIn } from '@/ai/flows/ai-coach-check-in';
import { getPreRoundFocus } from '@/ai/flows/ai-pre-round-focus';
import { orchestrate } from '@/ai/flows/orchestrator';
import { buildPracticePlan } from '@/ai/flows/agent-coach-planning';
import { goalManagerAgent } from '@/ai/flows/goal-manager-agent';


import { useUser, useFirestore, useFirebaseApp, useAuth } from '@/firebase';
import LoginPage from './login/page';
import { getAuth, signOut } from "firebase/auth";
import { collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc, writeBatch, query, orderBy, Timestamp, increment, where, FirestoreError, arrayUnion } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getTrendAnalysis } from '@/ai/flows/ai-trend-analysis';

const HoleMap = dynamic(() => import('@/components/custom/HoleMap'), {
  ssr: false,
  loading: () => <div className="h-64 bg-secondary rounded-lg flex items-center justify-center"><Loader2 className="animate-spin text-primary" /><p className="ml-2">Loading Map...</p></div>,
});


const PracticeDrillItemComponent = React.memo(({
  item,
  drillDetails,
  itemPlanIndex,
  isCompletedTab = false,
  favouriteDrillIds,
  toggleFavouriteDrill,
  onUpdatePracticeDrill,
  onRemoveDrillFromPlan,
  onShowCompleteDialog,
  onCompleteAgain,
  activeDrillReflection,
  drillClarifyingQuestions,
  isFetchingDrillQuestions,
  onFetchDrillQuestions,
  drillClarifyingAnswers,
  onUpdateDrillClarifyingAnswers,
  onAssignToSession,
  aiDrillModifications,
  isFetchingDrillModifications,
  triggerFetchAIModificationsForDrill,
  identifiedAreasOfPotential,
}: {
  item: PracticePlanItem;
  drillDetails: Drill;
  itemPlanIndex: number;
  isCompletedTab?: boolean;
  favouriteDrillIds: string[];
  toggleFavouriteDrill: (drillId: string) => void;
  onUpdatePracticeDrill: (index: number, field: keyof PracticePlanItem, value: string | number | boolean) => void;
  onRemoveDrillFromPlan: (index: number) => void;
  onShowCompleteDialog: (planIndex: number) => void;
  onCompleteAgain: (drillId: string) => void;
  activeDrillReflection: { planItemIndex: number | null, drillId: string | null };
  drillClarifyingQuestions: string[];
  isFetchingDrillQuestions: boolean;
  onFetchDrillQuestions: (itemPlanIndex: number) => void;
  drillClarifyingAnswers: { [key: number]: string };
  onUpdateDrillClarifyingAnswers: (index: number, answers: string) => void;
  onAssignToSession: (planItemIndex: number) => void;
  aiDrillModifications: AiDrillModifications;
  isFetchingDrillModifications: boolean;
  triggerFetchAIModificationsForDrill: (drill: Drill, relevantAreasOfPotentialObjects: IdentifiedAreaOfPotential[]) => void;
  identifiedAreasOfPotential: IdentifiedAreaOfPotential[];
}) => {
  const itemKey = `${isCompletedTab ? 'completed' : 'pending'}-${item.drillId}-${item.dateAdded}`;
  const isFavourite = favouriteDrillIds.includes(drillDetails.id);
  const isAudioDrill = !!drillDetails.audioUrl;
  const drillIcon = drillDetails.icon;
  
  const isReflecting = activeDrillReflection.planItemIndex === itemPlanIndex;
  const hasClarifyingQuestions = drillClarifyingQuestions.length > 0 && isReflecting;

  const hasSlider = drillDetails.maxScore && drillDetails.maxScore > 0;
  const scoreValue = typeof item.score === 'string' && item.score !== '' ? parseInt(item.score, 10) : 0;
  const isUnassigned = !item.sessionId;

  const showAiModifications = aiDrillModifications.drillId === drillDetails.id && aiDrillModifications.content && aiDrillModifications.content.length > 0;
  const showAiError = aiDrillModifications.drillId === drillDetails.id && aiDrillModifications.error;


  return (
    <div key={itemKey} className={cn("p-4 rounded-lg shadow", item.completed ? 'opacity-70 bg-card/80' : 'bg-card', item.completed ? 'border border-primary' : 'border border-primary')}>
      <div className="flex justify-between items-start mb-2">
          <div className="flex-grow">
              <div className="flex items-center mb-1">
                 <DynamicLucideIcon name={drillIcon} className="w-5 h-5 mr-2 text-foreground" />
                  <h3 className="text-lg font-semibold text-foreground mr-2">{drillDetails.name}</h3>
                  <Button variant="ghost" size="icon" onClick={() => toggleFavouriteDrill(drillDetails.id)} className="text-muted-foreground hover:text-yellow-500 h-7 w-7 p-1">
                    <Star size={18} className={cn(isFavourite ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground")} />
                  </Button>
              </div>
               <p className="text-xs text-muted-foreground mb-1">
                <span className="font-medium text-foreground">Category:</span> {drillDetails.category}
                {drillDetails.category !== 'Mental Game' && (
                  <>
                    &bull; <span className="font-medium text-foreground">Difficulty:</span> {drillDetails.difficulty}
                  </>
                )}
              </p>
          </div>
          {!isCompletedTab && (
              <Button variant="ghost" size="icon" onClick={() => onRemoveDrillFromPlan(itemPlanIndex)} className="text-destructive hover:bg-destructive/10 ml-2 flex-shrink-0">
                  <Trash2 size={18} />
              </Button>
          )}
      </div>
      <p className="text-sm text-foreground/90 my-2">{drillDetails.description}</p>
      <p className="text-xs italic text-muted-foreground mb-3"><span className="font-medium text-foreground">Scoring:</span> {drillDetails.scoringMethodology}</p>

      {isAudioDrill && (
        <div className="my-3 p-3 rounded-md border border-primary/30 bg-background">
          <div className="flex items-center mb-2">
            <Headphones className="w-5 h-5 mr-2 text-foreground" />
            <h4 className="text-sm font-medium text-foreground">Listen now</h4>
          </div>
          <audio controls src={drillDetails.audioUrl} className="w-full h-10">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {!item.completed && (
        <>
          <div className="mb-3">
              <Button
                  onClick={() => triggerFetchAIModificationsForDrill(drillDetails, identifiedAreasOfPotential.filter(aop => drillDetails.targetsAreaOfPotential?.includes(aop.tag)))}
                  disabled={isFetchingDrillModifications && aiDrillModifications.drillId === drillDetails.id}
                  className="w-full py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center mb-2"
              >
                  <Sparkles size={16} className="mr-2"/> {isFetchingDrillModifications && aiDrillModifications.drillId === drillDetails.id ? "Getting Coach's Advice..." : "Get Coach's Advice"}
              </Button>
          </div>

          {isFetchingDrillModifications && aiDrillModifications.drillId === drillDetails.id && (
            <div className="my-4">
              <GolfLoadingAnimation />
            </div>
          )}

          {showAiModifications && (
              <div className="mb-4 p-3 rounded-lg text-sm bg-custom-ai-text-bg border border-primary">
                  <h5 className="font-semibold mb-2 flex items-center text-foreground"><MessageSquareText size={16} className="mr-2 text-primary"/>Personalised Focus:</h5>
                  <div className="space-y-3">
                      {aiDrillModifications.content!.map((mod, index) => (
                          <div key={index}>
                              <h6 className="font-bold text-foreground">{mod.title}</h6>
                              <p className="whitespace-pre-wrap text-foreground/90">{mod.description}</p>
                          </div>
                      ))}
                  </div>
              </div>
          )}
          {showAiError && <p className="text-destructive text-xs mx-4 mb-2">{aiDrillModifications.error}</p>}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="mb-2 sm:mb-0">
                 <div className="flex justify-between items-center mb-2">
                  <ShadLabel htmlFor={`score-${itemKey}`} className="text-sm font-medium text-foreground">Score:</ShadLabel>
                  {hasSlider && <span className="text-lg font-bold text-foreground">{item.score}</span>}
                </div>
                {hasSlider ? (
                  <Slider
                    id={`score-${itemKey}`}
                    min={0}
                    max={drillDetails.maxScore}
                    step={1}
                    value={[scoreValue]}
                    onValueChange={(value) => onUpdatePracticeDrill(itemPlanIndex, 'score', String(value[0]))}
                    disabled={item.completed}
                    className="my-3"
                  />
                ) : (
                  <Input
                    type="text"
                    id={`score-${itemKey}`}
                    value={item.score}
                    onChange={(e) => onUpdatePracticeDrill(itemPlanIndex, 'score', e.target.value)}
                    className="mt-1 block w-full px-2 py-1 border-input rounded-md shadow-sm text-sm"
                    disabled={item.completed}
                    placeholder="Enter custom score"
                  />
                )}
              </div>
              <div>
                <ShadLabel htmlFor={`timeTaken-${itemKey}`} className="text-sm font-medium text-foreground">Time Taken (mins):</ShadLabel>
                <Input
                  type="number"
                  id={`timeTaken-${itemKey}`}
                  name="timeTaken"
                  value={item.timeTaken === 0 ? '' : item.timeTaken}
                  onChange={(e) => onUpdatePracticeDrill(itemPlanIndex, 'timeTaken', e.target.value)}
                  className="mt-1 block w-full px-2 py-1 border-input rounded-md shadow-sm text-sm"
                  disabled={item.completed}
                  inputMode="numeric"
                />
              </div>
          </div>

          <div className="mt-3 mb-3">
            <ShadLabel htmlFor={`notes-${itemKey}`} className="text-sm font-medium text-foreground">Notes & Observations:</ShadLabel>
            <Textarea
              id={`notes-${itemKey}`}
              value={item.notes}
              onChange={(e) => onUpdatePracticeDrill(itemPlanIndex, 'notes', e.target.value)}
              rows={3}
              className="mt-1 block w-full px-2 py-1 border-input rounded-md shadow-sm text-sm transition-all"
              placeholder="e.g., Felt a good rhythm today, but still pulling shots when I get quick. The drill helped with..."
              disabled={item.completed}
            />
            
            {isFetchingDrillQuestions && isReflecting && (
                <div className="my-4">
                  <GolfLoadingAnimation />
                </div>
            )}

            {!isCompletedTab && item.notes.trim() && !hasClarifyingQuestions && !isFetchingDrillQuestions && (
                <Button
                    onClick={() => onFetchDrillQuestions(itemPlanIndex)}
                    disabled={isFetchingDrillQuestions && isReflecting}
                    className="w-full mt-2 hover:bg-[#119822] hover:text-white"
                    variant="default"
                >
                    <Send size={16} className="mr-2"/>
                    Send to Coach
                </Button>
            )}

            {hasClarifyingQuestions && !isFetchingDrillQuestions && (
                <div className="mt-4 p-4 rounded-lg text-sm bg-custom-ai-text-bg border border-primary">
                    <h5 className="font-semibold mb-2 flex items-center text-foreground"><MessageSquareText size={16} className="mr-2 text-primary"/>Coach has some questions:</h5>
                    <ul className="list-disc pl-5 space-y-2 text-foreground/90">
                        {drillClarifyingQuestions.map((q, index) => <li key={index}>{q}</li>)}
                    </ul>
                     <div className="mt-4">
                        <ShadLabel htmlFor={`answers-${itemKey}`} className="text-sm font-medium text-foreground">Your Answers:</ShadLabel>
                        <Textarea
                            id={`answers-${itemKey}`}
                            value={drillClarifyingAnswers[itemPlanIndex] || ''}
                            onChange={(e) => onUpdateDrillClarifyingAnswers(itemPlanIndex, e.target.value)}
                            rows={3}
                            className="mt-1 block w-full px-2 py-1 border-input rounded-md shadow-sm text-sm transition-all"
                            placeholder="Answer the coach's questions here to add more detail to your reflection..."
                            disabled={item.completed}
                        />
                    </div>
                </div>
            )}
          </div>
        </>
      )}

      {item.completed ? (
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">Completed on: {item.dateCompleted ? format(new Date(item.dateCompleted), 'PP') : 'N/A'}</p>
            <Button
              onClick={() => onCompleteAgain(drillDetails.id)}
              variant="default"
              className="w-full py-2 px-3 rounded-md text-sm font-medium hover:opacity-90 flex items-center justify-center hover:bg-[#119822] hover:text-white"
            >
              <Repeat className="w-4 h-4 mr-2" />
              Complete Again
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            {isUnassigned && (
              <Button
                onClick={() => onAssignToSession(itemPlanIndex)}
                variant="secondary"
                className="w-full"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add to Session
              </Button>
            )}
            <Button
              onClick={() => onShowCompleteDialog(itemPlanIndex)}
              variant="secondary"
              className="w-full"
              disabled={isFetchingDrillQuestions && isReflecting}
            >
              <ClipboardEdit className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          </div>
        )}
    </div>
  );
});
PracticeDrillItemComponent.displayName = 'PracticeDrillItemComponent';

const DrillCardComponent = ({ 
    drill, 
    isRecommended, 
    isTopRecommended, 
    favouriteDrillIds, 
    toggleFavouriteDrill,
    practicePlan,
    completedDrillHistory,
    aiDrillModifications,
    isFetchingDrillModifications,
    triggerFetchAIModificationsForDrill,
    identifiedAreasOfPotential,
    addDrillToPlan,
    currentPage,
    isLocked = false,
    rationale,
}: { 
    drill: Drill; 
    isRecommended: boolean; 
    isTopRecommended: boolean; 
    favouriteDrillIds: string[]; 
    toggleFavouriteDrill: (drillId: string) => void;
    practicePlan: PracticePlanItem[];
    completedDrillHistory: CompletedDrillHistoryEntry[];
    aiDrillModifications: AiDrillModifications;
    isFetchingDrillModifications: boolean;
    triggerFetchAIModificationsForDrill: (drill: Drill, relevantAreasOfPotentialObjects: IdentifiedAreaOfPotential[]) => void;
    identifiedAreasOfPotential: IdentifiedAreaOfPotential[];
    addDrillToPlan: (drillId: string) => void;
    currentPage: CurrentPage;
    isLocked?: boolean;
    rationale?: string;
}) => {
    const isInPlan = practicePlan.some(item => item.drillId === drill.id);
    const lastCompletionRecord = completedDrillHistory.find(h => h.drillId === drill.id);
    const wasCompletedBefore = !!lastCompletionRecord;
    const showAiModifications = aiDrillModifications.drillId === drill.id && aiDrillModifications.content && aiDrillModifications.content.length > 0;
    const showAiError = aiDrillModifications.drillId === drill.id && aiDrillModifications.error;
    const recurrenceScore = lastCompletionRecord ? lastCompletionRecord.recurrenceScore : 0;
    const isFavourite = favouriteDrillIds.includes(drill.id);
    const isAudioDrill = !!drill.audioUrl;
    const drillIcon = drill.icon;

    return (
        <Accordion type="single" collapsible className={cn("w-full rounded-lg shadow bg-card", isTopRecommended ? "border-2 border-[var(--custom-recommended-border)]" : "border border-primary", isLocked && "opacity-50 bg-secondary")}>
            <AccordionItem value="item-1" className="border-b-0">
                <div className="flex items-start justify-between w-full p-4">
                    <AccordionTrigger className="flex-grow text-left">
                        <div className="flex items-center">
                            <DynamicLucideIcon name={drillIcon} className="w-5 h-5 mr-3 text-foreground" />
                            <div className="flex-grow">
                                <h3 className="text-lg font-semibold text-foreground">{drill.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    <span className="font-medium text-foreground">Category:</span> {drill.category}
                                    {drill.category !== 'Mental Game' && (
                                        <>
                                            <span className="mx-1.5">&bull;</span>
                                            <span className="font-medium text-foreground">Difficulty:</span> {drill.difficulty}
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    {!isLocked && (
                         <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleFavouriteDrill(drill.id); }} className="text-muted-foreground hover:text-yellow-500 ml-2 flex-shrink-0">
                            <Star size={20} className={cn(isFavourite ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground")} />
                        </Button>
                    )}
                </div>

                <div className="px-4 pb-4 -mt-4">
                    {isTopRecommended && rationale && (
                        <div className="mt-2 p-2 rounded-md text-xs flex items-start bg-primary/20 text-foreground border border-primary/30">
                            <Info size={16} className="mr-2 flex-shrink-0 mt-0.5"/>
                            <span><span className="font-semibold">Rationale:</span> {rationale}</span>
                        </div>
                    )}
                    {isTopRecommended && wasCompletedBefore && (
                        <div className="mt-2 p-2 rounded text-xs flex items-center bg-primary/30 text-destructive">
                            <Repeat size={14} className="mr-2"/>
                            <span>Recurring Area of Potential (x{recurrenceScore}). Last completed: {new Date(lastCompletionRecord.dateCompleted).toLocaleDateString()}</span>
                        </div>
                    )}
                    {currentPage === 'library' && !isTopRecommended && lastCompletionRecord && (
                         <div className="mt-2 p-2 rounded text-xs flex items-center bg-success/20 text-success border border-success/30">
                            <CheckCircle size={14} className="mr-2"/>
                            <span>Completed {lastCompletionRecord.recurrenceScore} time(s). Last: {new Date(lastCompletionRecord.dateCompleted).toLocaleDateString()}</span>
                        </div>
                    )}
                    {currentPage === 'library' && !lastCompletionRecord && (
                         <div className="mt-2 p-2 rounded text-xs flex items-center bg-card text-foreground border border-primary">
                            <Info size={14} className="mr-2"/>
                            <span>Not yet completed.</span>
                        </div>
                    )}
                </div>

                <AccordionContent>
                    <div className="px-4 pb-4 space-y-2">
                        <p className="text-sm text-foreground/90 my-2">{drill.description}</p>
                        <p className="text-xs italic text-muted-foreground mb-3"><span className="font-medium text-foreground">Scoring:</span> {drill.scoringMethodology}</p>
                    </div>

                    {isAudioDrill && (
                        <div className="mx-4 mb-4 p-3 rounded-md border border-primary/30 bg-background">
                            <div className="flex items-center mb-2">
                                <Headphones className="w-5 h-5 mr-2 text-foreground" />
                                <h4 className="text-sm font-medium text-foreground">Listen now</h4>
                            </div>
                            <audio controls src={drill.audioUrl} className="w-full h-10" disabled={isLocked}>
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    )}

                    {isRecommended && !isLocked && (
                        <div className="px-4 pb-4">
                            <Button
                                onClick={() => triggerFetchAIModificationsForDrill(drill, identifiedAreasOfPotential.filter(aop => drill.matchedAreasOfPotentialTags?.includes(aop.tag)))}
                                disabled={isFetchingDrillModifications && aiDrillModifications.drillId === drill.id}
                                className="w-full py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center mb-2"
                            >
                                <Sparkles size={16} className="mr-2"/> {isFetchingDrillModifications && aiDrillModifications.drillId === drill.id ? "Getting Coach's Advice..." : "Get Coach's Advice"}
                            </Button>
                        </div>
                    )}

                    {isFetchingDrillModifications && aiDrillModifications.drillId === drill.id && (
                        <div className="mx-4 mb-4">
                            <GolfLoadingAnimation />
                        </div>
                    )}

                    {showAiModifications && !isFetchingDrillModifications && (
                        <div className="mx-4 mb-4 p-3 rounded-lg text-sm bg-custom-ai-text-bg border border-primary">
                            <h5 className="font-semibold mb-2 flex items-center text-foreground"><MessageSquareText size={16} className="mr-2 text-primary"/>Personalised Focus:</h5>
                            <div className="space-y-3">
                                {aiDrillModifications.content!.map((mod, index) => (
                                    <div key={index}>
                                        <h6 className="font-bold text-foreground">{mod.title}</h6>
                                        <p className="whitespace-pre-wrap text-foreground/90">{mod.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {showAiError && <p className="text-destructive text-xs mx-4 mb-2">{aiDrillModifications.error}</p>}
                    
                    <div className="px-4 pb-4">
                        {isLocked ? (
                            <Button
                                variant="secondary"
                                className="w-full py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center"
                                disabled
                            >
                                <LockIcon className="w-4 h-4 mr-2" /> Locked
                            </Button>
                        ) : (
                            <Button
                                onClick={() => !isInPlan && addDrillToPlan(drill.id)}
                                variant={isInPlan ? "default" : "secondary"}
                                className={cn(
                                "w-full py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center",
                                !isInPlan && "bg-primary text-primary-foreground hover:bg-black hover:text-primary"
                                )}
                                disabled={isInPlan}
                            >
                                {isInPlan ? (
                                <><CheckCircle className="w-4 h-4 mr-2" /> Added to Plan</>
                                ) : (
                                <><PlusCircle className="w-4 h-4 mr-2" /> Add to Practice Plan</>
                                )}
                            </Button>
                        )}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};


const ROUND_ESSENTIALS_PREFERENCES_KEY = 'golfAppRoundEssentialsPreferences';
const SEEN_ACHIEVEMENTS_KEY = 'golfAppSeenAchievements';
const ONBOARDING_TOUR_COMPLETED_KEY = 'golfAppOnboardingTourCompleted';
const LOCKER_ROOM_INTRO_SEEN_KEY = 'golfAppLockerRoomIntroSeen';
const LIVE_ROUND_STATE_KEY = 'golfAppLiveRoundState';
const PENDING_COACH_CHECK_IN_KEY = 'golfAppPendingCoachCheckIn';


const libraryDisplayCategories = ["Favourites", "Driving", "Approach", "Short Game", "Putting", "Technique", "Mental Game"];
const categoryMapping: Record<string, string> = {
    "Short Game": "Around the Green",
    "Technique": "General Setup",
    "Mental Game": "Mental Game"
};

const navigablePages: CurrentPage[] = ['journal', 'drills', 'dashboard', 'practice', 'inputRoundChoice', 'theLockerRoom'];
const subFormPages: CurrentPage[] = [
  'inputRoundEssentials',
  'inputRoundDriving',
  'inputRoundApproach',
  'inputRoundAroundTheGreen',
  'inputRoundPutting',
  'inputReflection',
  'liveScorecardReview',
  'preRoundCheckIn',
];
const isSubFormActive = (page: CurrentPage): boolean => subFormPages.includes(page);

const parBenchmarks: { [key: string]: { par3: [number, number], par4: [number, number], par5: [number, number] } } = {
    '0': { par3: [3.00, 3.20], par4: [4.00, 4.20], par5: [4.80, 5.10] },
    '1': { par3: [3.04, 3.24], par4: [4.06, 4.26], par5: [4.87, 5.17] },
    '2': { par3: [3.08, 3.28], par4: [4.12, 4.32], par5: [4.94, 5.24] },
    '3': { par3: [3.12, 3.32], par4: [4.18, 4.38], par5: [5.01, 5.31] },
    '4': { par3: [3.16, 3.36], par4: [4.24, 4.44], par5: [5.08, 5.38] },
    '5': { par3: [3.20, 3.40], par4: [4.30, 4.50], par5: [5.15, 5.45] },
    '6': { par3: [3.24, 3.44], par4: [4.36, 4.56], par5: [5.22, 5.52] },
    '7': { par3: [3.28, 3.48], par4: [4.42, 4.62], par5: [5.29, 5.59] },
    '8': { par3: [3.32, 3.52], par4: [4.48, 4.68], par5: [5.36, 5.66] },
    '9': { par3: [3.36, 3.56], par4: [4.54, 4.74], par5: [5.43, 5.73] },
    '10': { par3: [3.40, 3.60], par4: [4.60, 4.80], par5: [5.50, 5.80] },
    '11': { par3: [3.44, 3.64], par4: [4.66, 4.86], par5: [5.57, 5.87] },
    '12': { par3: [3.48, 3.68], par4: [4.72, 4.92], par5: [5.64, 5.94] },
    '13': { par3: [3.52, 3.72], par4: [4.78, 4.98], par5: [5.71, 6.01] },
    '14': { par3: [3.56, 3.76], par4: [4.84, 5.04], par5: [5.78, 6.08] },
    '15': { par3: [3.60, 3.80], par4: [4.90, 5.10], par5: [5.85, 6.15] },
    '16': { par3: [3.64, 3.84], par4: [4.96, 5.16], par5: [5.92, 6.22] },
    '17': { par3: [3.68, 3.88], par4: [5.02, 5.22], par5: [5.99, 6.29] },
    '18': { par3: [3.72, 3.92], par4: [5.08, 5.28], par5: [6.06, 6.36] },
    '19': { par3: [3.76, 3.96], par4: [5.14, 5.34], par5: [6.13, 6.43] },
    '20': { par3: [3.80, 4.00], par4: [5.20, 5.40], par5: [6.20, 6.50] },
    '21': { par3: [3.84, 4.04], par4: [5.26, 5.46], par5: [6.27, 6.57] },
    '22': { par3: [3.88, 4.08], par4: [5.32, 5.52], par5: [6.34, 6.64] },
    '23': { par3: [3.92, 4.12], par4: [5.38, 5.58], par5: [6.41, 6.71] },
    '24': { par3: [3.96, 4.16], par4: [5.44, 5.64], par5: [6.48, 6.78] },
    '25': { par3: [4.00, 4.20], par4: [5.50, 5.70], par5: [6.55, 6.85] },
    '26': { par3: [4.04, 4.24], par4: [5.56, 5.76], par5: [6.62, 6.92] },
    '27': { par3: [4.08, 4.28], par4: [5.62, 5.82], par5: [6.69, 6.99] },
    '28': { par3: [4.12, 4.32], par4: [5.68, 5.88], par5: [6.76, 7.06] },
    '29': { par3: [4.16, 4.36], par4: [5.74, 5.94], par5: [6.83, 7.13] },
    '30': { par3: [4.20, 4.40], par4: [5.80, 6.00], par5: [6.90, 7.20] },
    '31': { par3: [4.24, 4.44], par4: [5.86, 6.06], par5: [6.97, 7.27] },
    '32': { par3: [4.28, 4.48], par4: [5.92, 6.12], par5: [7.04, 7.34] },
    '33': { par3: [4.32, 4.52], par4: [5.98, 6.18], par5: [7.11, 7.41] },
    '34': { par3: [4.36, 4.56], par4: [6.04, 6.24], par5: [7.18, 7.48] },
    '35': { par3: [4.40, 4.60], par4: [6.10, 6.30], par5: [7.25, 7.55] },
};

const statBenchmarks: { [key: string]: { fir: number; gir: number; puttsPerRound: number } } = {
    '0': { fir: 58, gir: 62.0, puttsPerRound: 30.5 },
    '1': { fir: 57, gir: 58.6, puttsPerRound: 30.7 },
    '2': { fir: 56, gir: 55.2, puttsPerRound: 30.9 },
    '3': { fir: 55, gir: 51.8, puttsPerRound: 31.1 },
    '4': { fir: 54, gir: 48.4, puttsPerRound: 31.3 },
    '5': { fir: 53, gir: 45.0, puttsPerRound: 31.5 },
    '6': { fir: 52, gir: 42.6, puttsPerRound: 31.7 },
    '7': { fir: 51, gir: 40.2, puttsPerRound: 31.9 },
    '8': { fir: 50, gir: 37.8, puttsPerRound: 32.1 },
    '9': { fir: 49, gir: 35.4, puttsPerRound: 32.3 },
    '10': { fir: 48, gir: 33.0, puttsPerRound: 32.5 },
    '11': { fir: 47, gir: 31.2, puttsPerRound: 32.7 },
    '12': { fir: 46, gir: 29.4, puttsPerRound: 32.9 },
    '13': { fir: 45, gir: 27.6, puttsPerRound: 33.1 },
    '14': { fir: 44, gir: 25.8, puttsPerRound: 33.3 },
    '15': { fir: 43, gir: 24.0, puttsPerRound: 33.5 },
    '16': { fir: 42, gir: 22.8, puttsPerRound: 33.7 },
    '17': { fir: 41, gir: 21.6, puttsPerRound: 33.9 },
    '18': { fir: 40, gir: 20.4, puttsPerRound: 34.1 },
    '19': { fir: 39, gir: 19.2, puttsPerRound: 34.3 },
    '20': { fir: 38, gir: 18.0, puttsPerRound: 34.5 },
    '21': { fir: 38, gir: 17.0, puttsPerRound: 34.7 },
    '22': { fir: 37, gir: 16.0, puttsPerRound: 34.9 },
    '23': { fir: 37, gir: 15.0, puttsPerRound: 35.1 },
    '24': { fir: 36, gir: 14.0, puttsPerRound: 35.3 },
    '25': { fir: 36, gir: 13.0, puttsPerRound: 35.5 },
    '26': { fir: 35, gir: 12.2, puttsPerRound: 35.7 },
    '27': { fir: 35, gir: 11.4, puttsPerRound: 35.9 },
    '28': { fir: 34, gir: 10.6, puttsPerRound: 36.1 },
    '29': { fir: 34, gir: 9.8, puttsPerRound: 36.3 },
    '30': { fir: 33, gir: 9.0, puttsPerRound: 36.5 },
    '31': { fir: 33, gir: 8.5, puttsPerRound: 36.7 },
    '32': { fir: 32, gir: 8.0, puttsPerRound: 36.9 },
    '33': { fir: 32, gir: 7.5, puttsPerRound: 37.1 },
    '34': { fir: 31, gir: 7.0, puttsPerRound: 37.3 },
    '35': { fir: 31, gir: 6.5, puttsPerRound: 37.5 },
};

const rationaleMap: Record<string, string> = {
  drivingAccuracyGeneral: "Recommended to improve your general driving accuracy.",
  consistentMissRight: "Recommended due to a tendency to miss fairways to the right.",
  consistentMissLeft: "Recommended due to a tendency to miss fairways to the left.",
  drivingPenaltiesHigh: "Recommended to help reduce penalty shots off the tee.",
  girLow: "Recommended based on your recent Greens in Regulation performance.",
  approachMissShort: "Recommended because many of your approach shots are finishing short of the green.",
  approachMissLong: "Recommended to help control distance, as approaches were often long.",
  approachConsistency: "Recommended to improve overall consistency with your approach shots.",
  puttingConsistencyGeneral: "Recommended to improve general consistency on the greens.",
  threePuttHigh: "Recommended based on a high number of three-putts, focusing on distance control.",
  putting5ftLowPercentage: "Recommended to improve your conversion rate on crucial short putts (inside 5ft).",
  putting10ftLowPercentage: "Recommended to sharpen your putting from the key 5-10ft range.",
  putting20ftLowPercentage: "Recommended to help improve your distance control on long-range putts.",
  putting21plusYardsLowPercentage: "Recommended to improve your distance control on long-range putts.",
  upAndDownLow: "Recommended based on your recent Up & Down percentage to improve scrambling.",
  sandSavesLow: "Recommended to improve performance from greenside bunkers.",
  shortGameScrambling: "Recommended to sharpen your overall short game and ability to save par.",
  alignmentIssue: "Recommended based on your reflection notes about alignment.",
  default: "Recommended to improve general consistency and scoring."
};

const getRationaleForTag = (tag: string): string => {
  return rationaleMap[tag] || rationaleMap.default;
};


const MainApp = () => {
  const { user } = useUser();
  const db = useFirestore();
  const firebaseApp = useFirebaseApp();
  const { setTheme } = useTheme();
  
  const [_currentPage, _setCurrentPage] = React.useState<CurrentPage>('dashboard');
  const [navigationDirection, setNavigationDirection] = React.useState<'next' | 'prev'>('next');
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  
  const [rounds, setRounds] = React.useState<RoundStats[]>([]);
  const [isHeaderScrolled, setIsHeaderScrolled] = React.useState(false);
  const [showScrollTopButton, setShowScrollTopButton] = React.useState(false);
  const [showAboutDialog, setShowAboutDialog] = React.useState(false);
  const [entryToDelete, setEntryToDelete] = React.useState<JournalEntry | null>(null);
  const [journalFilter, setJournalFilter] = React.useState<string>('all');
  const [notificationStatus, setNotificationStatus] = React.useState<'default' | 'loading' | 'enabled' | 'denied'>('default');
  const [isBuildingPlan, setIsBuildingPlan] = React.useState(false);
  const [planSummary, setPlanSummary] = React.useState<string | null>(null);

  const [expandedChart, setExpandedChart] = React.useState<string | null>(null);
  const [trendAnalysis, setTrendAnalysis] = React.useState<{ [key: string]: string | null }>({});
  const [isFetchingTrend, setIsFetchingTrend] = React.useState<string | null>(null);


  const { toast } = useToast();

  const [loginPromptDismissed, setLoginPromptDismissed] = React.useState(false);

  // Course Search State
  const [courseSearchTerm, setCourseSearchTerm] = React.useState('');
  const [courseSearchResults, setCourseSearchResults] = React.useState<GolfCourse[]>([]);
  const [isSearchingCourses, setIsSearchingCourses] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState<GolfCourse | null>(null);

  // Round Planner State
  const [plannerSelectedCourse, setPlannerSelectedCourse] = React.useState<string | null>(null);
  const [allCoursesForPlanner, setAllCoursesForPlanner] = React.useState<GolfCourse[]>([]);
  const [selectedCourseCoords, setSelectedCourseCoords] = React.useState<{ lat: number; lon: number } | null>(null);
  const [isFetchingCoords, setIsFetchingCoords] = React.useState(false);


  // Function to handle enabling notifications
  const handleEnableNotifications = async () => {
    if (!firebaseApp || !("Notification" in window) || !user || !db) {
        toast({ title: "Unsupported", description: "Notifications are not supported on this device or browser.", variant: "destructive"});
        return;
    }

    setNotificationStatus('loading');

    try {
        const messaging = getMessaging(firebaseApp);
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
            if (!vapidKey) {
                throw new Error("VAPID key is not configured.");
            }
            const currentToken = await getToken(messaging, { vapidKey });
            
            if (currentToken) {
                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, {
                    fcmTokens: arrayUnion(currentToken)
                });
                setNotificationStatus('enabled');
                toast({ title: "Notifications Enabled!", description: "You're all set to receive updates." });
            } else {
                throw new Error("Could not retrieve notification token.");
            }
        } else {
            setNotificationStatus('denied');
            toast({ title: "Permission Denied", description: "You can enable notifications from your browser settings later.", variant: "destructive" });
        }
    } catch (error) {
        console.error('Error enabling notifications:', error);
        setNotificationStatus('default');
        toast({ title: "Error", description: "Could not enable notifications. Please try again.", variant: "destructive" });
    }
  };


  const handleSignOut = async () => {
    try {
      if (!firebaseApp) {
        throw new Error("Firebase is not initialized.");
      }
      const auth = getAuth(firebaseApp);
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign Out Failed",
        description: "An error occurred while signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const pageVariants = {
    initial: (direction: 'next' | 'prev') => {
      if (isInitialLoad && _currentPage === 'dashboard') {
        return { x: 0, opacity: 1 };
      }
      return {
        x: direction === 'next' ? "100%" : "-100%",
        opacity: 0,
      };
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: { type: "tween", ease: "easeInOut", duration: 0.3 },
    },
    exit: (direction: 'next' | 'prev') => ({
      x: direction === 'next' ? "-100%" : "100%",
      opacity: 0,
      transition: { type: "tween", ease: "easeInOut", duration: 0.3 },
    }),
  };

  React.useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [_currentPage, isInitialLoad]);


  const initialRoundState: RoundStats = {
    id: '',
    roundDate: getTodayDate(),
    roundType: 'Casual',
    courseName: '',
    teePlayedOff: '',
    city: '',
    country: 'United Kingdom',
    holesPlayed: '18',
    currentHandicap: '',
    targetHandicap: '',
    grossScore: '', coursePar: '', scoreToPar: '',
    drivingDistance: '', fairwaysInRegulation: '', fairwaysMissedLeft: '', fairwaysMissedRight: '', drivingPenalties: '',
    greensInRegulation: '', greensMissedLeft: '', greensMissedRight: '', greensMissedShort: '', greensMissedLong: '', approachPenalties: '',
    upAndDown: '', 
    sandSavesAttempted: '',
    sandSavesMade: '',
    notApplicableSand: false,
    puttsTotal: '',
    threePuttsOrMore: '',
    onePutts: '',
    twoPutts: '',
    notApplicablePutting: false,
    puttsAttempted5yards: '', puttsMade5yards: '', notApplicable5yards: false,
    puttsAttempted10yards: '', puttsMade10yards: '', notApplicable10yards: false,
    puttsAttempted20yards: '', puttsMade20yards: '', notApplicable20yards: false,
    puttsAttempted21plusYards: '', puttsMade21plusYards: '', notApplicable21plusYards: false,
    generalObservations: '',
    selectedGoals: [],
  };

  const [currentRound, setCurrentRound] = React.useState<RoundStats>(initialRoundState);
  const [drills, setDrills] = React.useState<Drill[]>(initialDrills);
  const [practicePlan, setPracticePlan] = React.useState<PracticePlanItem[]>([]);
  const [practiceSessions, setPracticeSessions] = React.useState<PracticeSession[]>([]);
  const [journalEntries, setJournalEntries] = React.useState<JournalEntry[]>([]);
  const [identifiedAreasOfPotential, setIdentifiedAreasOfPotential] = React.useState<IdentifiedAreaOfPotential[]>([]);
  const [completedDrillHistory, setCompletedDrillHistory] = React.useState<CompletedDrillHistoryEntry[]>([]);
  const [activePracticeTab, setActivePracticeTab] = React.useState<'unassigned' | 'sessions'>('unassigned');
  const [drillCompletionTarget, setDrillCompletionTarget] = React.useState(3);

  const [aiDrillModifications, setAiDrillModifications] = React.useState<AiDrillModifications>({ drillId: null, content: null, error: null });
  const [isFetchingDrillModifications, setIsFetchingDrillModifications] = React.useState(false);
  const [aiRoundAnalysis, setAiRoundAnalysis] = React.useState<string | null>(null);
  const [isFetchingRoundAnalysis, setIsFetchingRoundAnalysis] = React.useState(false);
  const [roundAnalysisError, setRoundAnalysisError] = React.useState<string | null>(null);

  const [showCoachDialog, setShowCoachDialog] = React.useState(false);
  const [coachCheckIn, setCoachCheckIn] = React.useState<string | null>(null);
  const [isFetchingCoachCheckIn, setIsFetchingCoachCheckIn] = React.useState(false);
  const [coachCheckInError, setCoachCheckInError] = React.useState<string | null>(null);
  
  const [showConfirmationDialog, setShowConfirmationDialog] = React.useState({ isOpen: false, type: null as 'checkIn' | 'preRound' | null });


  const [preRoundAdvice, setPreRoundAdvice] = React.useState<PreRoundFocusOutput | null>(null);
  const [isFetchingPreRoundAdvice, setIsFetchingPreRoundAdvice] = React.useState(false);
  const [preRoundAdviceError, setPreRoundAdviceError] = React.useState<string | null>(null);
  const [preRoundConfidence, setPreRoundConfidence] = React.useState('');
  const [preRoundWorries, setPreRoundWorries] = React.useState('');
  const [preRoundCourseName, setPreRoundCourseName] = React.useState('');
  const [preRoundCity, setPreRoundCity] = React.useState('');
  const [preRoundCountry, setPreRoundCountry] = React.useState('United Kingdom');
  const [preRoundPlayDate, setPreRoundPlayDate] = React.useState<Date | undefined>(new Date());
  const [selectedGoals, setSelectedGoals] = React.useState<SelectedGoal[]>([]);

  const [reflectionStep, setReflectionStep] = React.useState<'initial' | 'clarified'>('initial');
  const [clarifyingQuestions, setClarifyingQuestions] = React.useState<string[]>([]);
  const [clarifyingAnswers, setClarifyingAnswers] = React.useState('');
  const [isFetchingClarifyingQuestions, setIsFetchingClarifyingQuestions] = React.useState(false);
  const [isSubmittingRound, setIsSubmittingRound] = React.useState(false);

  const [activeDrillReflection, setActiveDrillReflection] = React.useState<{ planItemIndex: number | null, drillId: string | null }>({ planItemIndex: null, drillId: null });
  const [drillClarifyingQuestions, setDrillClarifyingQuestions] = React.useState<string[]>([]);
  const [drillClarifyingAnswers, setDrillClarifyingAnswers] = React.useState<{ [key: number]: string }>({});
  const [isFetchingDrillQuestions, setIsFetchingDrillQuestions] = React.useState(false);


  const [selectedLibraryCategory, setSelectedLibraryCategory] = React.useState<string | null>(null);
  const [favouriteDrillIds, setFavouriteDrillIds] = React.useState<string[]>([]);

  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [initialProfileState, setInitialProfileState] = React.useState<UserProfile | null>(null);
  const [isProfileChanged, setIsProfileChanged] = React.useState(false);
  const [profileDisplayName, setProfileDisplayName] = React.useState('');
  const [profileCurrentHandicap, setProfileCurrentHandicap] = React.useState('');
  const [profileTargetHandicap, setProfileTargetHandicap] = React.useState('');
  const [profilePrimaryGoal, setProfilePrimaryGoal] = React.useState('');
  const [profileHandedness, setProfileHandedness] = React.useState<'Right' | 'Left'>('Right');
  const [profileStrengths, setProfileStrengths] = React.useState('');
  const [profileWeaknesses, setProfileWeaknesses] = React.useState('');
  const [profileDriverDistance, setProfileDriverDistance] = React.useState('');
  const [profile7IronDistance, setProfile7IronDistance] = React.useState('');
  const [profilePWDistance, setProfilePWDistance] = React.useState('');
  const [profilePracticeHours, setProfilePracticeHours] = React.useState('');
  const [profileFacilities, setProfileFacilities] = React.useState<string[]>([]);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = React.useState('');
  const [profileHomeClub, setProfileHomeClub] = React.useState('');
  const [profileBagDriver, setProfileBagDriver] = React.useState('');
  const [profileBagWoods, setProfileBagWoods] = React.useState('');
  const [profileBagHybrids, setProfileBagHybrids] = React.useState('');
  const [profileBagIrons, setProfileBagIrons] = React.useState('');
  const [profileBagWedges, setProfileBagWedges] = React.useState('');
  const [profileBagPutter, setProfileBagPutter] = React.useState('');
  
  const [showUploadInfoDialog, setShowUploadInfoDialog] = React.useState(false);

  const [editingRoundId, setEditingRoundId] = React.useState<string | null>(null);

  const [seenAchievements, setSeenAchievements] = React.useState<Set<string>>(new Set());

  const [onboardingStep, setOnboardingStep] = React.useState(0);
  const [isTourCompleted, setIsTourCompleted] = React.useState(true);

  const [practicePeriodStartDate, setPracticePeriodStartDate] = React.useState<Date | undefined>();
  const [practicePeriodEndDate, setPracticePeriodEndDate] = React.useState<Date | undefined>();
  const [isSavingPracticePeriod, setIsSavingPracticePeriod] = React.useState(false);
  const [isPracticePeriodCalendarOpen, setIsPracticePeriodCalendarOpen] = React.useState(false);
  const [isPreRoundCalendarOpen, setIsPreRoundCalendarOpen] = React.useState(false);
  const [isNewSessionCalendarOpen, setIsNewSessionCalendarOpen] = React.useState(false);
  
  const [showCompleteDrillDialog, setShowCompleteDrillDialog] = React.useState<{ isOpen: boolean, planIndex: number | null }>({ isOpen: false, planIndex: null });
  const [showAssignSessionDialog, setShowAssignSessionDialog] = React.useState(false);
  const [drillToAssign, setDrillToAssign] = React.useState<PracticePlanItem | null>(null);
  const [newSessionName, setNewSessionName] = React.useState('');
  const [newSessionDate, setNewSessionDate] = React.useState<Date | undefined>();
  const [isCreatingSession, setIsCreatingSession] = React.useState(false);
  const [sessionToDelete, setSessionToDelete] = React.useState<PracticeSession | null>(null);


  const initialHoleScores = Array.from({ length: 18 }, (_, i) => ({
    hole: i + 1,
    par: 3,
    score: 3,
    yardage: 0,
    drivingDistance: 0,
    teeShot: null as 'Left' | 'Fairway' | 'Right' | null,
    gir: false,
    putts: 0,
    upAndDown: false,
    penaltyStrokes: 0,
    sandSavesAttempted: 0,
    sandSavesMade: 0,
  }));
  const [holeScores, setHoleScores] = React.useState<HoleScore[]>(initialHoleScores);
  const [currentHole, setCurrentHole] = React.useState(1);
  const [isLiveRoundActive, setIsLiveRoundActive] = React.useState(false);
  const [showResumeDialog, setShowResumeDialog] = React.useState(false);
  
  const [foundScorecard, setFoundScorecard] = React.useState<Scorecard | null>(null);
  const [isCheckingForScorecard, setIsCheckingForScorecard] = React.useState(false);
  const [showScorecardDialog, setShowScorecardDialog] = React.useState(false);

  const [isLockerRoomIntroExpanded, setIsLockerRoomIntroExpanded] = React.useState(false);
  const [holeTransition, setHoleTransition] = React.useState<{ hole: number | null; active: boolean }>({ hole: null, active: false });

  const [selectedAchievement, setSelectedAchievement] = React.useState<Achievement | null>(null);

  // Debounce effect for course search
  React.useEffect(() => {
    if (courseSearchTerm.length < 3) {
      setCourseSearchResults([]);
      return;
    }

    const fetchCourses = async () => {
      setIsSearchingCourses(true);
      try {
        const response = await fetch(`/api/golf-courses?search=${courseSearchTerm}`);
        const data: GolfCourse[] = await response.json();
        setCourseSearchResults(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        toast({ title: "Search Error", description: "Could not fetch golf courses.", variant: "destructive" });
      } finally {
        setIsSearchingCourses(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchCourses();
    }, 500); // 500ms debounce delay

    return () => clearTimeout(debounceTimer);
  }, [courseSearchTerm, toast]);

  const handleSelectCourse = (course: GolfCourse) => {
    setSelectedCourse(course);
    setCourseSearchTerm(course.name);
    setCurrentRound(prev => ({ ...prev, courseName: course.name, courseId: course.id }));
    setCourseSearchResults([]);
  };

  React.useEffect(() => {
    const fetchCourseCoords = async () => {
      if (plannerSelectedCourse) {
        const course = allCoursesForPlanner.find(c => c.id === plannerSelectedCourse);
        if (course) {
          setIsFetchingCoords(true);
          const locationParts = course.location.split(', ');
          const city = locationParts[0];
          const country = locationParts.length > 1 ? locationParts[1] : 'US'; // Simple fallback
          try {
            const coords = await getCoordinates(city, country);
            setSelectedCourseCoords(coords);
          } catch(e) {
            console.error(e)
          } finally {
            setIsFetchingCoords(false);
          }
        }
      } else {
        setSelectedCourseCoords(null);
      }
    };
    fetchCourseCoords();
  }, [plannerSelectedCourse, allCoursesForPlanner]);


  // Effect to save live round progress to localStorage
  React.useEffect(() => {
    if (isLiveRoundActive && typeof window !== 'undefined') {
      const liveRoundState = {
        currentRound,
        holeScores,
        currentHole,
        isLiveRoundActive: true,
      };
      localStorage.setItem(LIVE_ROUND_STATE_KEY, JSON.stringify(liveRoundState));
    }
  }, [currentRound, holeScores, currentHole, isLiveRoundActive]);

  // Effect to check for and load saved live round on app start
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStateJSON = localStorage.getItem(LIVE_ROUND_STATE_KEY);
      if (savedStateJSON) {
        try {
          const savedState = JSON.parse(savedStateJSON);
          if (savedState.isLiveRoundActive) {
            setShowResumeDialog(true);
          }
        } catch (e) {
          console.error("Failed to parse saved round state:", e);
          localStorage.removeItem(LIVE_ROUND_STATE_KEY);
        }
      }
    }
  }, []); // Runs only once on mount

  const resumeLiveRound = () => {
    if (typeof window !== 'undefined') {
      const savedStateJSON = localStorage.getItem(LIVE_ROUND_STATE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        setCurrentRound(savedState.currentRound);
        setHoleScores(savedState.holeScores);
        setCurrentHole(savedState.currentHole);
        setIsLiveRoundActive(true);
        _setCurrentPage('liveScorecard');
      }
      setShowResumeDialog(false);
    }
  };

  const discardLiveRound = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LIVE_ROUND_STATE_KEY);
    }
    setIsLiveRoundActive(false);
    setShowResumeDialog(false);
    // Reset to initial states if needed
    setCurrentRound(initialRoundState);
    setHoleScores(initialHoleScores);
    setCurrentHole(1);
  };


  React.useEffect(() => {
    if (userProfile) {
        setInitialProfileState(userProfile);

        setProfileDisplayName(userProfile.displayName || '');
        setProfileCurrentHandicap(userProfile.handicap || '');
        setProfileTargetHandicap(userProfile.targetHandicap || '');
        setProfilePrimaryGoal(userProfile.primaryGoal || '');
        setProfileHandedness(userProfile.handedness || 'Right');
        setProfileStrengths(userProfile.strengths || '');
        setProfileWeaknesses(userProfile.weaknesses || '');
        setProfileDriverDistance(userProfile.driverDistance || '');
        setProfile7IronDistance(userProfile.sevenIronDistance || '');
        setProfilePWDistance(userProfile.pitchingWedgeDistance || '');
        setProfilePracticeHours(userProfile.practiceHoursPerWeek || '');
        setProfileFacilities(userProfile.practiceFacilities || []);
        setProfilePictureUrl(userProfile.profilePictureUrl || '');
        setProfileHomeClub(userProfile.homeClub || '');
        setProfileBagDriver(userProfile.bagSetup?.driver || '');
        setProfileBagWoods(userProfile.bagSetup?.woods || '');
        setProfileBagHybrids(userProfile.bagSetup?.hybrids || '');
        setProfileBagIrons(userProfile.bagSetup?.irons || '');
        setProfileBagWedges(userProfile.bagSetup?.wedges || '');
        setProfileBagPutter(userProfile.bagSetup?.putter || '');

        setPracticePeriodStartDate(userProfile.practicePeriodStartDate ? parseISO(userProfile.practicePeriodStartDate) : undefined);
        setPracticePeriodEndDate(userProfile.practicePeriodEndDate ? parseISO(userProfile.practicePeriodEndDate) : undefined);
        
        setIsProfileChanged(false); 
    }
  }, [userProfile]);


  React.useEffect(() => {
    if (!initialProfileState) return;

    const hasChanged =
      profileDisplayName !== (initialProfileState.displayName || '') ||
      profileCurrentHandicap !== (initialProfileState.handicap || '') ||
      profileTargetHandicap !== (initialProfileState.targetHandicap || '') ||
      profilePrimaryGoal !== (initialProfileState.primaryGoal || '') ||
      profileHandedness !== (initialProfileState.handedness || 'Right') ||
      profileStrengths !== (initialProfileState.strengths || '') ||
      profileWeaknesses !== (initialProfileState.weaknesses || '') ||
      profileDriverDistance !== (initialProfileState.driverDistance || '') ||
      profile7IronDistance !== (initialProfileState.sevenIronDistance || '') ||
      profilePWDistance !== (initialProfileState.pitchingWedgeDistance || '') ||
      JSON.stringify(profileFacilities.sort()) !== JSON.stringify((initialProfileState.practiceFacilities || []).sort()) ||
      profileHomeClub !== (initialProfileState.homeClub || '') ||
      profileBagDriver !== (initialProfileState.bagSetup?.driver || '') ||
      profileBagWoods !== (initialProfileState.bagSetup?.woods || '') ||
      profileBagHybrids !== (initialProfileState.bagSetup?.hybrids || '') ||
      profileBagIrons !== (initialProfileState.bagSetup?.irons || '') ||
      profileBagWedges !== (initialProfileState.bagSetup?.wedges || '') ||
      profileBagPutter !== (initialProfileState.bagSetup?.putter || '');

    setIsProfileChanged(hasChanged);
  }, [
    profileDisplayName, profileCurrentHandicap, profileTargetHandicap, profilePrimaryGoal, profileHandedness,
    profileStrengths, profileWeaknesses, profileDriverDistance, profile7IronDistance,
    profilePWDistance, profilePracticeHours, profileFacilities,
    profileHomeClub, profileBagDriver, profileBagWoods, profileBagHybrids,
    profileBagIrons, profileBagWedges, profileBagPutter, initialProfileState
  ]);

  const activityStatus = React.useMemo(() => {
    if (!journalEntries || journalEntries.length === 0) {
      return {
        checkIn: true, 
        preRound: true, 
      };
    }

    const allActivityDates = [
      ...rounds.map(r => new Date(r.roundDate).getTime()),
      ...journalEntries.filter(j => j.drillName !== 'User Round Reflection' && j.drillName !== "Coach's response and advice" && j.drillName !== "Check in with Coach" && j.drillName !== "Pre-round Advice").map(j => new Date(j.date).getTime())
    ].sort((a, b) => b - a);

    const latestActivityDate = allActivityDates.length > 0 ? allActivityDates[0] : 0;
    
    const lastCheckInDate = journalEntries.find(j => j.drillName === "Check in with Coach")?.date;
    const lastPreRoundAdviceDate = journalEntries.find(j => j.drillName === "Pre-round Advice")?.date;

    return {
      checkIn: !lastCheckInDate || latestActivityDate > new Date(lastCheckInDate).getTime(),
      preRound: !lastPreRoundAdviceDate || latestActivityDate > new Date(lastPreRoundAdviceDate).getTime(),
    };
  }, [journalEntries, rounds]);

  const chartData = React.useMemo(() => {
    return rounds
        .filter(round => round.roundType !== 'Indoor')
        .map(round => ({
            date: round.roundDate,
            roundDateShort: format(new Date(round.roundDate), 'MMM d'),
            handicap: parseFloat(String(round.currentHandicap).replace('+', '')),
            scoreToPar: parseScoreToPar(round.scoreToPar),
            fairwaysInRegulation: parseFloat(round.fairwaysInRegulation),
            greensInRegulation: parseFloat(round.greensInRegulation),
            puttsTotal: parseInt(round.puttsTotal),
            isNineHole: round.holesPlayed === '9',
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [rounds]);
  
  const fetchAllTrendAnalyses = React.useCallback(async (currentChartData: any[]) => {
    if (currentChartData.length < 2) return;

    const statsToAnalyze = ['handicap', 'fairwaysInRegulation', 'greensInRegulation', 'puttsTotal', 'scoreToPar'];
    const analyses: { [key: string]: string | null } = {};
    const promises = statsToAnalyze.map(async (statKey) => {
        try {
            const statHistory = currentChartData.map(d => ({ date: d.date, value: d[statKey] }));
            const result = await getTrendAnalysis({ statName: statKey, statHistory });
            analyses[statKey] = result.analysis;
        } catch (error) {
            console.error(`Error fetching trend analysis for ${statKey}:`, error);
            analyses[statKey] = "Sorry, the coach couldn't provide an analysis at this time.";
        }
    });

    await Promise.all(promises);
    setTrendAnalysis(analyses);
  }, []);
  
  React.useEffect(() => {
    if (!user || !db) {
        setIsDataLoading(false);
        return;
    }

    const loadUserData = async () => {
        setIsDataLoading(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            
            const journalQuery = query(collection(userDocRef, 'journal'), orderBy('date', 'desc'));

            const [
                roundsSnapshot,
                planSnapshot,
                sessionsSnapshot,
                journalSnapshot,
                historySnapshot,
                favouritesSnapshot,
                userDocSnapshot,
                allCoursesSnapshot
            ] = await Promise.all([
                getDocs(query(collection(userDocRef, 'rounds'), orderBy('roundDate', 'desc'))),
                getDocs(query(collection(userDocRef, 'practicePlan'), orderBy('dateAdded', 'asc'))),
                getDocs(query(collection(userDocRef, 'practiceSessions'), orderBy('createdAt', 'asc'))),
                getDocs(journalQuery),
                getDocs(collection(userDocRef, 'completedDrillHistory')),
                getDocs(collection(userDocRef, 'favouriteDrills')),
                getDoc(userDocRef),
                fetch('/api/golf-courses').then(res => res.json()) // Fetch all courses for planner
            ]);

            const roundsDataPromises = roundsSnapshot.docs.map(async (roundDoc) => {
                const roundData = { id: roundDoc.id, ...roundDoc.data() } as RoundStats;
                const holeScoresSnapshot = await getDocs(collection(roundDoc.ref, 'holeScores'));
                if (!holeScoresSnapshot.empty) {
                    roundData.holeScores = holeScoresSnapshot.docs.map(d => d.data() as HoleScore);
                }
                return roundData;
            });
            
            const roundsData = await Promise.all(roundsDataPromises);
            setRounds(roundsData);


            const practicePlanData = planSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as PracticePlanItem[];
            setPracticePlan(practicePlanData);
            
            const practiceSessionsData = sessionsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as PracticeSession[];
            setPracticeSessions(practiceSessionsData);

            const journalData = journalSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as JournalEntry[];
            setJournalEntries(journalData);

            const historyData = historySnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as CompletedDrillHistoryEntry[];
            setCompletedDrillHistory(historyData);

            const favIds = favouritesSnapshot.docs.map(d => d.id);
            setFavouriteDrillIds(favIds);
            
            let currentUserProfile: UserProfile | null = null;
            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data() as Omit<UserProfile, 'uid' | 'email'>;
                currentUserProfile = {
                    uid: user.uid,
                    email: user.email,
                    ...userData
                };
                setUserProfile(currentUserProfile);
                 setProfilePictureUrl(userData.profilePictureUrl || '');
                if (userDocSnapshot.data().drillCompletionTarget) {
                    setDrillCompletionTarget(userDocSnapshot.data().drillCompletionTarget);
                }
            } else {
                currentUserProfile = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    handicap: '36',
                };
                setUserProfile(currentUserProfile);
            }

             if (roundsData.length > 0) {
                setIdentifiedAreasOfPotential(analyzeRoundDataForDrillPrescription(roundsData[0]));
            }
            
            if (Array.isArray(allCoursesSnapshot)) {
                setAllCoursesForPlanner(allCoursesSnapshot);
            }
            
            // Check for a pending check-in from a previous session
            const pendingCheckIn = localStorage.getItem(PENDING_COACH_CHECK_IN_KEY);
            if (pendingCheckIn) {
                setCoachCheckIn(pendingCheckIn);
                localStorage.removeItem(PENDING_COACH_CHECK_IN_KEY); // Clear it after displaying
            }

            // Pre-fetch trend analysis after data is loaded
            const initialChartData = roundsData
              .filter(round => round.roundType !== 'Indoor')
              .map(round => ({
                  date: round.roundDate,
                  handicap: parseFloat(String(round.currentHandicap).replace('+', '')),
                  scoreToPar: parseScoreToPar(round.scoreToPar),
                  fairwaysInRegulation: parseFloat(round.fairwaysInRegulation),
                  greensInRegulation: parseFloat(round.greensInRegulation),
                  puttsTotal: parseInt(round.puttsTotal),
              }))
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            fetchAllTrendAnalyses(initialChartData);


        } catch (error) {
            console.error("Error loading user data:", error);
            toast({ title: "Error", description: "Could not load your data.", variant: "destructive" });
        } finally {
            setIsDataLoading(false);
        }
    };

    loadUserData();
}, [user, db, toast, fetchAllTrendAnalyses]);


const handleSetDrillCompletionTarget = async (newTarget: number) => {
    setDrillCompletionTarget(newTarget);
    if (user && db) {
        try {
            await setDoc(doc(db, 'users', user.uid), { drillCompletionTarget: newTarget }, { merge: true });
        } catch (error) {
            console.error("Failed to save drill completion target:", error);
            toast({ title: "Save Error", description: "Could not save your new target.", variant: "destructive" });
        }
    }
};

  const setCurrentPage = (page: CurrentPage, newRound: boolean = false) => {
    if (newRound) {
        _setCurrentPage('inputRoundChoice');
    } else {
        const currentIndex = navigablePages.indexOf(_currentPage);
        const newIndex = navigablePages.indexOf(page);

        if (newIndex !== -1 && newIndex > currentIndex) {
            setNavigationDirection('next');
        } else if (newIndex !== -1 && newIndex < currentIndex) {
            setNavigationDirection('prev');
        } else {
            setNavigationDirection('next');
        }
        _setCurrentPage(page);
    }
    window.scrollTo(0, 0);
  };
  
  const startFullRoundEntry = () => {
    let prefs: Partial<RoundStats> = { ...initialRoundState };
    if (typeof window !== 'undefined') {
      const storedPreferences = localStorage.getItem(ROUND_ESSENTIALS_PREFERENCES_KEY);
      if (storedPreferences) {
        try {
          const parsed = JSON.parse(storedPreferences);
          prefs = { ...prefs, ...parsed };
        } catch (e) {
          console.error("Failed to parse round preferences from localStorage", e);
        }
      }
    }
    // Prioritize profile data, then fall back to localStorage, then to initial state
    if (userProfile) {
      prefs.currentHandicap = userProfile.handicap || prefs.currentHandicap;
      prefs.targetHandicap = userProfile.targetHandicap || prefs.targetHandicap;
    }
    // Carry over selected goals
    prefs.selectedGoals = selectedGoals;

    setCurrentRound(prefs as RoundStats);
    setCurrentPage('inputRoundEssentials');
  };

  const startLiveRound = () => {
    let prefs: Partial<RoundStats> = { ...initialRoundState };
     // Prioritize profile data, then fall back to initial state
    if (userProfile) {
        prefs.currentHandicap = userProfile.handicap || '';
        prefs.targetHandicap = userProfile.targetHandicap || '';
    }
    // Carry over selected goals
    prefs.selectedGoals = selectedGoals;

    setCurrentRound(prefs as RoundStats);
    setHoleScores(initialHoleScores);
    setIsLiveRoundActive(false); // Go to setup screen first
    setCurrentPage('liveScorecard');
  };

  const isSwipeDisabled = isSubFormActive(_currentPage) || _currentPage === 'theLockerRoom' || _currentPage === 'profile' || _currentPage === 'liveScorecard';

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isSwipeDisabled) return;
      const currentIndex = navigablePages.indexOf(_currentPage);
      if (currentIndex < navigablePages.length - 1 && currentIndex !== -1) {
        setNavigationDirection('next');
        _setCurrentPage(navigablePages[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      if (isSwipeDisabled) return;
      const currentIndex = navigablePages.indexOf(_currentPage);
      if (currentIndex > 0) {
        setNavigationDirection('prev');
        _setCurrentPage(navigablePages[currentIndex - 1]);
      }
    },
    trackMouse: !isSwipeDisabled,
    preventDefaultTouchmoveEvent: false,
  });


  const toggleFavouriteDrill = React.useCallback(async (drillId: string) => {
    if (!user || !db) return;
    const favRef = doc(db, 'users', user.uid, 'favouriteDrills', drillId);
    const isCurrentlyFavourite = favouriteDrillIds.includes(drillId);
    const drillName = drills.find(d => d.id === drillId)?.name || "Drill";

    try {
        if (isCurrentlyFavourite) {
            await deleteDoc(favRef);
            setFavouriteDrillIds(prev => prev.filter(id => id !== drillId));
            toast({ title: "Removed from Favourites", description: drillName });
        } else {
            await setDoc(favRef, { drillId, dateAdded: Timestamp.now() });
            setFavouriteDrillIds(prev => [...prev, drillId]);
            toast({ title: "Added to Favourites", description: drillName });
        }
    } catch (error) {
        console.error("Error toggling favourite drill:", error);
        toast({ title: "Error", description: "Could not update favourites.", variant: "destructive" });
    }
}, [user, db, favouriteDrillIds, drills, toast]);


  React.useEffect(() => {
    const tourCompleted = localStorage.getItem(ONBOARDING_TOUR_COMPLETED_KEY) === 'true';
    setIsTourCompleted(tourCompleted);
    
    const lockerRoomIntroSeen = localStorage.getItem(LOCKER_ROOM_INTRO_SEEN_KEY) === 'true';
    if (lockerRoomIntroSeen) {
        setIsLockerRoomIntroExpanded(false);
    } else {
        setIsLockerRoomIntroExpanded(true);
    }

    if (typeof window !== 'undefined' && !editingRoundId) {
      const storedPreferences = localStorage.getItem(ROUND_ESSENTIALS_PREFERENCES_KEY);
      if (storedPreferences) {
        try {
          const parsedPreferences = JSON.parse(storedPreferences);
          setCurrentRound(prev => ({
            ...prev,
            roundType: parsedPreferences.roundType || initialRoundState.roundType,
            courseName: parsedPreferences.courseName || initialRoundState.courseName,
            teePlayedOff: parsedPreferences.teePlayedOff || initialRoundState.teePlayedOff,
            currentHandicap: userProfile?.handicap || parsedPreferences.currentHandicap || initialRoundState.currentHandicap,
            targetHandicap: userProfile?.targetHandicap || parsedPreferences.targetHandicap || initialRoundState.targetHandicap,
            coursePar: parsedPreferences.coursePar || initialRoundState.coursePar,
          }));
        } catch (e) {
          console.error("Failed to parse round preferences from localStorage", e);
        }
      } else if (userProfile) {
         setCurrentRound(prev => ({
            ...prev,
            currentHandicap: userProfile.handicap || initialRoundState.currentHandicap,
            targetHandicap: userProfile.targetHandicap || initialRoundState.targetHandicap,
         }));
      }
    }
  }, [editingRoundId, userProfile]);


  React.useEffect(() => {

    let firstInputId: string | null = null;
    switch (_currentPage) {
      case 'inputRoundEssentials':
        firstInputId = 'roundDate';
        break;
      case 'inputRoundDriving':
        firstInputId = 'drivingDistance';
        break;
      case 'inputRoundApproach':
        firstInputId = 'greensInRegulation';
        break;
      case 'inputRoundAroundTheGreen':
        firstInputId = 'upAndDown';
        break;
      case 'inputRoundPutting':
        firstInputId = 'puttsTotal';
        break;
      case 'inputReflection':
        firstInputId = 'generalObservations';
        break;
    }

    if (firstInputId) {
      setTimeout(() => {
        const inputElement = document.getElementById(firstInputId);
        inputElement?.focus();
      }, 100);
    }
  }, [_currentPage]);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsHeaderScrolled(true);
      } else {
        setIsHeaderScrolled(false);
      }

      if (window.pageYOffset > 300) {
        setShowScrollTopButton(true);
      } else {
        setShowScrollTopButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const hasLoggedRounds = rounds.length > 0;

  React.useEffect(() => {
    const shouldHideScroll =
      (_currentPage === 'dashboard' && !hasLoggedRounds) ||
      (_currentPage === 'drills' && !hasLoggedRounds) ||
      (_currentPage === 'practice' && practicePlan.length === 0 && activePracticeTab === 'unassigned' && practicePlan.filter(item => item.completed).length === 0) ||
      (_currentPage === 'journal' && journalEntries.length === 0) ||
      (_currentPage === 'library' && true && drills.filter(d => d.audioUrl).length === 0) ||
      (_currentPage === 'theLockerRoom' && drills.filter(d => d.audioUrl).length === 0) ||
      (_currentPage === 'achievements' && initialAchievements.length === 0) ;

    if (shouldHideScroll) {
      document.body.classList.add('overflow-y-hidden');
    } else {
      document.body.classList.remove('overflow-y-hidden');
    };
    return () => {
      document.body.classList.remove('overflow-y-hidden');
    };
  }, [_currentPage, hasLoggedRounds, practicePlan, journalEntries.length, activePracticeTab, initialAchievements.length, drills]);


  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any; type?: string; checked?: boolean } }) => {
    const { name, value } = e.target;
    const type = e.target.type || (typeof e.target.checked === 'boolean' ? 'checkbox' : 'text');
    const checked = e.target.checked;

    const newFieldValue = type === 'checkbox' ? checked : value;

    setCurrentRound(prevRound => {
        const updatedRound = { ...prevRound, [name]: newFieldValue };

        if (name === 'grossScore' || name === 'coursePar' || name === 'holesPlayed') {
            const gross = parseInt(updatedRound.grossScore);
            const par = parseInt(updatedRound.coursePar);
            if (!isNaN(gross) && !isNaN(par)) {
                const score = gross - par;
                updatedRound.scoreToPar = score > 0 ? `+${score}` : score.toString();
            } else {
                updatedRound.scoreToPar = '';
            }
        }

        const firChanged = name === 'fairwaysInRegulation';
        const fmlChanged = name === 'fairwaysMissedLeft';

        if (firChanged || fmlChanged) {
            const firVal = parseFloat(firChanged ? String(updatedRound.fairwaysInRegulation) : prevRound.fairwaysInRegulation);
            const fmlVal = parseFloat(fmlChanged ? String(updatedRound.fairwaysMissedLeft) : fmlChanged ? String(updatedRound.fairwaysMissedLeft) : prevRound.fairwaysMissedLeft);

            const robustFir = !isNaN(firVal) ? firVal : 0;
            const robustFml = !isNaN(fmlVal) ? fmlVal : 0;

            const fmrCalc = 100 - robustFir - robustFml;
            updatedRound.fairwaysMissedRight = fmrCalc >= 0 ? fmrCalc.toFixed(1).replace(/\.0$/, '') : '0';
        }

        const girChanged = name === 'greensInRegulation';
        const gmlChanged = name === 'greensMissedLeft';
        const gmrChanged = name === 'greensMissedRight';
        const gmsChanged = name === 'greensMissedShort';

        if (girChanged || gmlChanged || gmrChanged || gmsChanged) {
            const girVal = parseFloat(girChanged ? String(updatedRound.greensInRegulation) : prevRound.greensInRegulation);
            const gmlVal = parseFloat(gmlChanged ? String(updatedRound.greensMissedLeft) : prevRound.greensMissedLeft);
            const gmrVal = parseFloat(gmrChanged ? String(updatedRound.greensMissedRight) : prevRound.greensMissedRight);
            const gmsVal = parseFloat(gmsChanged ? String(updatedRound.greensMissedShort) : prevRound.greensMissedShort);

            const robustGir = !isNaN(girVal) ? girVal : 0;
            const robustGml = !isNaN(gmlVal) ? gmlVal : 0;
            const robustGmr = !isNaN(gmrVal) ? gmrVal : 0;
            const robustGms = !isNaN(gmsVal) ? gmsVal : 0;

            const totalAccountedFor = robustGir + robustGml + robustGmr + robustGms;
            const gmlongCalc = 100 - totalAccountedFor;
            updatedRound.greensMissedLong = gmlongCalc >= 0 ? gmlongCalc.toFixed(1).replace(/\.0$/, '') : '0';
        }

        const threePuttsChanged = name === 'threePuttsOrMore';
        const twoPuttsChanged = name === 'twoPutts';

        if (threePuttsChanged || twoPuttsChanged) {
            const holes = parseInt(updatedRound.holesPlayed);
            const threePVal = threePuttsChanged ? String(newFieldValue) : updatedRound.threePuttsOrMore;
            const twoPVal = twoPuttsChanged ? String(newFieldValue) : updatedRound.twoPutts;

            const robustHoles = !isNaN(holes) ? holes : 0;
            const robustThreeP = !isNaN(parseInt(threePVal)) ? parseInt(threePVal) : 0;
            const robustTwoP = !isNaN(parseInt(twoPVal)) ? parseInt(twoPVal) : 0;

            if (robustHoles > 0) {
                let onePuttsCalc = robustHoles - (robustThreeP + robustTwoP);
                if (onePuttsCalc < 0) {
                    onePuttsCalc = 0;
                }
                updatedRound.onePutts = onePuttsCalc.toString();
            } else {
                updatedRound.onePutts = '';
            }
        }
        return updatedRound;
    });
  }, []);


  const analyzeRoundDataForDrillPrescription = (round: RoundStats): IdentifiedAreaOfPotential[] => {
    const areasOfPotentialWithScores: IdentifiedAreaOfPotential[] = [];
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
    if (parseFloat(round.fairwaysMissedRight) > 40) addAreaOfPotential('consistentMissRight', 4);
    if (parseFloat(round.fairwaysMissedLeft) > 40) addAreaOfPotential('consistentMissLeft', 4);
    if (parseInt(round.drivingPenalties) > (isNineHoleRound ? 0 : 1)) addAreaOfPotential('drivingPenaltiesHigh', 3);

    if (parseFloat(round.greensInRegulation) < girThreshold) addAreaOfPotential('girLow', 4);
    if (parseFloat(round.greensMissedShort) > 30) addAreaOfPotential('approachMissShort', 3);
    if (parseFloat(round.greensMissedLong) > 30) addAreaOfPotential('approachMissLong', 3);
    const totalApproachMisses = (parseFloat(round.greensMissedShort) || 0) + (parseFloat(round.greensMissedLeft) || 0) + (parseFloat(round.greensMissedRight) || 0) + (parseFloat(round.greensMissedLong) || 0);
    const approachOpportunities = isNineHoleRound ? 9 : 18;
    if ((totalApproachMisses / approachOpportunities) * 100 > (isNineHoleRound ? 70 : 60)) {
         addAreaOfPotential('approachConsistency', 2);
    }

    if (parseInt(round.puttsTotal) > puttsTotalThreshold) addAreaOfPotential('puttingConsistencyGeneral', 3);
    if (parseInt(round.threePuttsOrMore) >= threePuttThreshold) addAreaOfPotential('threePuttHigh', 5);

    if (!round.notApplicable5yards && parseInt(round.puttsAttempted5yards) > 0) {
        const perc5 = (parseInt(round.puttsMade5yards || "0") / parseInt(round.puttsAttempted5yards)) * 100;
        if (perc5 < 75) addAreaOfPotential('putting5ftLowPercentage', 4);
    }
    if (!round.notApplicable10yards && parseInt(round.puttsAttempted10yards) > 0) {
        const perc10 = (parseInt(round.puttsMade10yards || "0") / parseInt(round.puttsAttempted10yards)) * 100;
        if (perc10 < 50) addAreaOfPotential('putting10ftLowPercentage', 3);
    }
    if (!round.notApplicable20yards && parseInt(round.puttsAttempted20yards) > 0) {
        const perc20 = (parseInt(round.puttsMade20yards || "0") / parseInt(round.puttsAttempted20yards)) * 100;
        if (perc20 < 20) addAreaOfPotential('putting20ftLowPercentage', 2);
    }
     if (!round.notApplicable21plusYards && parseInt(round.puttsAttempted21plusYards) > 0) {
        const perc21plus = (parseInt(round.puttsMade21plusYards || "0") / parseInt(round.puttsAttempted21plusYards)) * 100;
        if (perc21plus < 10) addAreaOfPotential('putting21plusYardsLowPercentage', 2);
    }

    if (parseFloat(round.upAndDown) < (isNineHoleRound ? 25 : 30)) addAreaOfPotential('upAndDownLow', 3);
    
    if (parseInt(round.sandSavesAttempted) > 0) {
        const sandSavePerc = (parseInt(round.sandSavesMade || "0") / parseInt(round.sandSavesAttempted)) * 100;
        if (sandSavePerc < 25) addAreaOfPotential('sandSavesLow', 3);
    }
    
    if (parseFloat(round.upAndDown) < (isNineHoleRound ? 25 : 30)) {
        addAreaOfPotential('shortGameScrambling', 2);
    }

    if (round.generalObservations && round.generalObservations.toLowerCase().includes("alignment")) {
        addAreaOfPotential('alignmentIssue', 4);
    }

    areasOfPotentialWithScores.sort((a, b) => b.score - a.score);
    return areasOfPotentialWithScores;
  };

  const handleValidateEssentials = () => {
    if (!currentRound.roundDate) { toast({ title: "Error", description: "Please enter the date of the round.", variant: "destructive" }); return false; }
    if (!currentRound.courseName.trim()) { toast({ title: "Error", description: "Please enter the course name.", variant: "destructive" }); return false; }
    if (!currentRound.grossScore || !currentRound.coursePar) { toast({ title: "Error", description: "Please enter Gross Score and Course Par.", variant: "destructive" }); return false; }
    if (currentRound.currentHandicap && !/^(|\+)?\d*(\.\d{0,1})?$/.test(currentRound.currentHandicap)) { toast({ title: "Error", description: "Please enter a valid current handicap (e.g., 18.3, +2, 5).", variant: "destructive" }); return false; }
    if (!currentRound.targetHandicap.trim() || !/^\d*$/.test(currentRound.targetHandicap)) { toast({ title: "Error", description: "Please enter a valid target handicap (e.g., 15, 10, 5). Whole numbers only.", variant: "destructive" }); return false; }
    return true;
  };

  const handleFetchClarifyingQuestions = async () => {
    if (!currentRound.generalObservations.trim()) {
      toast({ title: "Observation Needed", description: "Please write a few thoughts about your round first.", variant: "destructive" });
      return;
    }
    setIsFetchingClarifyingQuestions(true);
    setClarifyingQuestions([]);
    try {
      const pastObservations = rounds.map(r => r.generalObservations).filter(Boolean);
      const input: ClarifyingQuestionsInput = {
        typeOfRound: currentRound.roundType,
        generalObservations: currentRound.generalObservations,
        pastObservations: pastObservations,
        scoreToPar: currentRound.scoreToPar,
        fairwaysInRegulation: currentRound.fairwaysInRegulation,
        greensInRegulation: currentRound.greensInRegulation,
        puttsTotal: currentRound.puttsTotal,
        threePuttsOrMore: currentRound.threePuttsOrMore,
      };
      const result = await getClarifyingQuestions(input);
      if (result.questions && result.questions.length > 0) {
        setClarifyingQuestions(result.questions);
        setReflectionStep('clarified');
      } else {
        // If no questions, proceed to submit.
        if (editingRoundId) {
          await handleUpdateRound();
        } else {
          await handleAddReflection();
        }
      }
    } catch (error) {
      console.error("Error fetching clarifying questions:", error);
      toast({ title: "Coach Error", description: "Couldn't get clarifying questions. You can still submit your round.", variant: "destructive" });
       // Still allow submission even if questions fail
      setClarifyingQuestions([]);
      setReflectionStep('clarified'); 
    } finally {
      setIsFetchingClarifyingQuestions(false);
    }
  };


  const handleAddReflection = async () => {
    if (!user || !db || !userProfile) return;
    setIsSubmittingRound(true);
    const isFirstRoundEver = rounds.length === 0;

    let finalObservations = currentRound.generalObservations;
    if (clarifyingQuestions.length > 0 && clarifyingAnswers.trim()) {
        const questionsText = clarifyingQuestions.map(q => `- ${q}`).join('\n');
        finalObservations = `${currentRound.generalObservations}\n\n**Coach's Questions:**\n${questionsText}\n\n**My Answers:**\n${clarifyingAnswers}`;
    }
    
    const roundDataForFirestore: Omit<RoundStats, 'id' | 'holeScores'> = { 
        ...currentRound,
        generalObservations: finalObservations,
    };
    delete (roundDataForFirestore as Partial<RoundStats>).id;
    delete (roundDataForFirestore as Partial<RoundStats>).holeScores;

    try {
        const batch = writeBatch(db);
        const userRoundsCol = collection(db, 'users', user.uid, 'rounds');
        const roundDocRef = doc(userRoundsCol);
        batch.set(roundDocRef, {
            ...roundDataForFirestore,
            createdAt: Timestamp.now()
        });

        if (currentRound.holeScores && currentRound.holeScores.length > 0) {
            const holesColRef = collection(roundDocRef, 'holeScores');
            currentRound.holeScores.forEach((holeScore, index) => {
                const holeDocRef = doc(holesColRef, `hole_${index + 1}`);
                batch.set(holeDocRef, holeScore);
            });
        }
        
        await batch.commit();
        
        const newRoundWithId: RoundStats = { ...currentRound, id: roundDocRef.id, generalObservations: finalObservations };
        const updatedRounds = [newRoundWithId, ...rounds].sort((a, b) => new Date(b.roundDate).getTime() - new Date(a.roundDate).getTime());
        setRounds(updatedRounds);
        
        const currentAreasOfPotential = analyzeRoundDataForDrillPrescription(newRoundWithId);
        setIdentifiedAreasOfPotential(currentAreasOfPotential);

        // Run Goal Manager Agent
        const gmaResult: GMAResult = await goalManagerAgent({ userProfile, allRounds: updatedRounds, areasOfPotential: currentAreasOfPotential });
        
        let updatedProfile = { ...userProfile };
        if (gmaResult.focusHasChanged && gmaResult.newFocus) {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { primaryFocus: gmaResult.newFocus });
            updatedProfile.primaryFocus = gmaResult.newFocus;
            setUserProfile(updatedProfile); // Update local state immediately
            if (gmaResult.message) {
                toast({ title: "Coaching Focus Updated!", description: gmaResult.message });
            }
        }
        
        if (newRoundWithId.generalObservations.trim()) {
            const userReflectionEntry: Omit<JournalEntry, 'id'> = {
                roundId: newRoundWithId.id,
                notes: `User Round Reflection (${new Date(newRoundWithId.roundDate).toLocaleDateString()} at ${newRoundWithId.courseName}, ${newRoundWithId.holesPlayed} holes):\n${newRoundWithId.generalObservations}`,
                date: new Date(newRoundWithId.roundDate).toISOString(),
                drillName: 'User Round Reflection'
            };
            const journalDocRef = await addDoc(collection(db, 'users', user.uid, 'journal'), userReflectionEntry);
            setJournalEntries(prev => [ { ...userReflectionEntry, id: journalDocRef.id }, ...prev]);
        }

        const preferencesToSave = {
            roundType: newRoundWithId.roundType, courseName: newRoundWithId.courseName, teePlayedOff: newRoundWithId.teePlayedOff,
            currentHandicap: newRoundWithId.currentHandicap, targetHandicap: newRoundWithId.targetHandicap, coursePar: newRoundWithId.coursePar,
        };
        localStorage.setItem(ROUND_ESSENTIALS_PREFERENCES_KEY, JSON.stringify(preferencesToSave));

        if (typeof window !== 'undefined') {
            localStorage.removeItem(LIVE_ROUND_STATE_KEY);
        }
        setIsLiveRoundActive(false);

        setCurrentRound({ ...initialRoundState, ...preferencesToSave });
        setReflectionStep('initial');
        setClarifyingQuestions([]);
        setClarifyingAnswers('');
        
        await triggerFetchRoundAnalysis(newRoundWithId);

        const newChartData = updatedRounds
          .filter(round => round.roundType !== 'Indoor')
          .map(round => ({
              date: round.roundDate,
              handicap: parseFloat(String(round.currentHandicap).replace('+', '')),
              scoreToPar: parseScoreToPar(round.scoreToPar),
              fairwaysInRegulation: parseFloat(round.fairwaysInRegulation),
              greensInRegulation: parseFloat(round.greensInRegulation),
              puttsTotal: parseInt(round.puttsTotal),
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        await fetchAllTrendAnalyses(newChartData);
        
        setCurrentPage('dashboard');
        toast({ title: "Success", description: "Round logged successfully!" });

        if (isFirstRoundEver && !isTourCompleted) {
            setOnboardingStep(1); 
        }

    } catch (error) {
        console.error("Failed to add round:", error);
        toast({ title: "Save Error", description: "Could not save your round data.", variant: "destructive" });
    } finally {
        setIsSubmittingRound(false);
    }
  };

  const handleUpdateRound = async () => {
    if (!user || !editingRoundId || !db) return;
    setIsSubmittingRound(true);

    let finalObservations = currentRound.generalObservations;
    if (clarifyingQuestions.length > 0 && clarifyingAnswers.trim()) {
        const questionsText = clarifyingQuestions.map(q => `- ${q}`).join('\n');
        finalObservations = `${currentRound.generalObservations}\n\n**Coach's Questions:**\n${questionsText}\n\n**My Answers:**\n${clarifyingAnswers}`;
    }

    const roundDataForFirestore: Partial<RoundStats> = { 
        ...currentRound, 
        generalObservations: finalObservations 
    };
    delete roundDataForFirestore.id;
    delete roundDataForFirestore.holeScores; // Don't update hole scores on manual edit for now

    try {
        const roundRef = doc(db, 'users', user.uid, 'rounds', editingRoundId);
        await updateDoc(roundRef, roundDataForFirestore);

        const updatedRoundWithObservations = { ...currentRound, generalObservations: finalObservations };
        const updatedRounds = rounds.map(r => r.id === editingRoundId ? updatedRoundWithObservations : r)
                                    .sort((a, b) => new Date(b.roundDate).getTime() - new Date(a.date).getTime());
        setRounds(updatedRounds);

        const journalEntryToUpdateQuery = query(
            collection(db, 'users', user.uid, 'journal'), 
            where('roundId', '==', editingRoundId),
            where('drillName', 'in', ['User Round Reflection', "Coach's response and advice"])
        );
        
        const journalSnapshot = await getDocs(journalEntryToUpdateQuery);
        const batch = writeBatch(db);

        // Delete old user reflection and AI analysis for this round
        journalSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Add new user reflection
        const userReflectionEntry: Omit<JournalEntry, 'id'> = {
            roundId: editingRoundId,
            notes: `User Round Reflection (${new Date(currentRound.roundDate).toLocaleDateString()} at ${currentRound.courseName}, ${currentRound.holesPlayed} holes):\n${finalObservations}`,
            date: new Date().toISOString(), // Use current timestamp for update
            drillName: 'User Round Reflection'
        };
        const newJournalDocRef = doc(collection(db, 'users', user.uid, 'journal'));
        batch.set(newJournalDocRef, userReflectionEntry);
        
        await batch.commit();

        // Refresh local journal entries
        const allJournalSnapshot = await getDocs(query(collection(db, 'users', user.uid, 'journal'), orderBy('date', 'desc')));
        setJournalEntries(allJournalSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as JournalEntry[]);
        
        setIdentifiedAreasOfPotential(analyzeRoundDataForDrillPrescription(updatedRoundWithObservations));
        await triggerFetchRoundAnalysis(updatedRoundWithObservations);
        
        const newChartData = updatedRounds
          .filter(round => round.roundType !== 'Indoor')
          .map(round => ({
              date: round.roundDate,
              handicap: parseFloat(String(round.currentHandicap).replace('+', '')),
              scoreToPar: parseScoreToPar(round.scoreToPar),
              fairwaysInRegulation: parseFloat(round.fairwaysInRegulation),
              greensInRegulation: parseFloat(round.greensInRegulation),
              puttsTotal: parseInt(round.puttsTotal),
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        await fetchAllTrendAnalyses(newChartData);

        setEditingRoundId(null);
        setCurrentRound(initialRoundState);
        setReflectionStep('initial');
        setClarifyingQuestions([]);
        setClarifyingAnswers('');
        
        toast({ title: "Success", description: "Round updated successfully!" });
        setCurrentPage('journal');

    } catch (error: any) {
        console.error("Failed to update round:", error);
        toast({ title: "Update Error", description: `Could not save your changes. ${error.message}`, variant: "destructive" });
    } finally {
        setIsSubmittingRound(false);
    }
  };

  const handleStartEditRound = (entry: JournalEntry | RoundStats) => {
    let roundToEdit: RoundStats | undefined;
  
    if ('roundId' in entry && entry.roundId) {
        // It's a JournalEntry with a roundId
        roundToEdit = rounds.find(r => r.id === entry.roundId);
    } else if ('grossScore' in entry) {
        // It's a RoundStats object
        roundToEdit = entry;
    } else if (
        'drillName' in entry &&
        (entry.drillName === "Coach's response and advice" || 
         entry.drillName === "Check in with Coach" || 
         entry.drillName === "Pre-round Advice" ||
         entry.drillName === "User Round Reflection")
    ) {
        // It's a journal entry without a direct roundId, find the latest round
        if (rounds.length > 0) {
            const sortedRounds = [...rounds].sort((a, b) => new Date(b.roundDate).getTime() - new Date(a.roundDate).getTime());
            roundToEdit = sortedRounds[0];
        }
    }
  
    if (roundToEdit) {
        setCurrentRound(roundToEdit);
        setEditingRoundId(roundToEdit.id as string);
        setCurrentPage('inputRoundEssentials');
    } else {
        toast({
            title: "Error Finding Round",
            description: "Could not find the associated round to edit.",
            variant: "destructive"
        });
    }
  };

  const handleCancelEdit = () => {
    setEditingRoundId(null);
    setCurrentRound(initialRoundState);
    setCurrentPage('journal');
  };

  const addDrillToPlan = React.useCallback(async (drillId: string) => {
    if (!user || !db) return;
    if (!hasLoggedRounds && _currentPage !== 'library') {
        toast({ title: "Action Required", description: "Please log a round before adding drills.", variant: "default" });
        return;
    }
    if (practicePlan.some(item => item.drillId === drillId && !item.completed)) {
        toast({ title: "Already in Plan", description: "This drill is already in your to-do list." });
        return;
    }

    const newPlanItem: Omit<PracticePlanItem, 'id'> = {
        drillId, score: '', notes: '', completed: false,
        dateAdded: new Date().toISOString(),
        timeTaken: 0,
        sessionId: null,
    };

    try {
        const docRef = await addDoc(collection(db, 'users', user.uid, 'practicePlan'), newPlanItem);
        setPracticePlan(prev => [...prev, { ...newPlanItem, id: docRef.id }]);
        toast({ title: "Drill Added", description: "Drill added to your practice plan."});
    } catch (error) {
        console.error("Failed to add drill to plan:", error);
        toast({ title: "Error", description: "Could not add drill to plan.", variant: "destructive" });
    }
}, [user, db, hasLoggedRounds, _currentPage, practicePlan, toast]);

const handleBuildPlanWithAI = async () => {
    if (!user || !db || rounds.length === 0) {
        toast({ title: "Data Needed", description: "Please log at least one round before building a plan with AI.", variant: "destructive" });
        return;
    }

    setIsBuildingPlan(true);
    setPlanSummary(null);

    try {
        const input = {
            allDrills: drills.map(d => ({ id: d.id, name: d.name, category: d.category, description: d.description })),
            identifiedAreasOfPotential: identifiedAreasOfPotential,
            targetDrillCount: drillCompletionTarget || 3,
        };

        const result = await orchestrate({ task: 'buildPracticePlan', input });
        
        if (result.agent === 'CoachPlanningAgent' && result.output.recommendedDrills) {
            const recommendedDrillsData = result.output.recommendedDrills as { drillId: string, rationale: string }[];
            
            const batch = writeBatch(db);
            const newPlanItems: PracticePlanItem[] = [];
            const summaryLines: string[] = [];

            recommendedDrillsData.forEach((rec) => {
                if (!practicePlan.some(p => p.drillId === rec.drillId && !p.completed)) {
                    const newPlanItem: Omit<PracticePlanItem, 'id'> = {
                        drillId: rec.drillId, score: '', notes: '', completed: false,
                        dateAdded: new Date().toISOString(), timeTaken: 0, sessionId: null,
                    };
                    const docRef = doc(collection(db, 'users', user.uid, 'practicePlan'));
                    batch.set(docRef, newPlanItem);
                    newPlanItems.push({ ...newPlanItem, id: docRef.id });
                    
                    const drillDetail = drills.find(d => d.id === rec.drillId);
                    if (drillDetail) {
                        summaryLines.push(`**${drillDetail.name}:** ${rec.rationale}`);
                    }
                }
            });

            await batch.commit();

            setPracticePlan(prev => [...prev, ...newPlanItems]);
            
            const finalSummary = `I've analyzed your data and built a new practice plan for you. Here's what I've prescribed and why:\n\n${summaryLines.join('\n\n')}\n\nHead to The Agenda now to see the drills in more detail.`;
            setPlanSummary(finalSummary);

            const journalEntry: Omit<JournalEntry, 'id'> = {
                notes: `Coach's New Practice Plan:\n${finalSummary}`,
                date: new Date().toISOString(),
                drillName: "AI Practice Plan Generated",
            };
            const journalDocRef = await addDoc(collection(db, 'users', user.uid, 'journal'), journalEntry);
            setJournalEntries(prev => [...prev, { ...journalEntry, id: journalDocRef.id }].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            
            toast({
                title: "Practice Plan Built!",
                description: `The AI Coach has added ${newPlanItems.length} new drills to your agenda.`,
            });
        } else {
            throw new Error("AI Agent returned an unexpected response.");
        }
    } catch (error) {
        console.error("Error building plan with AI:", error);
        toast({ title: "AI Error", description: "Could not build your practice plan at this time.", variant: "destructive" });
    } finally {
        setIsBuildingPlan(false);
    }
};

  const updatePracticeDrill = React.useCallback(async (index: number, field: keyof PracticePlanItem, value: string | number | boolean | null) => {
    const planItem = practicePlan[index];
    if (!user || !planItem?.id || !db) return;

    let val = value;
    if (field === 'timeTaken') {
        val = (parseInt(value as string) || 0);
    } else if (field === 'sessionId' && value === '') {
        val = null;
    }

    setPracticePlan(prev => prev.map((item, i) => i === index ? { ...item, [field]: val } : item));

    try {
        const itemRef = doc(db, 'users', user.uid, 'practicePlan', planItem.id);
        await updateDoc(itemRef, { [field]: val });
    } catch (error) {
        console.error("Failed to update drill:", error);
        toast({ title: "Update Error", description: "Failed to save changes to drill.", variant: "destructive" });
        // Revert UI on failure
        setPracticePlan(prev => prev.map((item, i) => i === index ? { ...item, [field]: planItem[field] } : item));
    }
  }, [user, db, practicePlan, toast]);

 const onCompleteAgain = React.useCallback(async (drillId: string) => {
    if (!user || !db) return;

    setShowCompleteDrillDialog({ isOpen: false, planIndex: null });

    const newPlanItem: Omit<PracticePlanItem, 'id'> = {
        drillId, score: '', notes: '', completed: false,
        dateAdded: new Date().toISOString(),
        timeTaken: 0
    };

    try {
        const docRef = await addDoc(collection(db, 'users', user.uid, 'practicePlan'), newPlanItem);
        setPracticePlan(prev => [...prev, { ...newPlanItem, id: docRef.id }].sort((a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()));
        toast({ title: "Drill Added", description: "Drill added back to your to-do list."});
        setActivePracticeTab('unassigned');
    } catch (error) {
        console.error("Failed to re-add drill to plan:", error);
        toast({ title: "Error", description: "Could not add drill to plan.", variant: "destructive" });
    }
}, [user, db, toast]);


 const toggleCompleteDrill = React.useCallback(async (index: number) => {
    if (!user || !db || index === null) return;
    
    setShowCompleteDrillDialog({ isOpen: false, planIndex: null });

    const itemToToggle = practicePlan[index];
    const drillDetails = drills.find(d => d.id === itemToToggle.drillId);
    if (!itemToToggle.id || !drillDetails) return;
    
    const isNowCompleted = !itemToToggle.completed;
    if (!isNowCompleted) return; // Only handle completion, not reversal for now

    const dateCompleted = new Date().toISOString();
    
    // Construct final notes
    let finalNotes = itemToToggle.notes;
    const answers = drillClarifyingAnswers[index];
    if (activeDrillReflection.planItemIndex === index && drillClarifyingQuestions.length > 0 && answers?.trim()) {
        const questionsText = drillClarifyingQuestions.map(q => `- ${q}`).join('\n');
        finalNotes = `${itemToToggle.notes}\n\n**Coach's Questions:**\n${questionsText}\n\n**My Answers:**\n${answers}`;
    }

    const updatedItem = { ...itemToToggle, completed: true, dateCompleted, notes: finalNotes };
    const updatedPlan = practicePlan.map((item, i) => i === index ? updatedItem : item);
    setPracticePlan(updatedPlan);

    const batch = writeBatch(db);
    const planItemRef = doc(db, 'users', user.uid, 'practicePlan', itemToToggle.id);
    batch.update(planItemRef, { completed: true, dateCompleted, notes: finalNotes });
    
    const historyRef = doc(db, 'users', user.uid, 'completedDrillHistory', itemToToggle.drillId);
    batch.set(historyRef, {
        drillId: itemToToggle.drillId,
        recurrenceScore: increment(1),
        dateCompleted: getTodayDate()
    }, { merge: true });

    if (finalNotes.trim()) {
        const journalRef = doc(collection(db, 'users', user.uid, 'journal'));
        const journalEntry = {
            notes: finalNotes,
            date: new Date().toISOString(),
            drillName: drillDetails.name,
            practicePlanItemDateAdded: itemToToggle.dateAdded
        };
        batch.set(journalRef, journalEntry);
    }
    
    toast({ title: "Drill Completed!", description: finalNotes.trim() ? "Notes added to The Agenda." : "" });

    try {
        await batch.commit();
        
        // Update local state after successful commit
        setCompletedDrillHistory(prev => {
            const existing = prev.find(h => h.drillId === itemToToggle.drillId);
            if (existing) {
                return prev.map(h => h.drillId === itemToToggle.drillId ? {...h, recurrenceScore: (h.recurrenceScore || 0) + 1, dateCompleted: getTodayDate()} : h);
            }
            return [...prev, { drillId: itemToToggle.drillId, recurrenceScore: 1, dateCompleted: getTodayDate() }];
        });
        
        if (finalNotes.trim()) {
            const journalSnapshot = await getDocs(query(collection(db, 'users', user.uid, 'journal'), orderBy('date', 'desc')));
            setJournalEntries(journalSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as JournalEntry[]);
        }

        // Reset reflection state for this item
        if (activeDrillReflection.planItemIndex === index) {
          setActiveDrillReflection({ planItemIndex: null, drillId: null });
          setDrillClarifyingQuestions([]);
          setDrillClarifyingAnswers(prev => {
              const newAnswers = { ...prev };
              delete newAnswers[index];
              return newAnswers;
          });
        }
        
        const updatedRounds = rounds;
        const updatedJournal = [
            {... (journalEntry as Omit<JournalEntry, 'id'>), id: 'temp-id'},
            ...journalEntries
        ];
        
        // Proactive Coach Check-in Trigger
        if (userProfile) {
            triggerFetchCoachCheckIn(true, updatedRounds, updatedJournal, updatedPlan, userProfile);
        }

    } catch (error) {
        console.error("Failed to toggle drill completion:", error);
        toast({ title: "Error", description: "Could not update drill status.", variant: "destructive" });
        setPracticePlan(practicePlan); // Revert UI on failure
    }
}, [user, db, practicePlan, drills, toast, drillClarifyingAnswers, activeDrillReflection, drillClarifyingQuestions, rounds, journalEntries, userProfile]);


  const removeDrillFromPlan = React.useCallback(async (index: number) => {
    if(!user || !db) return;
    const itemToRemove = practicePlan[index];
    if (!itemToRemove?.id) return;

    setPracticePlan(prev => prev.filter((_, i) => i !== index));

    try {
        await deleteDoc(doc(db, 'users', user.uid, 'practicePlan', itemToRemove.id));
        toast({ title: "Drill Removed", description: "Drill removed from practice plan."});
    } catch (error) {
        console.error("Failed to remove drill from plan:", error);
        toast({ title: "Error", description: "Could not remove drill.", variant: "destructive" });
        setPracticePlan(practicePlan);
    }
  }, [user, db, practicePlan, toast]);


  const triggerFetchAIModificationsForDrill = async (drill: Drill, relevantAreasOfPotentialObjects: IdentifiedAreaOfPotential[]) => {
    setIsFetchingDrillModifications(true);
    setAiDrillModifications({ drillId: drill.id, content: null, error: null });

    const areasOfPotentialTags = relevantAreasOfPotentialObjects.map(aop => aop.tag);

    const lastRound = rounds.length > 0 ? {
        scoreToPar: rounds[0].scoreToPar,
        fairwaysInRegulation: rounds[0].fairwaysInRegulation,
        greensInRegulation: rounds[0].greensInRegulation,
        puttsTotal: rounds[0].puttsTotal,
        generalObservations: rounds[0].generalObservations,
    } : undefined;

    const relevantJournalEntries = journalEntries
        .filter(entry => entry.drillName === drill.name)
        .map(entry => ({ drillName: entry.drillName, notes: entry.notes }));
    
    const input: AiDrillFocusInput = {
        drillName: drill.name,
        drillDescription: drill.description,
        areasOfPotential: areasOfPotentialTags,
        lastRound,
        relevantJournalEntries,
    };

    try {
      const result = await aiDrillFocus(input);
      setAiDrillModifications({ drillId: drill.id, content: result.modifications, error: null });
    } catch (error) {
      console.error("Error fetching AI drill modifications:", error);
      setAiDrillModifications({ drillId: drill.id, content: null, error: "Sorry, the Coach couldn't suggest modifications now." });
    } finally {
      setIsFetchingDrillModifications(false);
    }
  };

  const triggerFetchRoundAnalysis = async (roundForAnalysis: RoundStats) => {
    if (!roundForAnalysis || !user || !db) return;

    setIsFetchingRoundAnalysis(true);
    setAiRoundAnalysis(null);
    setRoundAnalysisError(null);

    let puttingSummary = '';
    if (!roundForAnalysis.notApplicable5yards && roundForAnalysis.puttsAttempted5yards) puttingSummary += `5yds: ${roundForAnalysis.puttsMade5yards || 0}/${roundForAnalysis.puttsAttempted5yards}. `;
    if (!roundForAnalysis.notApplicable10yards && roundForAnalysis.puttsAttempted10yards) puttingSummary += `10yds: ${roundForAnalysis.puttsMade10yards || 0}/${roundForAnalysis.puttsAttempted10yards}. `;
    if (!roundForAnalysis.notApplicable20yards && roundForAnalysis.puttsAttempted20yards) puttingSummary += `20yds: ${roundForAnalysis.puttsMade20yards || 0}/${roundForAnalysis.puttsAttempted20yards}. `;
    if (!roundForAnalysis.notApplicable21plusYards && roundForAnalysis.puttsAttempted21plusYards) puttingSummary += `21+yds: ${roundForAnalysis.puttsMade21plusYards || 0}/${roundForAnalysis.puttsAttempted21plusYards}. `;

    const input: UiAnalyzeRoundReflectionInput = {
        roundId: roundForAnalysis.id as string,
        userName: userProfile?.displayName || user.displayName || user.email?.split('@')[0],
        currentHandicap: String(roundForAnalysis.currentHandicap),
        targetHandicap: roundForAnalysis.targetHandicap,
        roundType: String(roundForAnalysis.roundType || 'Casual'),
        holesPlayed: String(roundForAnalysis.holesPlayed),
        grossScore: String(roundForAnalysis.grossScore),
        coursePar: String(roundForAnalysis.coursePar),
        scoreToPar: String(roundForAnalysis.scoreToPar),
        fairwaysInRegulation: String(roundForAnalysis.fairwaysInRegulation),
        greensInRegulation: String(roundForAnalysis.greensInRegulation),
        puttsTotal: String(roundForAnalysis.puttsTotal),
        threePuttsOrMore: String(roundForAnalysis.threePuttsOrMore || 0),
        puttingSummary: puttingSummary || 'Not specified',
        courseName: String(roundForAnalysis.courseName),
        city: roundForAnalysis.city,
        country: roundForAnalysis.country,
        roundDate: roundForAnalysis.roundDate,
        teePlayedOff: String(roundForAnalysis.teePlayedOff),
        generalObservations: String(roundForAnalysis.generalObservations || 'None provided'),
        upAndDown: String(roundForAnalysis.upAndDown || ''),
        sandSavesAttempted: String(roundForAnalysis.sandSavesAttempted || ''),
        sandSavesMade: String(roundForAnalysis.sandSavesMade || ''),
        selectedGoals: roundForAnalysis.selectedGoals || [],
        availableDrills: drills.map(d => ({ id: d.id, name: d.name, category: d.category, description: d.description })),
        drillCompletionTarget: drillCompletionTarget || 3,
    };

    try {
      const result: AnalyzeRoundReflectionOutput = await analyzeRoundReflection(input);
      
      setAiRoundAnalysis(result.reflection);
      
      const batch = writeBatch(db);

      // Log the main reflection to the journal
      const aiReflectionEntry: Omit<JournalEntry, 'id'> = {
          roundId: result.roundId,
          notes: `Coach's response to round on ${new Date(roundForAnalysis.roundDate).toLocaleDateString()} at ${roundForAnalysis.courseName}:\n${result.reflection}`,
          date: new Date().toISOString(), // Use current timestamp
          drillName: "Coach's response and advice"
      };
      const journalDocRef = doc(collection(db, 'users', user.uid, 'journal'));
      batch.set(journalDocRef, aiReflectionEntry);
      
      // If new drills are prescribed, add them to the practice plan
      if (result.recommendedDrills && result.recommendedDrills.length > 0) {
        result.recommendedDrills.forEach(rec => {
          const newPlanItem: Omit<PracticePlanItem, 'id'> = {
              drillId: rec.drillId, score: '', notes: '', completed: false,
              dateAdded: new Date().toISOString(), timeTaken: 0, sessionId: null,
          };
          const planDocRef = doc(collection(db, 'users', user.uid, 'practicePlan'));
          batch.set(planDocRef, newPlanItem);
        });
      }

      await batch.commit();

      // Refresh local state after all DB operations are successful
      const planSnapshot = await getDocs(query(collection(db, 'users', user.uid, 'practicePlan'), orderBy('dateAdded', 'asc')));
      setPracticePlan(planSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as PracticePlanItem[]);

      const journalSnapshot = await getDocs(query(collection(db, 'users', user.uid, 'journal'), orderBy('date', 'desc')));
      setJournalEntries(journalSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as JournalEntry[]);

      if (result.recommendedDrills && result.recommendedDrills.length > 0) {
        toast({ title: "Drills Prescribed!", description: `${result.recommendedDrills.length} new drills have been added to your Agenda.` });
      }

       // Proactive Coach Check-in Trigger on round submission
      if (userProfile) {
        const updatedRounds = [roundForAnalysis, ...rounds];
        const updatedJournal = [
            {... (aiReflectionEntry as Omit<JournalEntry, 'id'>), id: 'temp-id'},
            ...journalEntries
        ];
        triggerFetchCoachCheckIn(true, updatedRounds, updatedJournal, practicePlan, userProfile);
      }


    } catch (error) {
      console.error("Error fetching round analysis:", error);
      setRoundAnalysisError("Sorry, couldn't generate the Coach's analysis right now.");
    } finally {
      setIsFetchingRoundAnalysis(false);
    }
  };

  const handleFetchDrillClarifyingQuestions = async (itemPlanIndex: number) => {
    const planItem = practicePlan[itemPlanIndex];
    const drillDetails = drills.find(d => d.id === planItem.drillId);
    if (!planItem || !drillDetails || !planItem.notes.trim()) {
        toast({ title: "Observation Needed", description: "Please write a few thoughts about the drill first.", variant: "destructive" });
        return;
    }

    setActiveDrillReflection({ planItemIndex: itemPlanIndex, drillId: planItem.drillId });
    setIsFetchingDrillQuestions(true);
    setDrillClarifyingQuestions([]);

    try {
        const pastRoundObservations = rounds.map(r => r.generalObservations).filter(Boolean);
        const pastDrillNotes = journalEntries
            .filter(j => j.drillName !== 'User Round Reflection' && j.drillName !== "Coach's response and advice" && j.drillName !== "Check in with Coach")
            .map(j => `On '${j.drillName}': ${j.notes}`);

        const input: DrillClarifyingQuestionsInput = {
            drillName: drillDetails.name,
            drillCategory: drillDetails.category,
            userNotes: planItem.notes,
            pastRoundObservations,
            pastDrillNotes,
        };

        const result = await getDrillClarifyingQuestions(input);
        
        setDrillClarifyingQuestions(result.questions);

    } catch (error) {
        console.error("Error fetching drill clarifying questions:", error);
        toast({ title: "Coach Error", description: "Couldn't get clarifying questions. You can still complete the drill.", variant: "destructive" });
        setActiveDrillReflection({ planItemIndex: null, drillId: null });
    } finally {
        setIsFetchingDrillQuestions(false);
    }
  };

  const triggerFetchCoachCheckIn = async (isProactive = false, loadedRounds?: RoundStats[], loadedJournal?: JournalEntry[], loadedPlan?: PracticePlanItem[], loadedProfile?: UserProfile) => {
    const dataRounds = loadedRounds || rounds;
    const dataJournal = loadedJournal || journalEntries;
    const dataPlan = loadedPlan || practicePlan;
    const dataProfile = loadedProfile || userProfile;

    if (!user || dataRounds.length === 0 || !db || !dataProfile) return;
    
    if (!isProactive) {
        setShowCoachDialog(false);
        setIsFetchingCoachCheckIn(true);
        setCoachCheckIn(null);
    }
    setCoachCheckInError(null);

    try {
        const input: CoachCheckInInput = {
            userName: dataProfile.displayName || user.displayName || user.email?.split('@')[0],
            allRounds: dataRounds
                .filter(r => r.roundType !== 'Indoor')
                .map(r => ({
                    roundDate: r.roundDate,
                    scoreToPar: r.scoreToPar,
                    fairwaysInRegulation: r.fairwaysInRegulation,
                    greensInRegulation: r.greensInRegulation,
                    puttsTotal: r.puttsTotal,
                    roundType: r.roundType, 
            })),
            allJournalEntries: dataJournal.map(j => ({
                date: j.date,
                drillName: j.drillName,
                notes: j.notes,
            })),
            pendingDrills: dataPlan
                .filter(p => !p.completed)
                .map(p => {
                    const drillDetail = drills.find(d => d.id === p.drillId);
                    return {
                        name: drillDetail?.name || 'Unknown Drill',
                        category: drillDetail?.category || 'Unknown',
                    };
                }),
            isProactive: isProactive,
        };
        
        const result = await getCoachCheckIn(input);
        const checkInMessage = result.checkInMessage;

        if (isProactive) {
            // For proactive checks, store the message to be shown on next app open
            localStorage.setItem(PENDING_COACH_CHECK_IN_KEY, checkInMessage);
        } else {
            // For manual requests, show it immediately
            setCoachCheckIn(checkInMessage);
             // And log it to the journal
            const coachCheckInEntry: Omit<JournalEntry, 'id'> = {
                notes: checkInMessage,
                date: new Date().toISOString(),
                drillName: "Check in with Coach",
                roundId: dataRounds[0]?.id,
            };
            const docRef = await addDoc(collection(db, 'users', user.uid, 'journal'), coachCheckInEntry);
            setJournalEntries(prev => [...prev, { ...coachCheckInEntry, id: docRef.id }].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }

    } catch (error) {
      console.error("Error fetching coach check-in:", error);
      if (!isProactive) {
        setCoachCheckInError("Sorry, the Coach couldn't generate a check-in right now. Please try again later.");
      }
    } finally {
        if (!isProactive) {
          setIsFetchingCoachCheckIn(false);
        }
    }
  };
  
  const triggerFetchPreRoundAdvice = async () => {
    if (!user || !db) return;
  
    if (!preRoundConfidence || !preRoundWorries || !preRoundCourseName || !preRoundCity || !preRoundCountry || !preRoundPlayDate) {
      toast({ title: "All Fields Required", description: "Please fill out all fields to get your briefing.", variant: "destructive" });
      return;
    }
  
    setIsFetchingPreRoundAdvice(true);
    setPreRoundAdvice(null);
    setPreRoundAdviceError(null);
      
    try {
      const input: PreRoundFocusInput = {
        userName: userProfile?.displayName || user.displayName || user.email?.split('@')[0],
        confidence: preRoundConfidence,
        worries: preRoundWorries,
        courseName: preRoundCourseName,
        city: preRoundCity,
        country: preRoundCountry,
        playDate: format(preRoundPlayDate, 'yyyy-MM-dd'),
        userHandicap: userProfile?.handicap,
        identifiedAreasOfPotential: identifiedAreasOfPotential.map(a => a.tag),
        allRounds: rounds.map(r => ({
          roundDate: r.roundDate,
          scoreToPar: r.scoreToPar,
          fairwaysInRegulation: r.fairwaysInRegulation,
          greensInRegulation: r.greensInRegulation,
          puttsTotal: r.puttsTotal,
          generalObservations: r.generalObservations,
          courseName: r.courseName,
          roundType: r.roundType, // Pass roundType to AI
        })),
        allJournalEntries: journalEntries.map(j => ({
          date: j.date,
          drillName: j.drillName,
          notes: j.notes,
        })),
      };
  
      const result = await getPreRoundFocus(input);
      setPreRoundAdvice(result);
      setCurrentPage('dashboard'); // Return to dashboard to show result
  
    } catch (error: any) {
      console.error("Error fetching pre-round advice:", error);
      const errorMessage = error.message || "Sorry, the Coach couldn't generate advice right now. Please try again later.";
      setPreRoundAdviceError(errorMessage);
      toast({ title: "Briefing Error", description: errorMessage, variant: "destructive" });
      setCurrentPage('dashboard'); // Return to dashboard even on error
    } finally {
      setIsFetchingPreRoundAdvice(false);
      setPreRoundConfidence('');
      setPreRoundWorries('');
      setPreRoundCourseName('');
      setPreRoundCity('');
      setPreRoundCountry('United Kingdom');
      setPreRoundPlayDate(new Date());
    }
  };

  const handleDeleteJournalEntry = async () => {
    if (!user || !entryToDelete || !entryToDelete.id || !db) return;
    const entryId = entryToDelete.id;
    try {
        await deleteDoc(doc(db, 'users', user.uid, 'journal', entryId));
        setJournalEntries(prev => prev.filter(entry => entry.id !== entryId));
        toast({ title: "Success", description: "Journal entry deleted." });
    } catch (error) {
        console.error("Failed to delete journal entry:", error);
        toast({ title: "Error", description: "Could not delete journal entry.", variant: "destructive" });
    } finally {
        setEntryToDelete(null);
    }
  };

    const handleUpdateProfile = async () => {
        if (!user || !db) return;
        setIsSavingProfile(true);

        try {
            const userDocRef = doc(db, 'users', user.uid);
            const updatedData: Partial<UserProfile> = {
                displayName: profileDisplayName,
                handicap: profileCurrentHandicap,
                targetHandicap: profileTargetHandicap,
                primaryGoal: profilePrimaryGoal,
                handedness: profileHandedness,
                strengths: profileStrengths,
                weaknesses: profileWeaknesses,
                driverDistance: profileDriverDistance,
                sevenIronDistance: profile7IronDistance,
                pitchingWedgeDistance: profilePWDistance,
                practiceHoursPerWeek: profilePracticeHours,
                practiceFacilities: profileFacilities,
                profilePictureUrl: profilePictureUrl,
                homeClub: profileHomeClub,
                bagSetup: {
                    driver: profileBagDriver,
                    woods: profileBagWoods,
                    hybrids: profileBagHybrids,
                    irons: profileBagIrons,
                    wedges: profileBagWedges,
                    putter: profileBagPutter,
                }
            };

            await setDoc(userDocRef, updatedData, { merge: true });

            const updatedProfile = { ...(userProfile || { uid: user.uid, email: user.email }), ...updatedData } as UserProfile;
            
            setUserProfile(updatedProfile);
            setInitialProfileState(updatedProfile);
            setIsProfileChanged(false);
            
            const preferencesToSave = {
                currentHandicap: updatedProfile.handicap,
                targetHandicap: updatedProfile.targetHandicap,
            };
            const existingPrefs = JSON.parse(localStorage.getItem(ROUND_ESSENTIALS_PREFERENCES_KEY) || '{}');
            localStorage.setItem(ROUND_ESSENTIALS_PREFERENCES_KEY, JSON.stringify({ ...existingPrefs, ...preferencesToSave }));


            toast({ title: "Profile Updated", description: "Your changes have been saved." });

        } catch (error) {
            console.error("Error updating profile:", error);
            toast({ title: "Update Failed", description: "Could not save your profile changes. Please try again.", variant: "destructive" });
        } finally {
            setIsSavingProfile(false);
        }
    };
    
    const handleFacilityChange = (facility: string, checked: boolean) => {
        setProfileFacilities(prev => {
            if (checked) {
                return [...prev, facility];
            } else {
                return prev.filter(f => f !== facility);
            }
        });
    };
    const practiceFacilitiesOptions = ["Driving Range", "Putting Green", "Chipping Area", "Home Simulator"];


  const handleSetPracticePeriod = async () => {
    if (!user || !db || !practicePeriodStartDate || !practicePeriodEndDate) {
        toast({ title: "Dates Required", description: "Please select both a start and end date.", variant: "destructive" });
        return;
    }
    if (practicePeriodEndDate < practicePeriodStartDate) {
        toast({ title: "Invalid Dates", description: "End date cannot be before the start date.", variant: "destructive" });
        return;
    }

    setIsSavingPracticePeriod(true);
    try {
        const userDocRef = doc(db, 'users', user.uid);
        const dataToUpdate = {
            practicePeriodStartDate: practicePeriodStartDate.toISOString(),
            practicePeriodEndDate: practicePeriodEndDate.toISOString(),
        };
        await setDoc(userDocRef, dataToUpdate, { merge: true });
        
        setUserProfile(prev => prev ? { ...prev, ...dataToUpdate } : null);

        toast({ title: "Practice Period Set", description: "Your practice progress will now be tracked for this period." });
    } catch (error) {
        console.error("Failed to set practice period:", error);
        toast({ title: "Save Error", description: "Could not save your practice period dates.", variant: "destructive" });
    } finally {
        setIsSavingPracticePeriod(false);
    }
  };


  const completedDrillsInPeriod = React.useMemo(() => {
    if (!practicePeriodStartDate || !practicePeriodEndDate) {
        return 0;
    }
    const start = startOfDay(practicePeriodStartDate).getTime();
    const end = startOfDay(practicePeriodEndDate).getTime() + (24 * 60 * 60 * 1000 - 1); // End of day

    return practicePlan.filter(item => {
        if (!item.completed || !item.dateCompleted) {
            return false;
        }
        const completedTime = parseISO(item.dateCompleted).getTime();
        return completedTime >= start && completedTime <= end;
    }).length;

  }, [practicePlan, practicePeriodStartDate, practicePeriodEndDate]);


  const practiceProgressPercentage = drillCompletionTarget > 0 ? Math.min(100, (completedDrillsInPeriod / drillCompletionTarget) * 100) : 0;

  const totalPracticeDrillsLogged = completedDrillHistory.reduce((sum, entry) => sum + (entry.recurrenceScore || 0), 0);

  const uniqueDrillsWithReflectionsCount = React.useMemo(() => {
    const drillJournalEntries = journalEntries.filter(entry =>
        entry.drillName !== 'User Round Reflection' &&
        entry.drillName !== "Coach's response and advice" &&
        entry.drillName !== "Check in with Coach" &&
        entry.drillName !== "Pre-round Advice"
    );
    const uniqueDrillNames = new Set(drillJournalEntries.map(entry => entry.drillName));
    return uniqueDrillNames.size;
  }, [journalEntries]);



  const scoreToParFormatter = (value: number) => {
    if (value === null || value === undefined) return '';
    if (value > 0) return `+${value}`;
    if (value === 0) return 'E';
    return String(value);
  };


  const calculateAverage = (
    data: any[], 
    dataKey: string, 
    tickFormatter?: (value: any) => string, 
    unit: string = ""
  ) => {
    if (!data || data.length === 0) return null;
  
    const validValues = data.map(d => d[dataKey]).filter(v => v !== null && v !== undefined && !isNaN(v));
    if (validValues.length < 2) return null; 
    
    let avg = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
    
    if (dataKey === 'scoreToPar') {
      avg = parseFloat(avg.toFixed(1));
    }
    
    if (tickFormatter) {
      return tickFormatter(avg);
    }
    
    return `${avg.toFixed(1)}${unit}`;
  };

  const scoreToParAvg = calculateAverage(chartData, 'scoreToPar', scoreToParFormatter);
  const firAvg = calculateAverage(chartData, 'fairwaysInRegulation', undefined, '%');
  const girAvg = calculateAverage(chartData, 'greensInRegulation', undefined, '%');
  const puttsAvg = calculateAverage(chartData, 'puttsTotal');
  
  const handicapChange = React.useMemo(() => {
    const validHandicapRounds = chartData.filter(d => d.handicap !== null && d.handicap !== undefined);
    
    if (validHandicapRounds.length < 2) {
        return null;
    }

    const oldestHandicap = validHandicapRounds[0].handicap;
    const newestHandicap = validHandicapRounds[validHandicapRounds.length - 1].handicap;

    if (oldestHandicap === null || newestHandicap === null) {
        return null;
    }
    
    const change = newestHandicap - oldestHandicap;

    if (change === 0) {
        return "No change";
    }

    const formattedChange = change.toFixed(1);

    if (change > 0) {
      return `+${formattedChange}`;
    }
    
    return formattedChange;
  }, [chartData]);
  
  const parAverages = React.useMemo(() => {
    const parScores = { 3: [] as number[], 4: [] as number[], 5: [] as number[] };

    rounds.forEach(round => {
        if (round.holeScores) {
            round.holeScores.forEach(hole => {
                const par = hole.par;
                if (par === 3 || par === 4 || par === 5) {
                    parScores[par].push(hole.score);
                }
            });
        }
    });

    const calculateAvg = (scores: number[]) => {
        if (scores.length === 0) return 'N/A';
        const sum = scores.reduce((a, b) => a + b, 0);
        return (sum / scores.length).toFixed(2);
    };
    
    const getBenchmark = (parType: 'par3' | 'par4' | 'par5') => {
        const targetHcpStr = userProfile?.targetHandicap;
        if (!targetHcpStr) return { benchmark: null, handicap: null };

        const targetHcpKey = Math.round(parseFloat(targetHcpStr)).toString();
        const benchmarkData = parBenchmarks[targetHcpKey];

        if (!benchmarkData) return { benchmark: null, handicap: null };
        
        return { benchmark: benchmarkData[parType][1], handicap: targetHcpKey };
    };

    const avgPar3 = calculateAvg(parScores[3]);
    const avgPar4 = calculateAvg(parScores[4]);
    const avgPar5 = calculateAvg(parScores[5]);
    
    const { benchmark: benchPar3, handicap: hcpPar3 } = getBenchmark('par3');
    const { benchmark: benchPar4, handicap: hcpPar4 } = getBenchmark('par4');
    const { benchmark: benchPar5, handicap: hcpPar5 } = getBenchmark('par5');

    return {
        par3: {
            avg: avgPar3,
            benchmark: benchPar3,
            handicap: hcpPar3,
            color: avgPar3 !== 'N/A' && benchPar3 ? (parseFloat(avgPar3) <= benchPar3 ? 'text-success' : 'text-destructive') : 'text-foreground'
        },
        par4: {
            avg: avgPar4,
            benchmark: benchPar4,
            handicap: hcpPar4,
            color: avgPar4 !== 'N/A' && benchPar4 ? (parseFloat(avgPar4) <= benchPar4 ? 'text-success' : 'text-destructive') : 'text-foreground'
        },
        par5: {
            avg: avgPar5,
            benchmark: benchPar5,
            handicap: hcpPar5,
            color: avgPar5 !== 'N/A' && benchPar5 ? (parseFloat(avgPar5) <= benchPar5 ? 'text-success' : 'text-destructive') : 'text-foreground'
        },
    };
  }, [rounds, userProfile]);

  const mainStatBenchmarks = React.useMemo(() => {
    const targetHcpStr = userProfile?.targetHandicap;
    if (!targetHcpStr) return { fir: null, gir: null, puttsPerRound: null, handicap: null };

    const targetHcpKey = Math.round(parseFloat(targetHcpStr)).toString();
    const benchmarkData = statBenchmarks[targetHcpKey];

    if (!benchmarkData) return { fir: null, gir: null, puttsPerRound: null, handicap: null };
    
    return { ...benchmarkData, handicap: targetHcpKey };
  }, [userProfile]);

  const achievementData = React.useMemo(() => ({
    rounds,
    practicePlan,
    journalEntries,
    completedDrillHistory,
    favouriteDrillIds,
    profile: userProfile,
  }), [rounds, practicePlan, journalEntries, completedDrillHistory, favouriteDrillIds, userProfile]);
  
  React.useEffect(() => {
    const storedSeen = typeof window !== 'undefined' ? localStorage.getItem(SEEN_ACHIEVEMENTS_KEY) : null;
    if (storedSeen) {
      try {
        const parsedData = JSON.parse(storedSeen);
        if (Array.isArray(parsedData)) {
          setSeenAchievements(new Set(parsedData));
        }
      } catch (e) {
        console.error("Failed to parse seen achievements from localStorage", e);
      }
    }
  }, []);
  
  const markNewAchievementsAsSeen = React.useCallback(() => {
    setSeenAchievements(currentSeen => {
      const unlockedIds = initialAchievements
        .filter(ach => ach.isUnlocked(achievementData))
        .map(ach => ach.id);
      
      const newSeenSet = new Set([...Array.from(currentSeen), ...unlockedIds]);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(SEEN_ACHIEVEMENTS_KEY, JSON.stringify(Array.from(newSeenSet)));
      }
      return newSeenSet;
    });
  }, [achievementData]);

  const unlockedAchievements = React.useMemo(() => {
    return initialAchievements.filter(ach => ach.isUnlocked(achievementData));
  }, [achievementData]);
  
  const newlyUnlockedAchievementIds = React.useMemo(() => {
    const unlockedIds = unlockedAchievements.map(ach => ach.id);
    const currentSeen = new Set(Array.from(seenAchievements));
    return unlockedIds.filter(id => !currentSeen.has(id));
  }, [unlockedAchievements, seenAchievements]);
  
  
  React.useEffect(() => {
      if (_currentPage === 'achievements') {
          markNewAchievementsAsSeen();
      }
  }, [_currentPage, markNewAchievementsAsSeen]);


  const unlockedAchievementsCount = unlockedAchievements.length;

  const handleOnboardingNext = () => {
    const nextStep = onboardingStep + 1;
    if (nextStep === 2) {
      setCurrentPage('drills');
    }
    if (nextStep === 4) {
      setCurrentPage('journal');
    }
    setOnboardingStep(nextStep);
  };

  const handleOnboardingEnd = () => {
    setOnboardingStep(0);
    localStorage.setItem(ONBOARDING_TOUR_COMPLETED_KEY, 'true');
    setIsTourCompleted(true);
  };

  const handleGoToProfileFromTour = () => {
    handleOnboardingEnd();
    setCurrentPage('profile');
  };

  const handleHoleDataChange = (holeIndex: number, field: keyof HoleScore, value: any) => {
    setHoleScores(prev => {
      const newScores = [...prev];
      const holeToUpdate = { ...newScores[holeIndex] };
      (holeToUpdate as any)[field] = value;
  
      if (field === 'par') {
        holeToUpdate.score = value;
      }
      
      if (field === 'gir' && value === true) {
        // Handled by button click
      } else if (field === 'gir' && value === false) {
        // Also handled
      }
  
      newScores[holeIndex] = holeToUpdate;
      return newScores;
    });
  };

  const handleHoleNavigation = (newHole: number) => {
    setHoleTransition({ hole: newHole, active: true });
    setCurrentHole(newHole);
    setTimeout(() => {
      setHoleTransition(prev => ({ ...prev, active: false }));
    }, 1200);
  };

  const calculateAndTransitionToReview = () => {
    const holesToProcess = parseInt(currentRound.holesPlayed);
    const relevantHoles = holeScores.slice(0, holesToProcess);

    const totalPar = relevantHoles.reduce((sum, h) => sum + h.par, 0);
    const totalScore = relevantHoles.reduce((sum, h) => sum + h.score, 0);
    const totalPutts = relevantHoles.reduce((sum, h) => sum + h.putts, 0);
    const totalFairways = relevantHoles.filter(h => h.par > 3).length;
    const fairwaysHit = relevantHoles.filter(h => h.par > 3 && h.teeShot === 'Fairway').length;
    const fairwaysInRegulation = totalFairways > 0 ? ((fairwaysHit / totalFairways) * 100).toFixed(1) : '0';
    const totalGIR = relevantHoles.filter(h => h.gir).length;
    const greensInRegulation = ((totalGIR / holesToProcess) * 100).toFixed(1);
    
    const penalties = relevantHoles.reduce((sum, h) => sum + h.penaltyStrokes, 0);
    
    const upAndDownOpportunities = relevantHoles.filter(h => !h.gir).length;
    const upAndDownSuccesses = relevantHoles.filter(h => !h.gir && h.upAndDown).length;
    const upAndDownPercentage = upAndDownOpportunities > 0 ? ((upAndDownSuccesses / upAndDownOpportunities) * 100).toFixed(1) : '0';

    const sandSavesAttempted = relevantHoles.reduce((sum, h) => sum + (h.sandSavesAttempted || 0), 0);
    const sandSavesMade = relevantHoles.reduce((sum, h) => sum + (h.sandSavesMade || 0), 0);
    const threePuttsOrMore = relevantHoles.filter(h => h.putts >= 3).length;
    
    const scoreToParValue = totalScore - totalParForCompleted;
    
    const drivingDistances = relevantHoles
        .filter(h => h.par > 3 && h.drivingDistance && h.drivingDistance > 0)
        .map(h => h.drivingDistance as number);
    const avgDrivingDistance = drivingDistances.length > 0
        ? (drivingDistances.reduce((sum, d) => sum + d, 0) / drivingDistances.length).toFixed(0)
        : '0';

    const roundData: Partial<RoundStats> = {
      grossScore: String(totalScore),
      coursePar: String(totalPar),
      scoreToPar: scoreToParValue > 0 ? `+${scoreToParValue}` : scoreToParValue === 0 ? 'E' : String(scoreToParValue),
      fairwaysInRegulation,
      greensInRegulation,
      puttsTotal: String(totalPutts),
      threePuttsOrMore: String(threePuttsOrMore),
      drivingPenalties: String(penalties),
      upAndDown: upAndDownPercentage,
      sandSavesAttempted: String(sandSavesAttempted),
      sandSavesMade: String(sandSavesMade),
      drivingDistance: avgDrivingDistance,
      holeScores: relevantHoles,
    };
    
    setCurrentRound(prev => ({ ...prev, ...roundData }));

    // Save scorecard to shared collection if it's a manual entry
    const isManualEntry = relevantHoles.some(h => h.par !== 4 || h.yardage !== 0);
    if (user && db && isManualEntry) {
      const scorecardId = `${currentRound.courseName}_${currentRound.teePlayedOff}`.toLowerCase().replace(/\s+/g, '_');
      const scorecardRef = doc(db, "courses", scorecardId);
      const scorecardData: Omit<Scorecard, 'id'> = {
        courseName: currentRound.courseName,
        teeColor: currentRound.teePlayedOff,
        holeData: relevantHoles.map(({ hole, par, yardage }) => ({ hole, par, yardage })),
      };
      setDoc(scorecardRef, { ...scorecardData, lastUpdated: Timestamp.now(), createdBy: user.uid }, { merge: true });
    }
    
    setCurrentPage('liveScorecardReview');
  };

  const checkForExistingScorecard = async () => {
    if (!db || !currentRound.courseName || !currentRound.teePlayedOff) return;
    setIsCheckingForScorecard(true);
    setFoundScorecard(null);
    try {
        const scorecardId = `${currentRound.courseName}_${currentRound.teePlayedOff}`.toLowerCase().replace(/\s+/g, '_');
        const scorecardRef = doc(db, "courses", scorecardId);
        const docSnap = await getDoc(scorecardRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as Omit<Scorecard, 'id'>;
            setFoundScorecard({ id: docSnap.id, ...data });
            setShowScorecardDialog(true);
        } else {
            startManualScorecardEntry();
        }
    } catch (error) {
      console.error("Could not check for existing scorecards. Please enter manually.", error);
      startManualScorecardEntry(); 
    } finally {
        setIsCheckingForScorecard(false);
    }
  };

  const startManualScorecardEntry = () => {
    setIsLiveRoundActive(true); 
    setHoleScores(initialHoleScores); // Reset to default
    setCurrentHole(1);
  };
  
  const useFoundScorecard = () => {
      if (!foundScorecard) return;
      const newHoleScores = initialHoleScores.map((initialHole, index) => {
        const foundData = foundScorecard.holeData.find(h => h.hole === index + 1);
        return foundData ? { ...initialHole, par: foundData.par, yardage: foundData.yardage, score: foundData.par } : initialHole;
      });
      setHoleScores(newHoleScores);
      setShowScorecardDialog(false);
      setIsLiveRoundActive(true);
      setCurrentHole(1);
  };

  const handleCreateNewSession = async () => {
    if (!user || !db || !newSessionName.trim()) {
      toast({ title: "Session name required", variant: "destructive" });
      return;
    }
    setIsCreatingSession(true);
    try {
      const newSession: Omit<PracticeSession, 'id'> = {
        name: newSessionName,
        createdAt: Timestamp.now(),
        isCompleted: false,
        sessionDate: newSessionDate ? newSessionDate.toISOString() : undefined,
      };
      const docRef = await addDoc(collection(db, 'users', user.uid, 'practiceSessions'), newSession);
      const createdSession = { ...newSession, id: docRef.id };
      setPracticeSessions(prev => [...prev, createdSession].sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis()));

      if (drillToAssign && drillToAssign.id) {
        await updateDoc(doc(db, 'users', user.uid, 'practicePlan', drillToAssign.id), { sessionId: createdSession.id });
        setPracticePlan(prev => prev.map(item => item.id === drillToAssign.id ? { ...item, sessionId: createdSession.id } : item));
        toast({ title: "Session Created", description: `"${drillDetails?.name}" added to "${createdSession.name}".` });
      } else {
        toast({ title: "Session Created", description: `Successfully created "${createdSession.name}".` });
      }
      
      setNewSessionName('');
      setNewSessionDate(undefined);
      setShowAssignSessionDialog(false);
      setDrillToAssign(null);
    } catch (error) {
      console.error("Error creating practice session:", error);
      toast({ title: "Error", description: "Could not create session.", variant: "destructive" });
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleAssignDrillToSession = async (sessionId: string) => {
    if (!user || !db || !drillToAssign || !drillToAssign.id) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'practicePlan', drillToAssign.id), { sessionId });
      setPracticePlan(prev => prev.map(item => item.id === drillToAssign.id ? { ...item, sessionId } : item));
      
      const session = practiceSessions.find(s => s.id === sessionId);
      toast({ title: "Drill Assigned", description: `"${drillDetails?.name}" added to "${session?.name}".` });

      setShowAssignSessionDialog(false);
      setDrillToAssign(null);
    } catch (error) {
      console.error("Error assigning drill to session:", error);
      toast({ title: "Error", description: "Could not assign drill.", variant: "destructive" });
    }
  };
  
  const handleDeleteSession = async () => {
    if (!user || !db || !sessionToDelete) return;
    const { id: sessionId } = sessionToDelete;

    try {
        const batch = writeBatch(db);

        const sessionRef = doc(db, 'users', user.uid, 'practiceSessions', sessionId);
        batch.delete(sessionRef);

        const drillsQuery = query(
            collection(db, 'users', user.uid, 'practicePlan'),
            where('sessionId', '==', sessionId)
        );
        const drillsSnapshot = await getDocs(drillsQuery);
        
        drillsSnapshot.forEach(drillDoc => {
            batch.update(drillDoc.ref, { sessionId: null });
        });

        await batch.commit();

        setPracticeSessions(prev => prev.filter(s => s.id !== sessionId));
        setPracticePlan(prev =>
            prev.map(p => {
                if (p.sessionId === sessionId) {
                    return { ...p, sessionId: null };
                }
                return p;
            })
        );

        toast({
            title: "Session Deleted",
            description: `"${sessionToDelete.name}" was removed. Its drills are now in Unassigned.`,
        });
    } catch (error) {
        console.error("Error deleting session:", error);
        toast({ title: "Error", description: "Could not delete the session.", variant: "destructive" });
    } finally {
        setSessionToDelete(null);
    }
  };

  const handleToggleGoal = (goal: ProposedGoal, isChecked: boolean) => {
    setSelectedGoals(prev => 
      isChecked
        ? [...prev, goal]
        : prev.filter(g => g.description !== goal.description)
    );
  };
  
  const handleLockInGoals = async () => {
    if (!user || !db) return;

    setCurrentRound(prev => ({...prev, selectedGoals }));
    const advice = preRoundAdvice;
    if (!advice) return;
    
    setPreRoundAdvice(prev => prev ? {...prev, lockedInGoals: selectedGoals} : null);
    
    let journalNotes = `Pre-Round Briefing for ${preRoundCourseName}:\n\nMain Focus: ${advice.mainFocus}\n\nStat Insight: "${advice.statInsight}"\n\nCheat Sheet:\n- ${advice.cheatSheet.join('\n- ')}\n\nTactical Strategy: ${advice.tacticalStrategy}`;

    if (selectedGoals.length > 0) {
      const goalsText = selectedGoals.map(g => `- ${g.description} (${g.type})`).join('\n');
      journalNotes += `\n\n**Locked-In Goals:**\n${goalsText}`;
    }

    const preRoundAdviceEntry: Omit<JournalEntry, 'id'> = {
      notes: journalNotes,
      date: new Date().toISOString(),
      drillName: "Pre-round Advice",
      roundId: rounds.length > 0 ? rounds[0].id : undefined,
    };

    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'journal'), preRoundAdviceEntry);
      setJournalEntries(prev => [...prev, { ...preRoundAdviceEntry, id: docRef.id }]);
      toast({ title: "Goals Locked In!", description: "Your focus points for the round are set. Good luck!" });
    } catch (error) {
      console.error("Error saving pre-round advice to journal:", error);
      toast({ title: "Save Error", description: "Could not save your pre-round briefing to the journal.", variant: "destructive" });
    }
  };

  const openChart = (statKey: string) => {
    setExpandedChart(statKey);
    // No longer fetching on open, data should be pre-loaded
  };


  const drillDetails = drillToAssign ? drills.find(d => d.id === drillToAssign.drillId) : null;


  if (isDataLoading) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  const loginCount = 0; // Replace with actual logic if needed.
  const libraryUnlocked = uniqueDrillsWithReflectionsCount >= 10;
  const showLoginPrompt = !hasLoggedRounds && loginCount >= 3 && !loginPromptDismissed;
  
  const scoreToParChartData = chartData.map(d => d.isNineHole ? { ...d, scoreToPar: null } : d);
  const puttsChartData = chartData.map(d => d.isNineHole ? { ...d, puttsTotal: null } : d);

  const audioDrills = drills.filter(d => d.audioUrl);
  const completedMentalGameDrillCount = completedDrillHistory.filter(h => {
    const drill = drills.find(d => d.id === h.drillId);
    return drill?.category === 'Mental Game';
  }).length;
  const unlockedAudioDrillCount = 3 + Math.floor(completedMentalGameDrillCount / 3) * 3;

  let pageContent;
  switch (_currentPage) {
    case 'dashboard': {
      const isPracticeComplete = practiceProgressPercentage >= 100;
      const donutFillColor = isPracticeComplete ? 'hsl(var(--success))' : 'hsl(var(--accent))';
      const donutData = [
          { name: 'Completed', value: practiceProgressPercentage, fill: donutFillColor },
          { name: 'Remaining', value: 100 - practiceProgressPercentage, fill: 'hsl(var(--secondary))' }
      ];
      
      const upcomingSession = practiceSessions
        .filter(s => !s.isCompleted)
        .sort((a,b) => (a.sessionDate || a.createdAt.toMillis()) > (b.sessionDate || b.createdAt.toMillis()) ? 1 : -1)[0];
      const upcomingSessionDrills = upcomingSession 
        ? practicePlan.filter(p => p.sessionId === upcomingSession.id && !p.completed)
        : [];

      pageContent = (
        <CustomCard>
          {!hasLoggedRounds && !showLoginPrompt && (
            <>
              <h2 className="text-5xl font-bold mb-6 text-center font-headline text-foreground">
                Welcome to{' '}
                <span className="relative inline-block">
                  <span
                    className="absolute block -z-10 bg-accent"
                    style={{
                      left: '-0.1em',
                      right: '-0.1em',
                      top: '0.25em',
                      height: '0.5em',
                      transform: 'rotate(-2deg)',
                      borderRadius: '3px 6px 2px 5px',
                    }}
                  ></span>
                  <span className="font-pacifico font-normal relative">Potentially</span>
                </span>
              </h2>
              <p className="mb-4 text-center text-foreground/90">Potential in every shot. Insight in every stat.</p>
              <div className="my-6 p-4 rounded-md text-center bg-card border border-primary">
                  <p className="font-semibold text-foreground">Get Started</p>
                  <p className="text-sm text-foreground/80">Log your first round to unlock your practice drills and begin realising your potential.</p>
                  <Button
                      onClick={() => setCurrentPage('inputRoundChoice', true)}
                      className="mt-3 font-semibold hover:bg-black hover:text-primary"
                      variant="default"
                  >
                      Log First Round
                  </Button>
              </div>
            </>
          )}

          {showLoginPrompt && (
            <InfoMessageCard
              title="Time to Tee Off!"
              message="Welcome back! To unlock the full power of Potentially, log a historic round of golf. This will give your AI coach the data it needs to start building your personalized practice plan."
              actionButtonLabel="Log a Historic Round"
              onActionClick={() => setCurrentPage('inputRoundChoice', true)}
              icon={<FileQuestion size={48} className="text-primary"/>}
              onDismiss={() => setLoginPromptDismissed(true)}
              isDismissible={true}
            />
          )}

          {hasLoggedRounds && (
            <>
              {isFetchingRoundAnalysis && (
                <div className="my-4">
                  <GolfLoadingAnimation />
                </div>
              )}
              {aiRoundAnalysis && !isFetchingRoundAnalysis && (
                <div className="my-4 p-6 rounded-xl text-base text-left bg-custom-ai-text-bg border-2 border-primary shadow-md">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold mb-2 flex items-center text-foreground text-lg">
                        <MessageSquareText size={20} className="mr-2 text-primary"/>
                        Coach's response and advice:
                    </h4>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground"
                        onClick={() => handleStartEditRound(rounds[0])}
                    >
                        <Edit3 size={16} />
                    </Button>
                  </div>
                  <p className="whitespace-pre-wrap text-foreground/90">{aiRoundAnalysis}</p>
                </div>
              )}
              {roundAnalysisError && !isFetchingRoundAnalysis && (
                <p className="text-destructive text-xs mt-2">{roundAnalysisError}</p>
              )}
              
              <div className="my-8 text-center">
                <Button
                    onClick={() => setShowCoachDialog(true)}
                    disabled={isFetchingCoachCheckIn}
                    className="group w-full max-w-sm mx-auto p-2 h-auto flex items-center justify-center bg-primary text-primary-foreground hover:bg-black hover:text-primary transition-all duration-300"
                >
                    <span className="font-pacifico text-4xl text-primary-foreground group-hover:text-primary transition-colors duration-300 mr-4">P</span>
                    <span className="font-semibold text-lg text-primary-foreground group-hover:text-primary transition-colors duration-300">
                        {isFetchingCoachCheckIn ? 'Thinking...' : 'Speak with Coach'}
                    </span>
                </Button>
                {isFetchingCoachCheckIn && (
                  <div className="my-4">
                    <GolfLoadingAnimation />
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2 mt-2 max-w-sm mx-auto">
                  <Button
                    onClick={() => {
                        setActivePracticeTab('sessions');
                        setCurrentPage('practice');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Target className="mr-2" />
                    Start Session
                  </Button>
                  <Button
                    onClick={() => setCurrentPage('inputRoundChoice', true)}
                    variant="outline"
                    className="w-full"
                  >
                    <Flag className="mr-2" />
                    Add Round
                  </Button>
                </div>

                {coachCheckIn && !isFetchingCoachCheckIn && !coachCheckInError ? (
                  <div className="mt-4 p-6 rounded-xl text-base text-left bg-custom-ai-text-bg border-2 border-primary shadow-md">
                    <h4 className="font-semibold mb-2 flex items-center text-foreground text-lg"><span className="font-pacifico text-2xl mr-2">P</span>Coach's Check-in:</h4>
                    <p className="whitespace-pre-wrap text-foreground/90">{coachCheckIn}</p>
                  </div>
                ) : null}
                {coachCheckInError && !isFetchingCoachCheckIn ? (
                    <p className="text-destructive text-xs mt-2">{coachCheckInError}</p>
                ) : null}
                 
                {isFetchingPreRoundAdvice && (
                  <div className="mt-4">
                    <GolfLoadingAnimation />
                  </div>
                )}
                 {preRoundAdvice && !isFetchingPreRoundAdvice && !preRoundAdviceError ? (
                  <div className="mt-4 p-6 rounded-xl text-base text-left bg-custom-ai-text-bg border-2 border-primary shadow-md">
                    <h4 className="font-semibold mb-2 flex items-center text-foreground text-lg"><FileQuestion size={20} className="mr-2 text-primary"/>Pre-round Focus:</h4>
                     <p className="font-bold text-foreground/90">{preRoundAdvice.mainFocus}</p>
                     <p className="text-sm text-foreground/80 my-2 italic">"{preRoundAdvice.statInsight}"</p>
                     <ul className="mt-2 list-disc pl-5 space-y-1 text-foreground/90">
                        {preRoundAdvice.cheatSheet.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                    <p className="mt-2 text-sm text-foreground/90"><span className='font-bold'>Tactical Strategy:</span> {preRoundAdvice.tacticalStrategy}</p>

                    {(preRoundAdvice.lockedInGoals && preRoundAdvice.lockedInGoals.length > 0) ? (
                        <div className="mt-4 pt-4 border-t border-primary/20">
                            <h5 className="font-semibold mb-2 text-foreground">Your Locked-In Goals:</h5>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90">
                                {preRoundAdvice.lockedInGoals.map((goal, index) => <li key={index}>{goal.description} ({goal.type})</li>)}
                            </ul>
                        </div>
                    ) : (
                        preRoundAdvice.proposedGoals && preRoundAdvice.proposedGoals.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-primary/20">
                                <h5 className="font-semibold mb-3 text-foreground">Based on this, let's set a couple of key focus points for your round today. I'd recommend focusing on one outcome and one process goal.</h5>
                                <div className="space-y-3">
                                    {preRoundAdvice.proposedGoals.map((goal, index) => (
                                        <div key={index} className="flex items-center space-x-3 p-3 rounded-md bg-background border border-border">
                                            <Checkbox
                                                id={`goal-${index}`}
                                                onCheckedChange={(checked) => handleToggleGoal(goal, !!checked)}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <label htmlFor={`goal-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                    {goal.description}
                                                </label>
                                                <p className="text-xs text-muted-foreground">{goal.type} Goal</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                 <Button onClick={handleLockInGoals} className="w-full mt-4" disabled={selectedGoals.length === 0}>
                                    Lock in Goals for this Round
                                 </Button>
                            </div>
                        )
                    )}
                  </div>
                ) : null}
                {preRoundAdviceError && !isFetchingPreRoundAdvice ? (
                    <p className="text-destructive text-xs mt-2">{preRoundAdviceError}</p>
                ) : null}
              </div>

               <div className="p-4 mt-0 mb-6 rounded-lg shadow bg-card border border-primary text-center">
                  <h3 className="font-bold text-lg flex items-center justify-center text-foreground"><Goal size={20} className="mr-2 text-foreground"/> Practice Progress</h3>
                  <div className="relative mx-auto my-4" style={{ width: 150, height: 150 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          startAngle={90}
                          endAngle={-270}
                          paddingAngle={0}
                          dataKey="value"
                          stroke="none"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className={cn("text-xl font-semibold text-foreground -mt-2 transition-colors", isPracticeComplete && "text-success")}>
                      {practiceProgressPercentage.toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground mb-6">{completedDrillsInPeriod} of {drillCompletionTarget} drills completed this period.</p>
                  
                  {upcomingSession && upcomingSessionDrills.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-primary/20">
                      <h4 className="font-bold text-lg flex items-center justify-center text-foreground">
                        <CalendarDays size={20} className="mr-2" /> Up Next: {upcomingSession.name}
                      </h4>
                      <ul className="text-sm text-muted-foreground mt-2 mb-4 list-disc list-inside">
                        {upcomingSessionDrills.map(item => {
                          const drill = drills.find(d => d.id === item.drillId);
                          return <li key={item.id}>{drill?.name}</li>
                        })}
                      </ul>
                      <Button onClick={() => { setActivePracticeTab('sessions'); setCurrentPage('practice'); }} variant="success" className="w-full">
                        Start Session
                      </Button>
                    </div>
                  )}

                  <Separator className="my-4" />
                  <h3 className="font-bold text-lg flex items-center justify-center text-foreground"><Goal size={20} className="mr-2 text-foreground"/> Drill Target &amp; Period</h3>
                  <div className="mt-2 flex flex-col items-center">
                      <ShadLabel htmlFor="drillCompletionTarget" className="block text-sm font-medium mb-1 text-center text-foreground">Set Target:</ShadLabel>
                      <Input
                          type="number"
                          id="drillCompletionTarget"
                          value={drillCompletionTarget}
                          onChange={(e) => handleSetDrillCompletionTarget(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-1/2 px-3 py-2 border-primary rounded-md shadow-sm sm:text-sm bg-background text-foreground mx-auto text-center"
                          inputMode="numeric"
                      />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mt-4">
                      <div>
                          <ShadLabel className="text-sm font-medium text-foreground">Start Date</ShadLabel>
                          <Popover open={isPracticePeriodCalendarOpen} onOpenChange={setIsPracticePeriodCalendarOpen}>
                              <PopoverTrigger asChild>
                                  <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal mt-1", !practicePeriodStartDate && "text-muted-foreground")}>
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {practicePeriodStartDate ? format(practicePeriodStartDate, "PPP") : <span>Pick a date</span>}
                                  </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                  <Calendar mode="single" selected={practicePeriodStartDate} onSelect={(date) => { setPracticePeriodStartDate(date); setIsPracticePeriodCalendarOpen(false); }} initialFocus />
                              </PopoverContent>
                          </Popover>
                      </div>
                      <div>
                          <ShadLabel className="text-sm font-medium text-foreground">End Date</ShadLabel>
                          <Popover>
                              <PopoverTrigger asChild>
                                  <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal mt-1", !practicePeriodEndDate && "text-muted-foreground")}>
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {practicePeriodEndDate ? format(practicePeriodEndDate, "PPP") : <span>Pick a date</span>}
                                  </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                  <Calendar mode="single" selected={practicePeriodEndDate} onSelect={(date) => { setPracticePeriodEndDate(date); setIsPracticePeriodCalendarOpen(false); }} initialFocus />
                              </PopoverContent>
                          </Popover>
                      </div>
                  </div>
                  <Button onClick={handleSetPracticePeriod} disabled={isSavingPracticePeriod} className="w-full mt-4">
                      {isSavingPracticePeriod ? <Loader2 className="animate-spin" /> : <><Save size={16} className="mr-2" />Set Practice Period</>}
                  </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6 text-center">
                  <div className="p-4 rounded-lg shadow bg-card border border-primary text-center">
                      <h3 className="font-bold text-lg flex items-center justify-center text-foreground"><BarChartHorizontalBig size={20} className="mr-2 text-foreground"/> Rounds Logged</h3>
                      <p className="text-3xl text-foreground">{rounds.length}</p>
                  </div>
                  <div className="p-4 rounded-lg shadow bg-card border border-primary text-center">
                      <h3 className="font-bold text-lg flex items-center justify-center text-foreground"><CheckCircle size={20} className="mr-2 text-foreground"/> Drills Logged</h3>
                      <p className="text-3xl text-foreground">{totalPracticeDrillsLogged}</p>
                  </div>
                   <div className="p-4 rounded-lg shadow bg-card border border-primary text-center col-span-2 md:col-span-1 relative">
                      {newlyUnlockedAchievementIds.length > 0 && (
                          <div className="absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-full animate-badge-pulse">
                              NEW!
                          </div>
                      )}
                      <h3 className="font-bold text-lg flex items-center justify-center text-foreground"><Trophy size={20} className="mr-2 text-foreground"/> Achievements</h3>
                      <p className="text-3xl mb-1 text-foreground">{unlockedAchievementsCount} <span className="text-lg">/ {initialAchievements.length}</span></p>
                      <Button onClick={() => setCurrentPage('achievements')} variant="link" className="h-auto p-0 text-sm text-black dark:text-foreground">
                          View All
                      </Button>
                  </div>
              </div>

              <h3 className="text-xl font-semibold mb-3 mt-8 text-center font-headline text-foreground">Performance Trends</h3>
               <div className="grid grid-cols-2 gap-4 mb-6">
                
                <div onClick={() => openChart('handicap')} className="p-4 rounded-lg shadow bg-card border border-primary text-center cursor-pointer">
                  <h4 className="text-md font-semibold text-foreground">Handicap Trend</h4>
                  {handicapChange && <p className={cn("text-2xl font-bold", handicapChange.startsWith('-') ? "text-success" : handicapChange.startsWith('+') ? "text-destructive" : "")}>{handicapChange}</p>}
                  {userProfile?.targetHandicap && <p className="text-xs text-muted-foreground mt-1">Target: {userProfile.targetHandicap}</p>}
                </div>

                <div onClick={() => openChart('fairwaysInRegulation')} className="p-4 rounded-lg shadow bg-card border border-primary text-center cursor-pointer">
                  <h4 className="text-md font-semibold text-foreground">FIR %</h4>
                  {firAvg && <p className="text-2xl font-bold">{firAvg}</p>}
                  {mainStatBenchmarks.fir && <p className="text-xs text-muted-foreground">Target: {mainStatBenchmarks.fir}%</p>}
                </div>

                <div onClick={() => openChart('greensInRegulation')} className="p-4 rounded-lg shadow bg-card border border-primary text-center cursor-pointer">
                  <h4 className="text-md font-semibold text-foreground">GIR %</h4>
                  {girAvg && <p className="text-2xl font-bold">{girAvg}</p>}
                  {mainStatBenchmarks.gir && <p className="text-xs text-muted-foreground">Target: {mainStatBenchmarks.gir.toFixed(1)}%</p>}
                </div>

                <div onClick={() => openChart('puttsTotal')} className="p-4 rounded-lg shadow bg-card border border-primary text-center cursor-pointer">
                  <h4 className="text-md font-semibold text-foreground">Putts / Rnd</h4>
                  {puttsAvg && <p className="text-2xl font-bold">{puttsAvg}</p>}
                  {mainStatBenchmarks.puttsPerRound && <p className="text-xs text-muted-foreground">Target: {mainStatBenchmarks.puttsPerRound.toFixed(1)}</p>}
                </div>

                <div onClick={() => openChart('scoreToPar')} className="col-span-2 p-4 rounded-lg shadow bg-card border border-primary text-center cursor-pointer">
                  <h4 className="text-md font-semibold text-foreground">Score to Par Avg (18 holes)</h4>
                  {scoreToParAvg && <p className="text-2xl font-bold">{scoreToParAvg}</p>}
                </div>
              </div>

              <Dialog open={!!expandedChart} onOpenChange={() => setExpandedChart(null)}>
                <DialogContent className="max-w-3xl">
                  {expandedChart && (
                    <>
                      <DialogHeader>
                        <DialogTitle className="text-center text-lg">
                          {
                            {
                              'handicap': 'Handicap Trend',
                              'fairwaysInRegulation': 'Fairways in Regulation (%)',
                              'greensInRegulation': 'Greens in Regulation (%)',
                              'puttsTotal': 'Putts Per Round (18 holes)',
                              'scoreToPar': 'Score to Par (18 holes)',
                            }[expandedChart]
                          }
                        </DialogTitle>
                      </DialogHeader>
                      <div className="my-4">
                        <StatsChart
                          data={expandedChart === 'scoreToPar' ? scoreToParChartData : expandedChart === 'puttsTotal' ? puttsChartData : chartData}
                          originalData={chartData}
                          dataKey={expandedChart}
                          name={{
                            'handicap': 'Handicap',
                            'fairwaysInRegulation': 'Fairways Hit',
                            'greensInRegulation': 'GIR',
                            'puttsTotal': 'Putts',
                            'scoreToPar': 'Score to Par',
                          }[expandedChart]!}
                          unit={expandedChart === 'fairwaysInRegulation' || expandedChart === 'greensInRegulation' ? '%' : ''}
                          color="hsl(var(--success))"
                          yAxisDomain={expandedChart === 'scoreToPar' ? ['dataMin - 1', 'dataMax + 1'] : undefined}
                          tickFormatter={expandedChart === 'scoreToPar' ? scoreToParFormatter : undefined}
                          showAverageLine={true}
                          yAxisLabel={expandedChart}
                        />
                      </div>
                      <div className="p-4 rounded-lg bg-custom-ai-text-bg border border-primary">
                        <h5 className="font-semibold mb-2 flex items-center"><Sparkles size={16} className="mr-2 text-primary"/>Coach's Insight</h5>
                        {!trendAnalysis[expandedChart] ? (
                           <GolfLoadingAnimation />
                        ) : (
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap">{trendAnalysis[expandedChart]}</p>
                        )}
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>


              <h3 className="text-xl font-semibold mb-3 mt-8 text-center font-headline text-foreground">Scoring Averages</h3>
              <CustomCard className="md:col-span-2">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                        <p className="font-bold text-lg">Par 3s</p>
                        <p className={cn("text-2xl font-bold", parAverages.par3.color)}>{parAverages.par3.avg}</p>
                        {parAverages.par3.benchmark && <p className="text-xs text-muted-foreground">Target: {parAverages.par3.benchmark.toFixed(2)}</p>}
                    </div>
                    <div>
                        <p className="font-bold text-lg">Par 4s</p>
                        <p className={cn("text-2xl font-bold", parAverages.par4.color)}>{parAverages.par4.avg}</p>
                        {parAverages.par4.benchmark && <p className="text-xs text-muted-foreground">Target: {parAverages.par4.benchmark.toFixed(2)}</p>}
                    </div>
                    <div>
                        <p className="font-bold text-lg">Par 5s</p>
                        <p className={cn("text-2xl font-bold", parAverages.par5.color)}>{parAverages.par5.avg}</p>
                        {parAverages.par5.benchmark && <p className="text-xs text-muted-foreground">Target: {parAverages.par5.benchmark.toFixed(2)}</p>}
                    </div>
                  </div>
                </CustomCard>
            </>
          )}
        </CustomCard>
      );
      break;
    }
    case 'preRoundCheckIn': {
      pageContent = (
        <CustomCard>
          <h2 className="text-2xl font-bold mb-2 text-center font-headline text-foreground">Pre-Round Check-in</h2>
          <p className="text-sm text-center text-muted-foreground mb-6">Let's get you ready for your round. First, how are you feeling?</p>
          <div className="space-y-4">
            <TextAreaField
              label="What are you feeling confident about?"
              name="preRoundConfidence"
              value={preRoundConfidence}
              onChange={(e) => setPreRoundConfidence(e.target.value)}
              placeholder="e.g., My driver felt great on the range yesterday..."
              rows={3}
            />
            <TextAreaField
              label="What are your main worries or concerns?"
              name="preRoundWorries"
              value={preRoundWorries}
              onChange={(e) => setPreRoundWorries(e.target.value)}
              placeholder="e.g., The greens are fast here, worried about 3-putting..."
              rows={3}
            />
             <InputField
              label="Course Name"
              name="preRoundCourseName"
              value={preRoundCourseName}
              onChange={(e) => setPreRoundCourseName(e.target.value)}
              placeholder="e.g., Pebble Beach"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="City"
                name="preRoundCity"
                value={preRoundCity}
                onChange={(e) => setPreRoundCity(e.target.value)}
                placeholder="e.g., St Andrews"
              />
              <InputField
                label="Country"
                name="preRoundCountry"
                value={preRoundCountry}
                onChange={(e) => setPreRoundCountry(e.target.value)}
                placeholder="e.g., United Kingdom"
              />
            </div>
            <div className="mb-4">
              <ShadLabel className="block text-sm font-medium text-foreground mb-1">Date of Play</ShadLabel>
              <Popover open={isPreRoundCalendarOpen} onOpenChange={setIsPreRoundCalendarOpen}>
                  <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !preRoundPlayDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {preRoundPlayDate ? format(preRoundPlayDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={preRoundPlayDate} onSelect={(date) => { setPreRoundPlayDate(date); setIsPreRoundCalendarOpen(false); }} initialFocus />
                  </PopoverContent>
              </Popover>
            </div>
            <Button onClick={triggerFetchPreRoundAdvice} disabled={isFetchingPreRoundAdvice || !preRoundConfidence || !preRoundWorries || !preRoundCourseName || !preRoundCity || !preRoundCountry} className="w-full">
              {isFetchingPreRoundAdvice ? <Loader2 className="animate-spin" /> : "Get My Briefing"}
            </Button>
             <Button onClick={() => setCurrentPage('dashboard')} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        </CustomCard>
      );
      break;
    }
    case 'inputRoundChoice': {
        pageContent = (
            <CustomCard>
                <h2 className="text-2xl font-bold mb-6 text-center font-headline text-foreground">Log a Round</h2>
                <div className="flex flex-col gap-4">
                    <Button onClick={startFullRoundEntry} className="h-auto py-4 bg-black text-primary hover:bg-primary hover:text-primary-foreground">
                        <div className="flex flex-col items-center text-center">
                            <span className="font-semibold text-lg">Enter Round Summary</span>
                            <span className="text-xs font-normal mt-1 px-4">Ideal if you already know your final stats (FIR, GIR, Putts, etc.).</span>
                        </div>
                    </Button>
                    <Button onClick={startLiveRound} className="h-auto py-4 bg-black text-primary hover:bg-primary hover:text-primary-foreground">
                        <div className="flex flex-col items-center text-center">
                            <span className="font-semibold text-lg">Use the Scorecard</span>
                            <span className="text-xs font-normal mt-1 px-4">Enter your score hole-by-hole, and we'll calculate your stats for you.</span>
                        </div>
                    </Button>
                </div>
            </CustomCard>
        );
        break;
    }
    case 'liveScorecard': {
        const holeData = holeScores[currentHole - 1];
        const holesPlayedCount = parseInt(currentRound.holesPlayed);

        // Calculate score only for holes with a score entered
        const completedHoles = holeScores.slice(0, currentHole).filter(h => h.score > 0);
        const totalScore = completedHoles.reduce((sum, h) => sum + h.score, 0);
        const totalParForCompleted = completedHoles.reduce((sum, h) => sum + h.par, 0);
        const toPar = totalScore - totalParForCompleted;
        const isPar3 = holeData.par === 3;
        const currentHoleGpsData = foundScorecard?.holeData.find(h => h.hole === currentHole);
        
        pageContent = (
            <CustomCard>
              <AnimatePresence>
                {holeTransition.active && (
                  <motion.div
                    key="hole-transition"
                    className="absolute inset-0 bg-background/95 z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="font-pacifico text-9xl text-primary">
                      {holeTransition.hole}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

                {!isLiveRoundActive ? (
                    <>
                        <h2 className="text-2xl font-bold mb-6 text-center font-headline">The Essentials</h2>
                        <form onSubmit={(e) => { e.preventDefault(); checkForExistingScorecard(); }}>
                            <InputField label="Date of Round" name="roundDate" type="date" value={currentRound.roundDate} onChange={handleInputChange} />
                            <div className="mb-4">
                                <ShadLabel htmlFor="roundType" className="block text-sm font-medium mb-1">Type of Round</ShadLabel>
                                <Select
                                    name="roundType"
                                    value={currentRound.roundType}
                                    onValueChange={(value) => handleInputChange({ target: { name: 'roundType', value } } as any)}
                                >
                                    <SelectTrigger id="roundType" className="w-full mt-1">
                                        <SelectValue placeholder="Select round type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Casual">Casual</SelectItem>
                                        <SelectItem value="Competition">Competition</SelectItem>
                                        <SelectItem value="Indoor">Indoor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="relative mb-4">
                                <InputField
                                    label="Course Name"
                                    name="courseName"
                                    type="text"
                                    placeholder="e.g., St. Andrews Old Course"
                                    value={courseSearchTerm}
                                    onChange={(e) => {
                                      setCourseSearchTerm(e.target.value);
                                      setCurrentRound(prev => ({...prev, courseName: e.target.value}));
                                    }}
                                    autoComplete="off"
                                />
                                {isSearchingCourses && <Loader2 className="animate-spin absolute right-3 top-9 text-muted-foreground" />}
                                {courseSearchResults.length > 0 && !selectedCourse && (
                                    <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg">
                                        <ul className="max-h-60 overflow-y-auto">
                                            {courseSearchResults.map(course => (
                                                <li
                                                    key={course.id}
                                                    className="px-3 py-2 cursor-pointer hover:bg-accent"
                                                    onClick={() => handleSelectCourse(course)}
                                                >
                                                    <p className="text-sm font-medium">{course.name}</p>
                                                    <p className="text-xs text-muted-foreground">{course.location}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <InputField label="Tee Played Off" name="teePlayedOff" type="text" placeholder="e.g., White Tees" value={currentRound.teePlayedOff} onChange={handleInputChange}/>
                            <InputField label={`Course Par (${currentRound.holesPlayed} Holes)`} name="coursePar" value={currentRound.coursePar} onChange={handleInputChange} type="number" inputMode="numeric"/>
                             <div className="mb-4">
                                <ShadLabel className="block text-sm font-medium mb-1 text-foreground">Holes Played:</ShadLabel>
                                <RadioGroup name="holesPlayed" value={currentRound.holesPlayed} onValueChange={(value) => handleInputChange({target: {name: "holesPlayed", value, type:"radio"}} as any)} className="flex gap-x-4 mt-1">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="18" id="h18live" /><ShadLabel htmlFor="h18live" className="text-sm text-foreground">18 Holes</ShadLabel></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="9" id="h9live" /><ShadLabel htmlFor="h9live" className="text-sm text-foreground">9 Holes</ShadLabel></div>
                                </RadioGroup>
                            </div>
                            <InputField label="Current Handicap" name="currentHandicap" value={currentRound.currentHandicap} onChange={handleInputChange} type="text" placeholder="e.g., 18.3 or +2" inputMode="decimal" />
                            <InputField label="Target Handicap" name="targetHandicap" value={currentRound.targetHandicap} onChange={handleInputChange} type="text" placeholder="e.g., 15 (whole numbers)" inputMode="numeric" />
                            
                            <Button type="submit" variant="success" className="w-full mt-6" disabled={isCheckingForScorecard || !currentRound.courseName || !currentRound.teePlayedOff}>
                                {isCheckingForScorecard ? <Loader2 className="animate-spin" /> : "Start Round"}
                            </Button>
                        </form>
                    </>
                ) : (
                    <>
                         <div className="mb-4">
                           {currentHoleGpsData && <HoleMap holeData={currentHoleGpsData as HoleGpsData} />}
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-2xl font-bold font-headline">Hole {currentHole}</h2>
                                <p className="text-sm text-muted-foreground">{currentRound.courseName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">{toPar > 0 ? `+${toPar}` : toPar === 0 ? 'E' : toPar}</p>
                                <p className="text-sm text-muted-foreground">Total Score: {totalScore}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary">
                                    <ShadLabel>Par</ShadLabel>
                                    <div className="flex items-center gap-2">
                                        <Button size="icon" variant="outline" onClick={() => handleHoleDataChange(currentHole - 1, 'par', Math.max(3, holeData.par - 1))}><Minus /></Button>
                                        <span className="text-xl font-bold w-8 text-center">{holeData.par}</span>
                                        <Button size="icon" variant="outline" onClick={() => handleHoleDataChange(currentHole - 1, 'par', holeData.par + 1)}><Plus /></Button>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary">
                                    <ShadLabel>Score</ShadLabel>
                                    <div className="flex items-center gap-2">
                                        <Button size="icon" variant="outline" onClick={() => handleHoleDataChange(currentHole - 1, 'score', Math.max(0, holeData.score - 1))}><Minus /></Button>
                                        <span className="text-xl font-bold w-8 text-center">{holeData.score}</span>
                                        <Button size="icon" variant="outline" onClick={() => handleHoleDataChange(currentHole - 1, 'score', holeData.score + 1)}><Plus /></Button>
                                    </div>
                                </div>
                            </div>
                            <InputField label="Yardage" name="yardage" value={holeData.yardage || ''} onChange={(e) => handleHoleDataChange(currentHole - 1, 'yardage', parseInt(e.target.value) || 0)} type="number" inputMode="numeric" className="mb-0" />
                            <InputField label="Driving Distance" name="drivingDistance" value={holeData.drivingDistance || ''} onChange={(e) => handleHoleDataChange(currentHole - 1, 'drivingDistance', parseInt(e.target.value) || 0)} type="number" inputMode="numeric" className="mb-0" disabled={isPar3} />
                            <div>
                                <ShadLabel className={cn("mb-2 block", isPar3 && "text-muted-foreground")}>Tee Shot</ShadLabel>
                                {isPar3 ? (
                                    <Button
                                    variant={holeData.gir ? 'success' : 'outline'}
                                    onClick={() => handleHoleDataChange(currentHole - 1, 'gir', !holeData.gir)}
                                    className="w-full"
                                    >
                                    Green Hit?
                                    </Button>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                    <Button variant={holeData.teeShot === 'Left' ? 'default' : 'outline'} onClick={() => handleHoleDataChange(currentHole - 1, 'teeShot', 'Left')} disabled={isPar3}>Left</Button>
                                    <Button variant={holeData.teeShot === 'Fairway' ? 'success' : 'outline'} onClick={() => handleHoleDataChange(currentHole - 1, 'teeShot', 'Fairway')} disabled={isPar3}>Fairway</Button>
                                    <Button variant={holeData.teeShot === 'Right' ? 'default' : 'outline'} onClick={() => handleHoleDataChange(currentHole - 1, 'teeShot', 'Right')} disabled={isPar3}>Right</Button>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2 p-3 rounded-lg bg-secondary justify-center">
                                    <Checkbox id="gir" checked={holeData.gir} onCheckedChange={(checked) => handleHoleDataChange(currentHole - 1, 'gir', !!checked)} className={cn(holeData.gir && "data-[state=checked]:bg-success data-[state=checked]:text-success-foreground border-success")} />
                                    <div className="flex items-center">
                                        <ShadLabel htmlFor="gir">GIR</ShadLabel>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1.5 cursor-help">
                                                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Green in Regulation (GIR)</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                    A green is considered 'in regulation' if your ball is on the putting surface in 2 strokes less than par (e.g., on the green in 1 shot on a par 3, 2 shots on a par 4, or 3 shots on a par 5).
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogAction>OK</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 p-3 rounded-lg bg-secondary justify-center">
                                    <Checkbox id="upAndDown" checked={holeData.upAndDown} onCheckedChange={(checked) => handleHoleDataChange(currentHole - 1, 'upAndDown', !!checked)} className={cn(holeData.upAndDown && "data-[state=checked]:bg-success data-[state=checked]:text-success-foreground border-success")} />
                                    <div className="flex items-center">
                                    <ShadLabel htmlFor="upAndDown">Up & Down</ShadLabel>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-5 w-5 ml-1.5 cursor-help">
                                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Up and Down</AlertDialogTitle>
                                            <AlertDialogDescription>
                                            The percentage of times you miss a Green in Regulation, but still make par or better. This typically involves a chip/pitch and a one-putt.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogAction>OK</AlertDialogAction>
                                        </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-secondary">
                                <ShadLabel className="mb-2 block font-medium">Sand Saves</ShadLabel>
                                <div className="grid grid-cols-2 gap-4">
                                     <InputField label="Attempted" name="sandSavesAttempted" value={holeData.sandSavesAttempted || ''} onChange={(e) => handleHoleDataChange(currentHole - 1, 'sandSavesAttempted', parseInt(e.target.value) || 0)} type="number" inputMode="numeric" />
                                     <InputField label="Made" name="sandSavesMade" value={holeData.sandSavesMade || ''} onChange={(e) => handleHoleDataChange(currentHole - 1, 'sandSavesMade', parseInt(e.target.value) || 0)} type="number" inputMode="numeric" />
                                </div>
                            </div>
                             <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary">
                                <ShadLabel>Putts</ShadLabel>
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="outline" onClick={() => handleHoleDataChange(currentHole - 1, 'putts', Math.max(0, holeData.putts - 1))}><Minus /></Button>
                                    <span className="text-xl font-bold w-8 text-center">{holeData.putts}</span>
                                    <Button size="icon" variant="outline" onClick={() => handleHoleDataChange(currentHole - 1, 'putts', holeData.putts + 1)}><Plus /></Button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShadLabel>Penalty Strokes</ShadLabel>
                                <Button size="icon" variant="outline" onClick={() => handleHoleDataChange(currentHole - 1, 'penaltyStrokes', Math.max(0, holeData.penaltyStrokes - 1))}><Minus /></Button>
                                <span className="text-lg font-bold w-6 text-center">{holeData.penaltyStrokes}</span>
                                <Button size="icon" variant="outline" onClick={() => handleHoleDataChange(currentHole - 1, 'penaltyStrokes', holeData.penaltyStrokes + 1)}><Plus /></Button>
                            </div>
                        </div>

                        <div className="flex justify-between mt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    if (currentHole === 1) {
                                        setIsLiveRoundActive(false);
                                    } else {
                                        handleHoleNavigation(currentHole - 1);
                                    }
                                }}
                            >
                                <ChevronLeft className="mr-2" />
                                {currentHole === 1 ? 'Back to Setup' : 'Prev Hole'}
                            </Button>
                            {currentHole < holesPlayedCount ? (
                                <Button variant="success" onClick={() => handleHoleNavigation(Math.min(holesPlayedCount, currentHole + 1))}>
                                    Next Hole <ChevronRight className="ml-2" />
                                </Button>
                            ) : (
                                <Button variant="success" onClick={calculateAndTransitionToReview}>
                                    Finish Round & Review
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </CustomCard>
        );
        break;
    }
    case 'liveScorecardReview': {
      const holesToDisplay = holeScores.slice(0, parseInt(currentRound.holesPlayed));
      pageContent = (
        <CustomCard>
          <h2 className="text-2xl font-bold mb-2 text-center font-headline">Round Review</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">{currentRound.courseName} - {format(new Date(currentRound.roundDate), "PP")}</p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center mb-6">
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-sm font-medium text-muted-foreground">Score</p>
              <p className="text-2xl font-bold">{currentRound.scoreToPar}</p>
            </div>
             <div className="p-3 rounded-lg bg-secondary">
              <p className="text-sm font-medium text-muted-foreground">FIR</p>
              <p className="text-2xl font-bold">{currentRound.fairwaysInRegulation}%</p>
            </div>
             <div className="p-3 rounded-lg bg-secondary">
              <p className="text-sm font-medium text-muted-foreground">GIR</p>
              <p className="text-2xl font-bold">{currentRound.greensInRegulation}%</p>
            </div>
             <div className="p-3 rounded-lg bg-secondary">
              <p className="text-sm font-medium text-muted-foreground">Putts</p>
              <p className="text-2xl font-bold">{currentRound.puttsTotal}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-sm font-medium text-muted-foreground">Avg Drive</p>
              <p className="text-2xl font-bold">{currentRound.drivingDistance} yds</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Hole</TableHead>
                  <TableHead className="text-center">Par</TableHead>
                  <TableHead className="text-center">Yds</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">Tee</TableHead>
                  <TableHead className="text-center">GIR</TableHead>
                  <TableHead className="text-center">U&D</TableHead>
                  <TableHead className="text-center">Putts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holesToDisplay.map((hole, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-center font-medium">{hole.hole}</TableCell>
                    <TableCell className="text-center">{hole.par}</TableCell>
                    <TableCell className="text-center">{hole.yardage}</TableCell>
                    <TableCell className="text-center">{hole.score}</TableCell>
                    <TableCell className="text-center">{hole.teeShot ? hole.teeShot.charAt(0) : '-'}</TableCell>
                    <TableCell className="text-center">{hole.gir ? <Check className="mx-auto text-success" /> : <X className="mx-auto text-destructive" />}</TableCell>
                    <TableCell className="text-center">{hole.upAndDown ? <Check className="mx-auto text-success" /> : <X className="mx-auto text-destructive" />}</TableCell>
                    <TableCell className="text-center">{hole.putts}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-2 mt-8">
            <Button variant="outline" onClick={() => setCurrentPage('liveScorecard')}>
              <Edit3 className="mr-2" /> Edit Round
            </Button>
            <Button variant="success" onClick={() => setCurrentPage('inputReflection')}>
              Confirm & Continue <ChevronRight className="ml-2" />
            </Button>
          </div>
        </CustomCard>
      );
      break;
    }
    case 'inputRoundEssentials': {
      pageContent = (
        <CustomCard>
          <h2 className="text-2xl font-bold mb-6 text-center font-headline text-foreground">{editingRoundId ? 'Edit Round' : 'Log New Round'} - Step 1: Essentials</h2>
          <form onSubmit={(e) => e.preventDefault()}>
              <InputField label="Date of Round" name="roundDate" type="date" value={currentRound.roundDate} onChange={handleInputChange} />
              <div className="mb-4">
                <ShadLabel htmlFor="roundType" className="block text-sm font-medium mb-1 text-foreground">Type of Round</ShadLabel>
                <Select
                  name="roundType"
                  value={currentRound.roundType}
                  onValueChange={(value) => handleInputChange({ target: { name: 'roundType', value } } as any)}
                >
                  <SelectTrigger id="roundType" className="w-full mt-1">
                    <SelectValue placeholder="Select round type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Casual">Casual</SelectItem>
                    <SelectItem value="Competition">Competition</SelectItem>
                    <SelectItem value="Indoor">Indoor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <InputField label="Course Name" name="courseName" type="text" placeholder="e.g., St. Andrews Old Course" value={currentRound.courseName} onChange={handleInputChange}/>
              <InputField label="Tee Played Off" name="teePlayedOff" type="text" placeholder="e.g., White Tees" value={currentRound.teePlayedOff} onChange={handleInputChange}/>
              <div className="mb-4">
                <ShadLabel className="block text-sm font-medium mb-1 text-foreground">Holes Played:</ShadLabel>
                <RadioGroup name="holesPlayed" value={currentRound.holesPlayed} onValueChange={(value) => handleInputChange({target: {name: "holesPlayed", value, type:"radio"}} as any)} className="flex gap-x-4 mt-1">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="18" id="h18" /><ShadLabel htmlFor="h18" className="text-sm text-foreground">18 Holes</ShadLabel></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="9" id="h9" /><ShadLabel htmlFor="h9" className="text-sm text-foreground">9 Holes</ShadLabel></div>
                </RadioGroup>
              </div>
              <InputField label="Current Handicap" name="currentHandicap" value={currentRound.currentHandicap} onChange={handleInputChange} type="text" placeholder="e.g., 18.3 or +2" inputMode="decimal" />
              <InputField label="Target Handicap" name="targetHandicap" value={currentRound.targetHandicap} onChange={handleInputChange} type="text" placeholder="e.g., 15 (whole numbers)" inputMode="numeric" />
              <InputField label={`Gross Score (${currentRound.holesPlayed} Holes)`} name="grossScore" value={currentRound.grossScore} onChange={handleInputChange} type="number" inputMode="numeric"/>
              <InputField label={`Course Par (${currentRound.holesPlayed} Holes)`} name="coursePar" value={currentRound.coursePar} onChange={handleInputChange} type="number" inputMode="numeric"/>
              <InputField label="Score to Par" name="scoreToPar" value={currentRound.scoreToPar} onChange={handleInputChange} type="text" placeholder="Auto-calculated" readOnly={true} />

              <div className="flex flex-col space-y-3 mt-8 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end">
                  {editingRoundId && (
                    <Button className="w-full sm:w-auto" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                  <Button className="w-full sm:w-auto" variant="success" type="button" onClick={() => {
                      if (handleValidateEssentials()) {
                          setNavigationDirection('next');
                          _setCurrentPage('inputRoundDriving');
                      }
                  }}>
                      Next: Driving Stats <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
              </div>
          </form>
        </CustomCard>
      );
      break;
    }
    case 'inputRoundDriving': {
      pageContent = (
        <CustomCard>
          <h2 className="text-2xl font-bold mb-6 text-center font-headline text-foreground">{editingRoundId ? 'Edit Round' : 'Log New Round'} - Step 2: Driving</h2>
          <form onSubmit={(e) => e.preventDefault()}>
              <InputField label="Average Distance (yds)" name="drivingDistance" value={currentRound.drivingDistance} onChange={handleInputChange} type="number" inputMode="numeric"/>
              <InputField
                  label="Fairways in Regulation (%)"
                  name="fairwaysInRegulation"
                  value={currentRound.fairwaysInRegulation}
                  onChange={handleInputChange}
                  type="number"
                  inputMode="numeric"
                  tooltip="The percentage of tee shots (on par 4s and 5s) that come to rest in the fairway."
              />
              <InputField label="Fairways Missed Left (%)" name="fairwaysMissedLeft" value={currentRound.fairwaysMissedLeft} onChange={handleInputChange} type="number" inputMode="numeric"/>
              <InputField label="Fairways Missed Right (%)" name="fairwaysMissedRight" value={currentRound.fairwaysMissedRight} onChange={handleInputChange} type="number" inputMode="numeric" placeholder="Auto-calculated"/>
              <InputField label="Penalty Shots (Driving)" name="drivingPenalties" value={currentRound.drivingPenalties} onChange={handleInputChange} type="number" inputMode="numeric"/>
              <div className="flex flex-col space-y-3 mt-8 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-between">
                  <Button className="w-full sm:w-auto" variant="outline" onClick={() => {
                      setNavigationDirection('prev');
                      _setCurrentPage('inputRoundEssentials');
                  }}>
                      <ChevronLeft className="w-5 h-5 mr-2" /> Previous: Essentials
                  </Button>
                  <Button className="w-full sm:w-auto" variant="success" type="button" onClick={() => {
                      setNavigationDirection('next');
                      _setCurrentPage('inputRoundApproach');
                  }}>
                      Next: Approach Stats <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
              </div>
          </form>
        </CustomCard>
      );
      break;
    }
    case 'inputRoundApproach': {
      pageContent = (
        <CustomCard>
          <h2 className="text-2xl font-bold mb-6 text-center font-headline text-foreground">{editingRoundId ? 'Edit Round' : 'Log New Round'} - Step 3: Approach</h2>
          <form onSubmit={(e) => e.preventDefault()}>
              <InputField
                  label="Greens in Regulation (%)"
                  name="greensInRegulation"
                  value={currentRound.greensInRegulation}
                  onChange={handleInputChange}
                  type="number"
                  inputMode="numeric"
                  tooltip="A green is considered 'in regulation' if your ball is on the putting surface in 2 strokes less than par (e.g., on the green in 1 shot on a par 3, 2 shots on a par 4, or 3 shots on a par 5)."
              />
              <InputField label="Green Missed Left (%)" name="greensMissedLeft" value={currentRound.greensMissedLeft} onChange={handleInputChange} type="number" inputMode="numeric"/>
              <InputField label="Green Missed Right (%)" name="greensMissedRight" value={currentRound.greensMissedRight} onChange={handleInputChange} type="number" inputMode="numeric"/>
              <InputField label="Green Missed Short (%)" name="greensMissedShort" value={currentRound.greensMissedShort} onChange={handleInputChange} type="number" inputMode="numeric"/>
              <InputField label="Green Missed Long (%)" name="greensMissedLong" value={currentRound.greensMissedLong} onChange={handleInputChange} type="number" inputMode="numeric" placeholder="Auto-calculated"/>
              <InputField label="Penalty Shots (Approach)" name="approachPenalties" value={currentRound.approachPenalties} onChange={handleInputChange} type="number" inputMode="numeric"/>
              <div className="flex flex-col space-y-3 mt-8 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-between">
                  <Button className="w-full sm:w-auto" variant="outline" onClick={() => {
                      setNavigationDirection('prev');
                      _setCurrentPage('inputRoundDriving');
                  }}>
                      <ChevronLeft className="w-5 h-5 mr-2" /> Previous: Driving
                  </Button>
                  <Button className="w-full sm:w-auto" variant="success" type="button" onClick={() => {
                      setNavigationDirection('next');
                      _setCurrentPage('inputRoundAroundTheGreen');
                  }}>
                      Next: Short game stats <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
              </div>
          </form>
        </CustomCard>
      );
      break;
    }
    case 'inputRoundAroundTheGreen': {
      pageContent = (
        <CustomCard>
          <h2 className="text-2xl font-bold mb-6 text-center font-headline text-foreground">{editingRoundId ? 'Edit Round' : 'Log New Round'} - Step 4: Short Game</h2>
          <form onSubmit={(e) => e.preventDefault()}>
              <InputField
                label="Up and Down (%)"
                name="upAndDown"
                value={currentRound.upAndDown}
                onChange={handleInputChange}
                type="number"
                inputMode="numeric"
                tooltip="The percentage of times you miss a Green in Regulation, but still make par or better. This typically involves a chip/pitch and a one-putt."
              />
              <div className="p-3 my-2 rounded-md border border-primary/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">Sand Saves:</p>
                    {currentRound.roundType === 'Indoor' && (
                        <div className="flex items-center space-x-2">
                            <Checkbox id="notApplicableSand" name="notApplicableSand" checked={currentRound.notApplicableSand} onCheckedChange={(checked) => handleInputChange({ target: { name: 'notApplicableSand', checked: !!checked } } as any)} />
                            <Label htmlFor="notApplicableSand" className="text-xs text-foreground/80">N/A</Label>
                        </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Attempted" name="sandSavesAttempted" value={currentRound.sandSavesAttempted} onChange={handleInputChange} type="number" inputMode="numeric" placeholder="e.g., 5" disabled={currentRound.notApplicableSand} />
                    <InputField label="Made" name="sandSavesMade" value={currentRound.sandSavesMade} onChange={handleInputChange} type="number" inputMode="numeric" placeholder="e.g., 3" disabled={currentRound.notApplicableSand} />
                  </div>
              </div>
              <div className="flex flex-col space-y-3 mt-8 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-between">
                  <Button className="w-full sm:w-auto" variant="outline" onClick={() => {
                      setNavigationDirection('prev');
                      _setCurrentPage('inputRoundApproach');
                  }}>
                      <ChevronLeft className="w-5 h-5 mr-2" /> Previous: Approach
                  </Button>
                  <Button className="w-full sm:w-auto" variant="success" type="button" onClick={() => {
                      setNavigationDirection('next');
                      _setCurrentPage('inputRoundPutting');
                  }}>
                      Next: Putting Stats <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
              </div>
          </form>
        </CustomCard>
      );
      break;
    }
    case 'inputRoundPutting': {
      const isIndoor = currentRound.roundType === 'Indoor';
      pageContent = (
        <CustomCard>
          <h2 className="text-2xl font-bold mb-6 text-center font-headline text-foreground">{editingRoundId ? 'Edit Round' : 'Log New Round'} - Step 5: Putting</h2>
           {isIndoor && (
            <div className="flex items-center justify-end space-x-2 mb-4">
                <Checkbox id="notApplicablePutting" name="notApplicablePutting" checked={currentRound.notApplicablePutting} onCheckedChange={(checked) => handleInputChange({ target: { name: 'notApplicablePutting', checked: !!checked } } as any)} />
                <Label htmlFor="notApplicablePutting" className="text-sm font-medium text-foreground">Mark all putting stats as N/A</Label>
            </div>
          )}
          <form onSubmit={(e) => e.preventDefault()}>
              <InputField label="Putts This Round" name="puttsTotal" value={currentRound.puttsTotal} onChange={handleInputChange} type="number" inputMode="numeric" disabled={currentRound.notApplicablePutting} />
              <InputField label="Number of 3-Putts (or more)" name="threePuttsOrMore" value={currentRound.threePuttsOrMore} onChange={handleInputChange} type="number" inputMode="numeric" placeholder="e.g., 2" disabled={currentRound.notApplicablePutting} />
              <InputField label="Number of 2-Putts" name="twoPutts" value={currentRound.twoPutts} onChange={handleInputChange} type="number" inputMode="numeric" placeholder="e.g., 10" disabled={currentRound.notApplicablePutting} />
              <InputField label="Number of 1-Putts" name="onePutts" value={currentRound.onePutts} onChange={handleInputChange} type="number" inputMode="numeric" placeholder="Auto-calculated" disabled={currentRound.notApplicablePutting} />

              <div className="p-3 my-2 rounded-md border border-primary/50">
                <p className="text-sm font-medium mb-2 text-foreground">Putts from 5 Yards &amp; In:</p>
                <InputField label="Attempted" name="puttsAttempted5yards" value={currentRound.puttsAttempted5yards} onChange={handleInputChange} type="number" inputMode="numeric" optional={true} notApplicableName="notApplicable5yards" notApplicableValue={currentRound.notApplicable5yards || currentRound.notApplicablePutting} onCheckboxChange={handleInputChange} placeholder="e.g., 10" disabled={currentRound.notApplicablePutting} />
                {!currentRound.notApplicable5yards && <InputField label="Made" name="puttsMade5yards" value={currentRound.puttsMade5yards} onChange={handleInputChange} type="number" inputMode="numeric" placeholder="e.g., 7" disabled={currentRound.notApplicablePutting} />}
              </div>
              <div className="p-3 my-2 rounded-md border border-primary/50">
                <p className="text-sm font-medium mb-2 text-foreground">Putts from 10 Yards &amp; In:</p>
                <InputField label="Attempted" name="puttsAttempted10yards" value={currentRound.puttsAttempted10yards} onChange={handleInputChange} type="number" inputMode="numeric" optional={true} notApplicableName="notApplicable10yards" notApplicableValue={currentRound.notApplicable10yards || currentRound.notApplicablePutting} onCheckboxChange={handleInputChange} placeholder="e.g., 5" disabled={currentRound.notApplicablePutting}/>
                {!currentRound.notApplicable10yards && <InputField label="Made" name="puttsMade10yards" value={currentRound.puttsMade10yards} onChange={handleInputChange} type="number" inputMode="numeric" placeholder="e.g., 2" disabled={currentRound.notApplicablePutting} />}
              </div>
               <div className="p-3 my-2 rounded-md border border-primary/50">
                <p className="text-sm font-medium mb-2 text-foreground">Putts from 20 Yards &amp; In:</p>
                <InputField label="Attempted" name="puttsAttempted20yards" value={currentRound.puttsAttempted20yards} onChange={handleInputChange} type="number" inputMode="numeric" optional={true} notApplicableName="notApplicable20yards" notApplicableValue={currentRound.notApplicable20yards || currentRound.notApplicablePutting} onCheckboxChange={handleInputChange} placeholder="e.g., 4" disabled={currentRound.notApplicablePutting}/>
                {!currentRound.notApplicable20yards && <InputField label="Made" name="puttsMade20yards" value={currentRound.puttsMade20yards} onChange={handleInputChange} type="number" inputMode="numeric" placeholder="e.g., 1" disabled={currentRound.notApplicablePutting} />}
              </div>
              <div className="p-3 my-2 rounded-md border border-primary/50">
                <p className="text-sm font-medium mb-2 text-foreground">Putts from 21+ Yards Out:</p>
                <InputField label="Attempted" name="puttsAttempted21plusYards" value={currentRound.puttsAttempted21plusYards} onChange={handleInputChange} type="number" inputMode="numeric" optional={true} notApplicableName="notApplicable21plusYards" notApplicableValue={currentRound.notApplicable21plusYards || currentRound.notApplicablePutting} onCheckboxChange={handleInputChange} placeholder="e.g., 3" disabled={currentRound.notApplicablePutting}/>
                {!currentRound.notApplicable21plusYards && <InputField label="Made" name="puttsMade21plusYards" value={currentRound.puttsMade21plusYards} onChange={handleInputChange} type="number" inputMode="numeric" placeholder="e.g., 0" disabled={currentRound.notApplicablePutting}/>}
              </div>
              <div className="flex flex-col space-y-3 mt-8 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-between">
                  <Button className="w-full sm:w-auto" variant="outline" onClick={() => {
                      setNavigationDirection('prev');
                      _setCurrentPage('inputRoundAroundTheGreen');
                  }}>
                      <ChevronLeft className="w-5 h-5 mr-2" /> Previous: Short Game
                  </Button>
                  <Button className="w-full sm:w-auto" variant="success" type="button" onClick={() => {
                       setNavigationDirection('next');
                       _setCurrentPage('inputReflection');
                  }}>
                      Next: Add Reflection <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
              </div>
          </form>
        </CustomCard>
      );
      break;
    }
    case 'inputReflection': {
      const isEditing = !!editingRoundId;
      pageContent = (
          <CustomCard>
              <h2 className="text-2xl font-bold mb-6 text-center font-headline text-foreground">{isEditing ? 'Edit Round' : 'Log New Round'} - Step 6: Reflection</h2>
              <form onSubmit={(e) => e.preventDefault()}>
                  <div>
                      <TextAreaField
                          label="Key Observations / Feelings from the Round:"
                          name="generalObservations"
                          rows={clarifyingQuestions.length > 0 ? 4 : 6}
                          value={currentRound.generalObservations}
                          onChange={handleInputChange}
                          placeholder="e.g., Consistently sliced driver, alignment felt off on approach shots, good tempo with irons, struggled with 3-foot putts, felt tired on back nine, wrist was sore..."
                      />
                       <p className="text-xs text-muted-foreground mt-1">Be specific! Mention shot shapes, contact issues, or anything else you noticed, including how you felt physically.</p>
                  </div>

                  {isFetchingClarifyingQuestions && (
                    <div className="my-4">
                      <GolfLoadingAnimation />
                    </div>
                  )}

                  {reflectionStep === 'initial' && !isFetchingClarifyingQuestions && (
                      <div className="mt-8 flex justify-end">
                          <Button
                              className="w-full sm:w-auto"
                              type="button"
                              onClick={handleFetchClarifyingQuestions}
                              disabled={isFetchingClarifyingQuestions}
                              variant="success"
                          >
                              <Send size={16} className="mr-2" />
                              Send to Coach
                          </Button>
                      </div>
                  )}
                  
                  {clarifyingQuestions.length > 0 && !isFetchingClarifyingQuestions && (
                      <div className="mt-6">
                          <div className="p-4 rounded-lg text-sm bg-custom-ai-text-bg border border-primary">
                              <h5 className="font-semibold mb-2 flex items-center text-foreground"><MessageSquareText size={16} className="mr-2 text-primary"/>Coach has some questions:</h5>
                              <ul className="list-disc pl-5 space-y-2 text-foreground/90">
                                  {clarifyingQuestions.map((q, index) => <li key={index}>{q}</li>)}
                              </ul>
                              <div className="mt-4">
                                  <TextAreaField
                                      label="Your Answers:"
                                      name="clarifyingAnswers"
                                      rows={4}
                                      value={clarifyingAnswers}
                                      onChange={(e) => setClarifyingAnswers(e.target.value)}
                                      placeholder="Answer the coach's questions here to add more detail to your reflection..."
                                  />
                              </div>
                          </div>
                      </div>
                  )}

                  <div className="flex flex-col space-y-3 mt-8 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-between">
                      <Button className="w-full sm:w-auto" variant="outline" onClick={() => {
                          setNavigationDirection('prev');
                          _setCurrentPage('inputRoundPutting');
                      }}>
                          <ChevronLeft className="w-5 h-5 mr-2" /> Previous: Putting
                      </Button>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                          {editingRoundId ? (
                              <Button
                                  className="w-full sm:w-auto"
                                  type="button"
                                  onClick={handleUpdateRound}
                                  variant="success"
                                  disabled={isSubmittingRound || isFetchingClarifyingQuestions}
                              >
                                  {isSubmittingRound ? (
                                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Updating...</>
                                  ) : (
                                      <><CheckCircle className="w-5 h-5 mr-2" />Update Round & Get Analysis</>
                                  )}
                              </Button>
                          ) : (
                              <Button
                                  className="w-full sm:w-auto"
                                  type="button"
                                  onClick={handleAddReflection}
                                  variant="success"
                                  disabled={isSubmittingRound || (clarifyingQuestions.length > 0 && !clarifyingAnswers.trim() && reflectionStep === 'clarified')}
                              >
                                  {isSubmittingRound ? (
                                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Submitting...</>
                                  ) : (
                                      <><CheckCircle className="w-5 h-5 mr-2" />Save Round & Submit</>
                                  )}
                              </Button>
                          )}
                      </div>
                  </div>
              </form>
          </CustomCard>
      );
      break;
    }
    case 'drills': {
      if (!hasLoggedRounds) {
        pageContent = (
          <InfoMessageCard
              title="Log a Round to View Drills"
              message="Please log your latest round data, this will help potentially provide practice drills tailored to your game."
              actionButtonLabel="Log First Round"
              onActionClick={() => setCurrentPage('inputRoundChoice', true)}
              icon={<ListChecks size={48} className="text-muted-foreground"/>}
          />
        );
      } else {
        let recommendedDrillsBasedOnAreaOfPotential: (Drill & { rationale?: string })[] = [];
        if (identifiedAreasOfPotential.length > 0) {
            const allDrillsWithRelevance = drills.map(drill => {
                const matchingAops = identifiedAreasOfPotential.filter(aop => drill.targetsAreaOfPotential.includes(aop.tag));
                const relevanceScore = matchingAops.reduce((sum, aop) => sum + aop.score, 0);
                const primaryAop = matchingAops.sort((a,b) => b.score - a.score)[0];
                let rationale = getRationaleForTag('default');
                if (primaryAop) {
                  rationale = getRationaleForTag(primaryAop.tag);
                }
                return { ...drill, relevanceScore, matchedAreasOfPotentialTags: matchingAops.map(aop => aop.tag), rationale };
            }).filter(d => (d.relevanceScore ?? 0) > 0);

            allDrillsWithRelevance.sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));

            const selectedDrillIds = new Set<string>();
            const maxRecs = drillCompletionTarget + 2;

            const sortedAops = [...identifiedAreasOfPotential].sort((a, b) => b.score - a.score);

            for (const aop of sortedAops) {
                if (selectedDrillIds.size >= maxRecs) break;
                
                const bestDrillForThisAop = allDrillsWithRelevance
                    .filter(d => !selectedDrillIds.has(d.id) && d.matchedAreasOfPotentialTags?.includes(aop.tag))
                    .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))[0];

                if (bestDrillForThisAop) {
                    recommendedDrillsBasedOnAreaOfPotential.push(bestDrillForThisAop);
                    selectedDrillIds.add(bestDrillForThisAop.id);

                    const wasCompletedBefore = completedDrillHistory.some(h => h.drillId === bestDrillForThisAop.id);
                    if (wasCompletedBefore) {
                        const alternativeDrill = allDrillsWithRelevance.find(d => 
                            d.category === bestDrillForThisAop.category && 
                            d.id !== bestDrillForThisAop.id &&
                            !selectedDrillIds.has(d.id)
                        );
                        if (alternativeDrill && selectedDrillIds.size < maxRecs) {
                            recommendedDrillsBasedOnAreaOfPotential.push(alternativeDrill);
                            selectedDrillIds.add(alternativeDrill.id);
                        }
                    }
                }
            }

            if (selectedDrillIds.size < maxRecs) {
                const remainingOverallBest = allDrillsWithRelevance
                    .filter(d => !selectedDrillIds.has(d.id));
                for (const drill of remainingOverallBest) {
                    if (selectedDrillIds.size >= maxRecs) break;
                    recommendedDrillsBasedOnAreaOfPotential.push(drill);
                    selectedDrillIds.add(drill.id);
                }
            }
             recommendedDrillsBasedOnAreaOfPotential = Array.from(selectedDrillIds).map(id => {
                const foundDrill = allDrillsWithRelevance.find(d => d.id === id);
                return foundDrill || drills.find(d => d.id === id);
            }).filter(Boolean) as (Drill & { relevanceScore: number; matchedAreasOfPotentialTags: string[]; rationale: string; })[];
            
            recommendedDrillsBasedOnAreaOfPotential.sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));

        }

        const outdoorRounds = rounds.filter(r => r.roundType !== 'Indoor');
        const threeWeeksAgo = subWeeks(new Date(), 3);
        const latestRelevantRound = outdoorRounds.find(r => isWithinInterval(parseISO(r.roundDate), { start: threeWeeksAgo, end: new Date() }));
        
        let introText = "Here are drills recommended based on your recent performance. You can find more in the Drill Library.";
        
        if (latestRelevantRound && identifiedAreasOfPotential.length > 0) {
            const friendlyAopNames: Record<string, string> = {
                girLow: 'low GIR',
                drivingPenaltiesHigh: 'high driving penalties',
                consistentMissRight: 'missing fairways right',
                consistentMissLeft: 'missing fairways left',
                threePuttHigh: '3-putting',
                upAndDownLow: 'low up & down percentage',
            };

            const mainAreasOfPotentialToShow = identifiedAreasOfPotential
                .slice(0, 2)
                .map(aop => friendlyAopNames[aop.tag] || aop.tag.replace(/([A-Z])/g, ' $1').toLowerCase())
                .join(' and ');
            
            const roundDate = new Date(latestRelevantRound.roundDate);
            const formattedDate = format(roundDate, "MMMM do");

            introText = `From your round at ${latestRelevantRound.courseName} on ${formattedDate}, key areas of potential like ${mainAreasOfPotentialToShow} have been highlighted. These drills are recommended to help:`;
        } else if (hasLoggedRounds && recommendedDrillsBasedOnAreaOfPotential.length === 0) {
            introText = "Your latest round stats didn't flag strong areas for specific drill recommendations. Feel free to browse all drills in the Library or log another round to get new recommendations.";
        }


        pageContent = (
          <CustomCard>
            <h2 className="text-2xl font-bold mb-3 text-center font-headline text-foreground">The Briefing</h2>
             <div className="my-6">
                <div className="text-center">
                  <Button
                    onClick={handleBuildPlanWithAI}
                    disabled={isBuildingPlan}
                    className="w-full sm:w-auto"
                    variant="default"
                  >
                    {isBuildingPlan ? <Loader2 className="animate-spin mr-2" /> : <Brain size={16} className="mr-2" />}
                    {isBuildingPlan ? "Building Your Plan..." : "Ask Coach for a Plan"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">Let's take your data and turn it into a custom plan, so you spend less time guessing and more time growing.</p>
                </div>
                 {isBuildingPlan && (
                  <div className="my-4">
                    <GolfLoadingAnimation />
                  </div>
                )}
                {planSummary && (
                  <div className="mt-4 p-4 rounded-lg text-sm bg-custom-ai-text-bg border border-primary">
                      <h5 className="font-semibold mb-2 flex items-center text-foreground"><MessageSquareText size={16} className="mr-2 text-primary"/>Coach's Plan:</h5>
                      <p className="whitespace-pre-wrap text-foreground/90">{planSummary}</p>
                  </div>
                )}
                <Separator className="my-6" />
              </div>
            <p className="text-sm text-center text-muted-foreground mb-6">{introText}</p>
            
            {recommendedDrillsBasedOnAreaOfPotential.length > 0 ? (
                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 flex items-center text-foreground font-headline">
                        <Zap size={22} className="mr-2 text-primary"/> Recommended For You
                    </h3>
                    <div className="space-y-4">
                        {recommendedDrillsBasedOnAreaOfPotential.map((drill, index) => 
                            <DrillCardComponent 
                                key={`rec-${drill.id}-${index}`} 
                                drill={drill} 
                                isRecommended={true} 
                                isTopRecommended={true} 
                                favouriteDrillIds={favouriteDrillIds} 
                                toggleFavouriteDrill={toggleFavouriteDrill}
                                practicePlan={practicePlan}
                                completedDrillHistory={completedDrillHistory}
                                aiDrillModifications={aiDrillModifications}
                                isFetchingDrillModifications={isFetchingDrillModifications}
                                triggerFetchAIModificationsForDrill={triggerFetchAIModificationsForDrill}
                                identifiedAreasOfPotential={identifiedAreasOfPotential}
                                addDrillToPlan={addDrillToPlan}
                                currentPage={_currentPage}
                                rationale={drill.rationale}
                             />
                        )}
                    </div>
                </div>
            ) : (
                hasLoggedRounds && (
                    <p className="text-center text-muted-foreground py-4">No specific new drills recommended based on your last round. Check the Drill Library for all available drills or log another round for fresh recommendations.</p>
                )
            )}
            
            {hasLoggedRounds && (
                <div className="text-center mt-6">
                    <Button
                        onClick={() => setCurrentPage('library')}
                        disabled={!libraryUnlocked}
                        className="w-full sm:w-auto"
                        variant="default"
                    >
                        {libraryUnlocked ? 'View Full Drill Library' : <LockIcon className="mr-2" />}
                        {!libraryUnlocked && `Unlock Full Library`}
                    </Button>
                    {!libraryUnlocked && (
                        <p className="text-center text-destructive text-xs mt-2">
                           Complete {10 - uniqueDrillsWithReflectionsCount} more unique practice drills with reflections to unlock.
                        </p>
                    )}
                </div>
            )}
          </CustomCard>
        );
      }
      break;
    }
    case 'practice': {
        const unassignedDrills = practicePlan.filter(item => !item.sessionId && !item.completed);
        const completedDrills = practicePlan.filter(item => item.completed);

        const sessionsWithDrills = practiceSessions
          .map(session => ({
              ...session,
              drills: practicePlan.filter(drill => drill.sessionId === session.id && !drill.completed)
          }))
          .sort((a,b) => (a.sessionDate || a.createdAt.toMillis()) - (b.sessionDate || b.createdAt.toMillis()));

        pageContent = (
          <CustomCard>
            <h2 className="text-2xl font-bold mb-6 text-center font-headline text-foreground">The Agenda</h2>

             <Tabs value={activePracticeTab} onValueChange={(value) => setActivePracticeTab(value as 'unassigned' | 'sessions')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="unassigned">Unassigned Drills ({unassignedDrills.length})</TabsTrigger>
                    <TabsTrigger value="sessions">Planned Sessions ({sessionsWithDrills.filter(s => s.drills.length > 0).length})</TabsTrigger>
                </TabsList>
                <TabsContent value="unassigned" className="mt-4">
                    {unassignedDrills.length > 0 ? (
                        <div className="space-y-4">
                            {unassignedDrills.map(item => {
                                const drill = drills.find(d => d.id === item.drillId);
                                const itemIndex = practicePlan.findIndex(p => p.id === item.id);
                                if (!drill || itemIndex === -1) return null;
                                return <PracticeDrillItemComponent 
                                    key={`unassigned-${item.id}`}
                                    item={item} 
                                    drillDetails={drill} 
                                    itemPlanIndex={itemIndex}
                                    onAssignToSession={() => {
                                      setDrillToAssign(item);
                                      setShowAssignSessionDialog(true);
                                    }}
                                    favouriteDrillIds={favouriteDrillIds}
                                    toggleFavouriteDrill={toggleFavouriteDrill}
                                    onUpdatePracticeDrill={updatePracticeDrill}
                                    onRemoveDrillFromPlan={removeDrillFromPlan}
                                    onShowCompleteDialog={() => setShowCompleteDrillDialog({ isOpen: true, planIndex: itemIndex })}
                                    onCompleteAgain={onCompleteAgain}
                                    activeDrillReflection={activeDrillReflection}
                                    drillClarifyingQuestions={drillClarifyingQuestions}
                                    isFetchingDrillQuestions={isFetchingDrillQuestions}
                                    onFetchDrillQuestions={handleFetchDrillClarifyingQuestions}
                                    drillClarifyingAnswers={drillClarifyingAnswers}
                                    onUpdateDrillClarifyingAnswers={(index, answers) => setDrillClarifyingAnswers(prev => ({...prev, [index]: answers}))}
                                    aiDrillModifications={aiDrillModifications}
                                    isFetchingDrillModifications={isFetchingDrillModifications}
                                    triggerFetchAIModificationsForDrill={triggerFetchAIModificationsForDrill}
                                    identifiedAreasOfPotential={identifiedAreasOfPotential}
                                  />;
                            })}
                        </div>
                    ) : (
                         <InfoMessageCard
                            title="No Unassigned Drills"
                            message="Add drills from the 'The Briefing' page to start building your practice plan."
                            actionButtonLabel="View Recommended Drills"
                            onActionClick={() => setCurrentPage('drills')}
                            icon={<ListChecks size={48} className="text-muted-foreground" />}
                          />
                    )}
                </TabsContent>
                <TabsContent value="sessions" className="mt-4">
                     <div className="text-center mb-6">
                        <Button onClick={() => {
                            setDrillToAssign(null); 
                            setShowAssignSessionDialog(true);
                        }}>
                           <PlusCircle className="mr-2" /> Create New Session
                        </Button>
                     </div>
                     {sessionsWithDrills.length > 0 ? (
                        <div className="space-y-6">
                          {sessionsWithDrills.map(session => (
                              <div key={session.id} className="p-4 rounded-lg shadow bg-card border border-primary">
                                  <div className="flex justify-between items-center mb-2">
                                      <div>
                                          <h4 className="text-lg font-semibold text-foreground">{session.name}</h4>
                                          {session.sessionDate && <p className="text-xs text-muted-foreground">{format(parseISO(session.sessionDate), 'PPPP')}</p>}
                                      </div>
                                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setSessionToDelete(session)}>
                                        <Trash2 size={18} />
                                      </Button>
                                  </div>
                                  <div className="space-y-4 mt-4">
                                       {session.drills.length > 0 ? session.drills.map(item => {
                                          const drill = drills.find(d => d.id === item.drillId);
                                          const itemIndex = practicePlan.findIndex(p => p.id === item.id);
                                          if (!drill || itemIndex === -1) return null;
                                          return <PracticeDrillItemComponent
                                              key={`session-${session.id}-${item.id}`} 
                                              item={item} 
                                              drillDetails={drill} 
                                              itemPlanIndex={itemIndex}
                                              onAssignToSession={() => {}}
                                              favouriteDrillIds={favouriteDrillIds}
                                              toggleFavouriteDrill={toggleFavouriteDrill}
                                              onUpdatePracticeDrill={updatePracticeDrill}
                                              onRemoveDrillFromPlan={removeDrillFromPlan}
                                              onShowCompleteDialog={() => setShowCompleteDrillDialog({ isOpen: true, planIndex: itemIndex })}
                                              onCompleteAgain={onCompleteAgain}
                                              activeDrillReflection={activeDrillReflection}
                                              drillClarifyingQuestions={drillClarifyingQuestions}
                                              isFetchingDrillQuestions={isFetchingDrillQuestions}
                                              onFetchDrillQuestions={handleFetchDrillClarifyingQuestions}
                                              drillClarifyingAnswers={drillClarifyingAnswers}
                                              onUpdateDrillClarifyingAnswers={(index, answers) => setDrillClarifyingAnswers(prev => ({...prev, [index]: answers}))}
                                              aiDrillModifications={aiDrillModifications}
                                              isFetchingDrillModifications={isFetchingDrillModifications}
                                              triggerFetchAIModificationsForDrill={triggerFetchAIModificationsForDrill}
                                              identifiedAreasOfPotential={identifiedAreasOfPotential}
                                          />;
                                      }) : <p className="text-sm text-center text-muted-foreground py-4">No drills assigned to this session yet.</p>}
                                  </div>
                              </div>
                          ))}
                        </div>
                     ) : (
                        <InfoMessageCard
                            title="No Planned Sessions"
                            message="Create a session to organize your unassigned drills into a structured practice."
                            icon={<CalendarDays size={48} className="text-muted-foreground" />}
                        />
                     )}
                </TabsContent>
            </Tabs>

            {/* Completed Drills (Optional Section) */}
            {completedDrills.length > 0 && (
              <div className="mt-12">
                <Accordion type="single" collapsible>
                  <AccordionItem value="completed">
                    <AccordionTrigger>
                      <h3 className="text-xl font-semibold text-foreground font-headline">
                        Completed Drills ({completedDrills.length})
                      </h3>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      {completedDrills.sort((a,b) => new Date(b.dateCompleted!).getTime() - new Date(a.dateCompleted!).getTime()).map(item => {
                        const drill = drills.find(d => d.id === item.drillId);
                        const itemIndex = practicePlan.findIndex(p => p.id === item.id);
                        if (!drill || itemIndex === -1) return null;
                        return <PracticeDrillItemComponent
                            key={`completed-${item.id}`}
                            item={item}
                            drillDetails={drill}
                            itemPlanIndex={itemIndex}
                            isCompletedTab={true}
                            onAssignToSession={() => {}}
                            favouriteDrillIds={favouriteDrillIds}
                            toggleFavouriteDrill={toggleFavouriteDrill}
                            onUpdatePracticeDrill={updatePracticeDrill}
                            onRemoveDrillFromPlan={removeDrillFromPlan}
                            onShowCompleteDialog={() => {}}
                            onCompleteAgain={onCompleteAgain}
                            activeDrillReflection={activeDrillReflection}
                            drillClarifyingQuestions={drillClarifyingQuestions}
                            isFetchingDrillQuestions={isFetchingDrillQuestions}
                            onFetchDrillQuestions={handleFetchDrillClarifyingQuestions}
                            drillClarifyingAnswers={drillClarifyingAnswers}
                            onUpdateDrillClarifyingAnswers={(index, answers) => setDrillClarifyingAnswers(prev => ({...prev, [index]: answers}))}
                            aiDrillModifications={aiDrillModifications}
                            isFetchingDrillModifications={isFetchingDrillModifications}
                            triggerFetchAIModificationsForDrill={triggerFetchAIModificationsForDrill}
                            identifiedAreasOfPotential={identifiedAreasOfPotential}
                        />;
                      })}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </CustomCard>
        );
        break;
      }
    case 'journal': {
       if (!hasLoggedRounds && journalEntries.length === 0) {
        pageContent = (
           <InfoMessageCard
              title="Your Journal Awaits"
              message="Log rounds and complete practice drills with notes to see your reflections and progress here."
              actionButtonLabel="Log First Round"
              onActionClick={() => setCurrentPage('inputRoundChoice', true)}
              icon={<NotebookText size={48} className="text-muted-foreground"/>}
          />
        );
      } else if (journalEntries.length === 0) {
          pageContent = (
              <InfoMessageCard
                  title="Journal is Empty"
                  message="Complete practice drills and add notes. Your notes will appear here as journal entries."
                  actionButtonLabel="Go to The Agenda"
                  onActionClick={() => setCurrentPage('practice')}
                  icon={<NotebookText size={48} className="text-muted-foreground"/>}
              />
          );
      } else {
        const journalEntryTypes = {
            all: "All Entries",
            round: "Rounds & Reflections",
            drill: "Drill Notes",
            checkIn: "Coach Check-ins",
            preRound: "Pre-Round Briefings"
        };
        const getEntryTypeAndIcon = (entry: JournalEntry) => {
            if (entry.drillName === "Coach's response and advice") return {type: 'round', icon: <MessageSquareText size={16} className="mr-2 text-foreground"/> };
            if (entry.drillName === 'User Round Reflection') return { type: 'round', icon: <Flag size={16} className="mr-2 text-foreground"/> };
            if (entry.drillName === "Check in with Coach") return { type: 'checkIn', icon: <ClipboardList size={16} className="mr-2 text-foreground"/> };
            if (entry.drillName === "Pre-round Advice") return { type: 'preRound', icon: <NotebookText size={16} className="mr-2 text-foreground"/> };
            return { type: 'drill', icon: <CheckCheck size={16} className="mr-2 text-foreground"/> };
        };

        const sortEntries = (entries: JournalEntry[]) => {
          return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        };

        const filteredAndSortedEntries = sortEntries(
            journalFilter === 'all' 
                ? journalEntries
                : journalEntries.filter(entry => getEntryTypeAndIcon(entry).type === journalFilter)
        );
        
        pageContent = (
          <CustomCard>
            <h2 className="text-2xl font-bold mb-6 text-center font-headline text-foreground">My Planner</h2>

            <div className="mb-6">
                <Select value={journalFilter} onValueChange={setJournalFilter}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter entries..." />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(journalEntryTypes).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <Accordion type="single" collapsible className="w-full space-y-4">
              {filteredAndSortedEntries.map(entry => {
                const isRoundLinkedEntry = !!entry.roundId || 
                  entry.drillName === "Coach's response and advice" || 
                  entry.drillName === "Check in with Coach" ||
                  entry.drillName === "Pre-round Advice" ||
                  entry.drillName === "User Round Reflection";

                let displayTitle = entry.drillName;
                if (entry.drillName === 'User Round Reflection' && entry.roundId) {
                  const relatedRound = rounds.find(r => r.id === entry.roundId);
                  displayTitle = relatedRound ? `Round at ${relatedRound.courseName}` : "Round Reflection";
                }
                const notesPreview = entry.notes.split(/\s+/).slice(0, 50).join(' ') + (entry.notes.split(/\s+/).length > 50 ? '...' : '');

                const { icon } = getEntryTypeAndIcon(entry);

                return (
                  <AccordionItem key={entry.id} value={entry.id!} className="p-4 rounded-lg shadow bg-card border border-border">
                    <AccordionTrigger className="w-full text-left hover:no-underline p-0">
                      <div className="flex justify-between items-start w-full overflow-hidden">
                          <div className="flex-1 pr-2 overflow-hidden">
                              <h4 className="font-semibold text-foreground flex items-center truncate">{icon}{displayTitle}</h4>
                              <p className="text-xs text-muted-foreground flex items-center mt-1">
                                  <CalendarDays size={14} className="mr-1.5"/>
                                  {format(new Date(entry.date), 'PPp')}
                              </p>
                              <p className="text-sm text-muted-foreground mt-2 italic pr-4 truncate">
                                {notesPreview}
                              </p>
                          </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{entry.notes}</p>
                        <div className="flex items-center gap-1 mt-4 border-t border-border pt-2">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {e.stopPropagation(); handleStartEditRound(entry)}} disabled={!isRoundLinkedEntry}>
                                <Edit3 className="w-4 h-4 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {e.stopPropagation(); setEntryToDelete(entry)}}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
            {filteredAndSortedEntries.length === 0 && (
                <p className="text-center text-muted-foreground mt-6">No entries found for this filter.</p>
            )}
          </CustomCard>
        );
      }
      break;
    }
    case 'library': {
      let filteredLibraryDrills = drills;
      if (selectedLibraryCategory) {
        if (selectedLibraryCategory === "Favourites") {
          filteredLibraryDrills = drills.filter(drill => favouriteDrillIds.includes(drill.id));
        } else {
          const mappedCategory = categoryMapping[selectedLibraryCategory] || selectedLibraryCategory;
          filteredLibraryDrills = drills.filter(drill => drill.category === mappedCategory);
        }
      }

      pageContent = (
        <CustomCard>
          <h2 className="text-2xl font-bold mb-6 text-center font-headline text-foreground">Drill Library</h2>

          {selectedLibraryCategory ? (
            <>
              <Button
                  onClick={() => setSelectedLibraryCategory(null)}
                  variant="ghost"
                  className="mb-4 text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <ChevronLeft size={18} className="mr-2" /> Back to All Areas of Potential
              </Button>
              <h3 className="text-xl font-semibold mb-4 text-foreground font-headline">
                Drills for: {selectedLibraryCategory}
              </h3>
              <div className="space-y-4">
                {filteredLibraryDrills
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(drill => (
                    <DrillCardComponent 
                        key={`lib-filter-${drill.id}`} 
                        drill={drill} 
                        isRecommended={false} 
                        isTopRecommended={false} 
                        favouriteDrillIds={favouriteDrillIds} 
                        toggleFavouriteDrill={toggleFavouriteDrill}
                        practicePlan={practicePlan}
                        completedDrillHistory={completedDrillHistory}
                        aiDrillModifications={aiDrillModifications}
                        isFetchingDrillModifications={isFetchingDrillModifications}
                        triggerFetchAIModificationsForDrill={triggerFetchAIModificationsForDrill}
                        identifiedAreasOfPotential={identifiedAreasOfPotential}
                        addDrillToPlan={addDrillToPlan}
                        currentPage={_currentPage}
                    />
                ))}
                {filteredLibraryDrills.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No drills found for this category{(selectedLibraryCategory === "Favourites" && favouriteDrillIds.length === 0) ? ", or no drills marked as favourite yet." : "."}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-center text-muted-foreground mb-6">
                Browse drills by selecting a category below.
              </p>
              {libraryDisplayCategories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {libraryDisplayCategories.map(category => (
                    <Button
                      key={category}
                      variant="outline"
                      onClick={() => setSelectedLibraryCategory(category)}
                      className="justify-start text-left py-3 h-auto border-primary hover:bg-accent hover:text-accent-foreground"
                    >
                      {category === "Favourites" && <Star size={16} className="mr-2 text-yellow-500 fill-yellow-400" />}
                      {category}
                    </Button>
                  ))}
                </div>
              ) : (
                 <p className="text-center text-muted-foreground py-4">No drill categories available to filter by.</p>
              )}
              <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-xl font-semibold mb-4 text-foreground font-headline text-center">All Drills</h3>
                   <div className="space-y-4">
                      {drills.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)).map((drill) => (
                         <DrillCardComponent 
                            key={`lib-all-${drill.id}`} 
                            drill={drill} 
                            isRecommended={false} 
                            isTopRecommended={false} 
                            favouriteDrillIds={favouriteDrillIds} 
                            toggleFavouriteDrill={toggleFavouriteDrill}
                            practicePlan={practicePlan}
                            completedDrillHistory={completedDrillHistory}
                            aiDrillModifications={aiDrillModifications}
                            isFetchingDrillModifications={isFetchingDrillModifications}
                            triggerFetchAIModificationsForDrill={triggerFetchAIModificationsForDrill}
                            identifiedAreasOfPotential={identifiedAreasOfPotential}
                            addDrillToPlan={addDrillToPlan}
                            currentPage={_currentPage}
                         />
                      ))}
                  </div>
              </div>
            </>
          )}
        </CustomCard>
      );
      break;
    }
     case 'achievements': {
      const achievementMap = new Map(initialAchievements.map(ach => [ach.id, ach]));
      const groupedAchievements: { [key: string]: Achievement[] } = {
        "Getting Started": ['ach_first_round', 'ach_profile_complete', 'ach_top_fan'].map(id => achievementMap.get(id!)).filter(Boolean) as Achievement[],
        "#PracticeWithPurpose": ['ach_sim_specialist_1', 'ach_sim_specialist_2', 'ach_sim_specialist_3', 'ach_practice_pro_1', 'ach_practice_pro_2', 'ach_practice_pro_3', 'ach_practice_pro_4', 'ach_library_unlocked', 'ach_mental_fortitude'].map(id => achievementMap.get(id!)).filter(Boolean) as Achievement[],
        "Performance Milestones": ['ach_century_breaker', 'ach_bogey_golfer', 'ach_birdie_machine', 'ach_par_breaker', 'ach_fairway_machine_1', 'ach_fairway_machine_2', 'ach_fairway_machine_3', 'ach_green_seeker_1', 'ach_green_seeker_2', 'ach_green_seeker_3', 'ach_sand_save_specialist_1', 'ach_sand_save_specialist_2', 'ach_sand_save_specialist_3', 'ach_one_putt_master', 'ach_no_3_putts_18_holes'].map(id => achievementMap.get(id!)).filter(Boolean) as Achievement[],
        "Course Explorer": ['ach_course_explorer_1', 'ach_course_explorer_2', 'ach_course_explorer_3'].map(id => achievementMap.get(id!)).filter(Boolean) as Achievement[],
      };

      pageContent = (
        <CustomCard>
          <h2 className="text-2xl font-bold mb-6 text-center font-headline text-foreground">Your Achievements</h2>
          
          {Object.entries(groupedAchievements).map(([groupName, achievementsInGroup]) => (
            <div key={groupName} className="mb-10">
              <h3 className="text-xl font-semibold mb-6 text-center font-headline text-foreground">{groupName}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-8 gap-x-4">
                {achievementsInGroup.map(ach => {
                  const unlocked = ach.isUnlocked(achievementData);
                  const prerequisiteUnlocked = ach.dependsOn ? initialAchievements.find(a => a.id === ach.dependsOn)?.isUnlocked(achievementData) : true;
                  const progressData = ach.progress ? ach.progress(achievementData) : null;
                  const isNew = newlyUnlockedAchievementIds.includes(ach.id) && !seenAchievements.has(ach.id);
                  const showProgress = progressData && !unlocked && prerequisiteUnlocked;
                  const progressPercentage = showProgress
                      ? (progressData.current / progressData.target) * 100
                      : (unlocked ? 100 : 0);
                  const circumference = 2 * Math.PI * 15.9155; 
                  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

                  return (
                    <div 
                      key={ach.id} 
                      className={cn(
                        "flex flex-col items-center text-center gap-2 p-2 relative",
                        unlocked ? "cursor-pointer hover:bg-secondary rounded-lg" : "cursor-default",
                        isNew && "animate-pulse"
                      )}
                      onClick={() => unlocked && ach.getInstances && setSelectedAchievement(ach)}
                    >
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle
                            cx="18" cy="18" r="15.9155"
                            className="stroke-current text-secondary"
                            strokeWidth="3" fill="transparent"
                          />
                          {(showProgress || unlocked) && (
                            <circle
                              cx="18" cy="18" r="15.9155"
                              className={cn(
                                "stroke-current transition-all duration-500",
                                unlocked ? "text-success" : "text-primary"
                              )}
                              strokeWidth="3" fill="transparent"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                            />
                          )}
                        </svg>

                        <div className={cn("absolute inset-0 flex items-center justify-center", isNew && "ring-2 ring-destructive ring-offset-2 ring-offset-background rounded-full")}>
                          <div className={cn(
                            "w-[75%] h-[75%] rounded-full flex items-center justify-center transition-colors",
                            unlocked ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground"
                          )}>
                            <DynamicLucideIcon name={ach.icon} size={28} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={cn("text-base font-semibold flex items-center justify-center gap-1.5", unlocked ? "text-success" : "text-foreground")}>
                          {ach.name}
                          {unlocked && <CheckCircle size={14} />}
                        </h3>
                        <p className={cn("text-xs max-w-[150px]", unlocked ? "text-muted-foreground" : "text-muted-foreground/70")}>{ach.description}</p>
                        {showProgress && (
                          <p className="text-xs font-medium mt-1 text-primary">
                            {progressData.current} / {progressData.target}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {initialAchievements.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No achievements defined yet. Keep playing and practicing!</p>
          )}
        </CustomCard>
      );
      break;
    }
    case 'theLockerRoom': {
        const toggleIntro = () => {
            const newState = !isLockerRoomIntroExpanded;
            setIsLockerRoomIntroExpanded(newState);
            if (!newState) {
                localStorage.setItem(LOCKER_ROOM_INTRO_SEEN_KEY, 'true');
            }
        };

        pageContent = (
            <CustomCard>
                <h2 className="text-2xl font-bold mb-4 text-center font-headline text-foreground">The Locker Room</h2>
                
                <div className="mb-6 p-4 rounded-lg border border-primary/30 bg-card">
                  <div className={cn("text-sm text-foreground/90 space-y-3 transition-all duration-300 ease-in-out", isLockerRoomIntroExpanded ? "max-h-96" : "max-h-12 overflow-hidden")}>
                      <p>Welcome to The Locker Room, your personal library for game improvement. We believe that getting better at golf isn't just about what you do on the range; it's also about how you think, prepare, and look after your game.</p>
                      <p>Here you'll find a growing collection of short, audio sessions designed to fit into your day, whether you're commuting, at the gym, or relaxing at home.</p>
                      <p className="font-semibold">How It Works:</p>
                      <ul className="list-disc pl-5 space-y-1">
                          <li><span className="font-medium">Practice That Counts:</span> Improving your golf IQ is a vital part of practice. Listening to any session in The Locker Room counts as one completed drill towards your practice target on the Home page. It's the perfect way to make progress, even on a rainy day.</li>
                          <li><span className="font-medium">Unlock Your Path:</span> To keep your learning focused, new sessions are unlocked in sets. Simply complete the three available sessions in any category to unlock the next set of three. This ensures you're building your knowledge one step at a time.</li>
                      </ul>
                  </div>
                  {!isLockerRoomIntroExpanded && (
                       <Button onClick={toggleIntro} variant="link" className="text-primary p-0 h-auto mt-2">
                          Read More <ChevronDown className="w-4 h-4 ml-1" />
                      </Button>
                  )}
                </div>

                {audioDrills.length > 0 ? (
                    <div className="space-y-6">
                    {audioDrills.map((drill, index) => (
                        <DrillCardComponent
                            key={`audio-${drill.id}`}
                            drill={drill}
                            isRecommended={false}
                            isTopRecommended={false}
                            favouriteDrillIds={favouriteDrillIds}
                            toggleFavouriteDrill={toggleFavouriteDrill}
                            practicePlan={practicePlan}
                            completedDrillHistory={completedDrillHistory}
                            aiDrillModifications={aiDrillModifications}
                            isFetchingDrillModifications={isFetchingDrillModifications}
                            triggerFetchAIModificationsForDrill={triggerFetchAIModificationsForDrill}
                            identifiedAreasOfPotential={identifiedAreasOfPotential}
                            addDrillToPlan={addDrillToPlan}
                            currentPage={_currentPage}
                            isLocked={index >= unlockedAudioDrillCount}
                        />
                    ))}
                    </div>
                ) : (
                    <InfoMessageCard
                    title="The Locker Room is Empty"
                    message="No audio sessions are available at the moment. Check back later!"
                    icon={<Headphones size={48} className="text-muted-foreground"/>}
                    />
                )}
            </CustomCard>
        );
        break;
    }
    case 'profile': {
      pageContent = (
        <CustomCard>
            <h2 className="text-2xl font-bold mb-6 text-center font-headline text-foreground">My Profile & Settings</h2>

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-center font-headline text-foreground">The essentials</h3>
                    <InputField
                        label="Display Name"
                        name="displayName"
                        value={profileDisplayName}
                        onChange={(e) => setProfileDisplayName(e.target.value)}
                        placeholder="Your name"
                    />
                    <InputField
                        label="Current Handicap"
                        name="currentHandicap"
                        value={profileCurrentHandicap}
                        onChange={(e) => setProfileCurrentHandicap(e.target.value)}
                        placeholder="e.g., 18.3 or +2"
                        inputMode="decimal"
                    />
                    <InputField
                        label="Target Handicap"
                        name="targetHandicap"
                        value={profileTargetHandicap}
                        onChange={(e) => setProfileTargetHandicap(e.target.value)}
                        placeholder="e.g., 15 (whole numbers)"
                        inputMode="numeric"
                    />
                    <div className="mb-4">
                        <ShadLabel htmlFor="primaryGoal" className="block text-sm font-medium mb-1 text-foreground">Primary Golf Goal</ShadLabel>
                        <Select
                            name="primaryGoal"
                            value={profilePrimaryGoal}
                            onValueChange={(value) => setProfilePrimaryGoal(value)}
                        >
                            <SelectTrigger id="primaryGoal" className="w-full mt-1">
                                <SelectValue placeholder="Select your main goal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Break 100">Break 100</SelectItem>
                                <SelectItem value="Break 90">Break 90</SelectItem>
                                <SelectItem value="Break 80">Break 80</SelectItem>
                                <SelectItem value="Win Club Championship">Win Club Championship</SelectItem>
                                <SelectItem value="Fix my slice">Fix my slice</SelectItem>
                                <SelectItem value="Increase Driving Distance">Increase Driving Distance</SelectItem>
                                <SelectItem value="Improve Consistency">Improve Consistency</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mb-4">
                        <ShadLabel className="block text-sm font-medium mb-1 text-foreground">Handedness</ShadLabel>
                        <RadioGroup
                            name="handedness"
                            value={profileHandedness}
                            onValueChange={(value: string) => setProfileHandedness(value as 'Right' | 'Left')}
                            className="flex gap-x-4 mt-1"
                        >
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Right" id="handRight" /><ShadLabel htmlFor="handRight" className="text-sm text-foreground">Right</ShadLabel></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Left" id="handLeft" /><ShadLabel htmlFor="handLeft" className="text-sm text-foreground">Left</ShadLabel></div>
                        </RadioGroup>
                    </div>
                </div>

                <Separator className="my-6" />

                <div>
                    <h3 className="text-lg font-semibold mb-4 text-center font-headline text-foreground">Appearance</h3>
                     <div className="p-4 border rounded-lg">
                        <ShadLabel className="block text-sm font-medium mb-2 text-foreground">Theme</ShadLabel>
                        <Tabs defaultValue="system" className="w-full" onValueChange={setTheme}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="light"><Sun className="mr-2" />Light</TabsTrigger>
                                <TabsTrigger value="dark"><Moon className="mr-2" />Dark</TabsTrigger>
                                <TabsTrigger value="system">System</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                <Separator className="my-6" />

                 <div>
                    <h3 className="text-lg font-semibold mb-4 text-center font-headline text-foreground">Notifications</h3>
                    <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">Enable push notifications to get reminders for your practice sessions and updates from your coach.</p>
                        <Button onClick={handleEnableNotifications} disabled={notificationStatus !== 'default'} className="w-full">
                           {notificationStatus === 'loading' && <Loader2 className="animate-spin mr-2" />}
                           {notificationStatus === 'enabled' && <CheckCircle className="mr-2" />}
                           {notificationStatus === 'denied' && <X className="mr-2" />}
                           {notificationStatus === 'default' && <Bell className="mr-2" />}
                           {
                                {
                                'loading': 'Enabling...',
                                'enabled': 'Notifications Enabled',
                                'denied': 'Permission Denied',
                                'default': 'Enable Notifications'
                                }[notificationStatus]
                           }
                        </Button>
                    </div>
                </div>

                <Separator className="my-6" />

                <div>
                    <h3 className="text-lg font-semibold mb-4 text-center font-headline text-foreground">Your performance profile</h3>
                    <TextAreaField
                        label="Self-Assessed Strengths"
                        name="strengths"
                        value={profileStrengths}
                        onChange={(e) => setProfileStrengths(e.target.value)}
                        placeholder="e.g., Driving distance, putting from 5-10 feet..."
                        rows={3}
                    />
                    <TextAreaField
                        label="Self-Assessed Weaknesses"
                        name="weaknesses"
                        value={profileWeaknesses}
                        onChange={(e) => setProfileWeaknesses(e.target.value)}
                        placeholder="e.g., Slicing my driver, 3-putts, chipping..."
                        rows={3}
                    />
                    <div className="my-4">
                        <p className="block text-sm font-medium mb-2 text-foreground">Typical Club Distances (Yards)</p>
                        <div className="grid grid-cols-3 gap-2">
                           <InputField label="Driver" name="driverDistance" value={profileDriverDistance} onChange={(e) => setProfileDriverDistance(e.target.value)} inputMode="numeric" />
                           <InputField label="7-Iron" name="sevenIronDistance" value={profile7IronDistance} onChange={(e) => setProfile7IronDistance(e.target.value)} inputMode="numeric" />
                           <InputField label="PW" name="pitchingWedgeDistance" value={profilePWDistance} onChange={(e) => setProfilePWDistance(e.target.value)} inputMode="numeric" />
                        </div>
                    </div>
                     <div className="mb-4">
                        <ShadLabel htmlFor="practiceHours" className="block text-sm font-medium mb-1 text-foreground">Practice Availability</ShadLabel>
                        <Select
                            name="practiceHours"
                            value={profilePracticeHours}
                            onValueChange={(value) => setProfilePracticeHours(value)}
                        >
                            <SelectTrigger id="practiceHours" className="w-full mt-1">
                                <SelectValue placeholder="Hours per week" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1-2">1-2 hours / week</SelectItem>
                                <SelectItem value="3-4">3-4 hours / week</SelectItem>
                                <SelectItem value="5+">5+ hours / week</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="mb-4">
                        <ShadLabel className="block text-sm font-medium mb-1 text-foreground">Available Facilities</ShadLabel>
                         <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                            {practiceFacilitiesOptions.map(facility => (
                                <div key={facility} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`facility-${facility.replace(/\s+/g, '-')}`}
                                        checked={profileFacilities.includes(facility)}
                                        onCheckedChange={(checked) => handleFacilityChange(facility, !!checked)}
                                    />
                                    <ShadLabel htmlFor={`facility-${facility.replace(/\s+/g, '-')}`} className="text-sm font-normal text-foreground">{facility}</ShadLabel>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <Separator className="my-6" />

                <div>
                    <h3 className="text-lg font-semibold mb-4 text-center font-headline text-foreground">More about you</h3>
                    
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={profilePictureUrl || "https://placehold.co/100x100.png"} alt={profileDisplayName || ""} data-ai-hint="profile avatar" />
                            <AvatarFallback>{profileDisplayName?.charAt(0)?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline" onClick={() => setShowUploadInfoDialog(true)}>
                            <Upload size={16} className="mr-2" />
                            Upload Picture
                        </Button>
                    </div>

                    <InputField
                        label="Home Club (Optional)"
                        name="homeClub"
                        value={profileHomeClub}
                        onChange={(e) => setProfileHomeClub(e.target.value)}
                        placeholder="e.g., Augusta National Golf Club"
                    />

                    <div className="mt-6">
                        <p className="block text-sm font-medium mb-2 text-foreground">What's in the Bag? (Optional)</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Driver" name="bagDriver" value={profileBagDriver} onChange={(e) => setProfileBagDriver(e.target.value)} placeholder="e.g., Titleist TSR2" />
                            <InputField label="Woods" name="bagWoods" value={profileBagWoods} onChange={(e) => setProfileBagWoods(e.target.value)} placeholder="e.g., TaylorMade Qi10 3W" />
                            <InputField label="Hybrids" name="bagHybrids" value={profileBagHybrids} onChange={(e) => setProfileBagHybrids(e.target.value)} placeholder="e.g., Callaway Apex UW 19°" />
                            <InputField label="Irons" name="bagIrons" value={profileBagIrons} onChange={(e) => setProfileBagIrons(e.target.value)} placeholder="e.g., Mizuno Pro 245 4-PW" />
                            <InputField label="Wedges" name="bagWedges" value={profileBagWedges} onChange={(e) => setProfileBagWedges(e.target.value)} placeholder="e.g., Vokey SM9 52°, 56°, 60°" />
                            <InputField label="Putter" name="bagPutter" value={profileBagPutter} onChange={(e) => setProfileBagPutter(e.target.value)} placeholder="e.g., Scotty Cameron Newport 2" />
                        </div>
                    </div>
                </div>

            </div>
            
            <Button onClick={handleUpdateProfile} disabled={isSavingProfile || !isProfileChanged} className="w-full mt-6" variant="success">
                {isSavingProfile ? <Loader2 className="animate-spin" /> : "Save Changes"}
            </Button>
        </CustomCard>
      );
      break;
    }
    default: {
      pageContent = <CustomCard><p className="text-center text-destructive">Page not found. Please select a page from the navigation.</p></CustomCard>;
      break;
    }
  }

  return (
    <div className="min-h-screen relative bg-background">
      <div className="relative z-10 flex flex-col min-h-screen pb-16">
        <header className={cn(
            "p-1 shadow-md sticky top-0 z-50 bg-accent text-accent-foreground transition-all duration-300 ease-in-out",
             isHeaderScrolled ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
          )}>
            <div className="container mx-auto flex justify-between items-center h-[calc(3rem*1.25)]">
              <div className="flex items-center cursor-pointer flex-shrink-0" onClick={() => setCurrentPage('dashboard')}>
                  <span className="font-pacifico text-4xl text-accent-foreground">Potentially</span>
              </div>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage('theLockerRoom')}
                  className="text-accent-foreground hover:bg-accent-foreground/10 w-12 h-12 mr-1"
                  title="The Locker Room"
                >
                  <Headphones size={28} />
                  <span className="sr-only">The Locker Room</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-accent-foreground hover:bg-accent-foreground/10 w-12 h-12">
                      <MenuIcon size={30} />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setCurrentPage('library')}
                      disabled={!libraryUnlocked}
                      className="flex items-center cursor-pointer"
                    >
                      {libraryUnlocked ? (
                        <LibrarySquare size={16} className="mr-2" />
                      ) : (
                        <LockIcon size={16} className="mr-2" />
                      )}
                      Drill Library
                      {!libraryUnlocked && (
                        <span className="ml-auto text-xs text-muted-foreground">({uniqueDrillsWithReflectionsCount}/10)</span>
                      )}
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setCurrentPage('achievements')} className="flex items-center cursor-pointer">
                      <Trophy size={16} className="mr-2" /> Achievements
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setCurrentPage('profile')} className="flex items-center cursor-pointer">
                      <UserCircle size={16} className="mr-2" /> Profile & Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setCurrentPage('dashboard'); setOnboardingStep(1); }} className="flex items-center cursor-pointer">
                        <HelpCircle size={16} className="mr-2" /> App Tour
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowAboutDialog(true)} className="flex items-center cursor-pointer">
                      <InfoIcon size={16} className="mr-2" /> About
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="flex items-center cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <LogOut size={16} className="mr-2" /> Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
        </header>

        <main {...swipeHandlers} className="p-4 sm:p-6 container mx-auto max-w-4xl flex-grow relative overflow-x-hidden">
          <AnimatePresence mode="wait" custom={navigationDirection}>
            <motion.div
              key={_currentPage}
              custom={navigationDirection}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ width: '100%' }}
            >
              {pageContent}
            </motion.div>
          </AnimatePresence>
        </main>

        {showScrollTopButton && (
          <Button
            onClick={scrollToTop}
            className="fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full p-0 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
            aria-label="Scroll to top"
            variant="default"
          >
            <ArrowUp size={24} />
          </Button>
        )}

        <div className="fixed bottom-0 left-0 right-0 z-50 bg-transparent">
           <nav className="flex items-stretch h-16">
              <NavButton page="journal" label="Journal" icon={<BookOpenText />} currentPage={_currentPage} setCurrentPage={setCurrentPage} layout="bottom" />
              <NavButton page="drills" label="Drills" icon={<LocateFixed />} currentPage={_currentPage} setCurrentPage={setCurrentPage} layout="bottom" />
              <NavButton page="dashboard" label="Dashboard" icon={<span className="font-pacifico text-4xl">P</span>} currentPage={_currentPage} setCurrentPage={setCurrentPage} layout="bottom" />
              <NavButton page="practice" label="Practice" icon={<ClipboardList />} currentPage={_currentPage} setCurrentPage={setCurrentPage} layout="bottom" />
              <NavButton page="inputRoundChoice" label="Add" icon={<PlusCircle />} currentPage={_currentPage} setCurrentPage={setCurrentPage} layout="bottom" />
          </nav>
        </div>
      </div>
      <AboutDialog isOpen={showAboutDialog} onOpenChange={setShowAboutDialog} />
       {onboardingStep > 0 && (
        <OnboardingTour
          step={onboardingStep}
          onNext={handleOnboardingNext}
          onEnd={handleOnboardingEnd}
          onGoToProfile={handleGoToProfileFromTour}
        />
      )}
      <AlertDialog open={!!entryToDelete} onOpenChange={() => setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the journal entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEntryToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJournalEntry}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!sessionToDelete} onOpenChange={() => setSessionToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete Session?</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to delete the "{sessionToDelete?.name}" session? Its drills will be moved back to "Unassigned". This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSession} className={cn(buttonVariants({ variant: "destructive" }))}>Delete Session</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
       <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resume In-Progress Round?</AlertDialogTitle>
            <AlertDialogDescription>
              You have an unfinished live round saved. Would you like to resume where you left off or discard it?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={discardLiveRound}>Discard</AlertDialogCancel>
            <AlertDialogAction onClick={resumeLiveRound}>Resume Round</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showUploadInfoDialog} onOpenChange={setShowUploadInfoDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Feature Coming Soon!</AlertDialogTitle>
            <AlertDialogDescription>
              Profile picture uploads will be available in the full launch version of the app. We're excited to bring this feature to you soon!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowUploadInfoDialog(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showScorecardDialog} onOpenChange={setShowScorecardDialog}>
          <AlertDialogContent className="max-w-lg w-full">
              <AlertDialogHeader>
                  <AlertDialogTitle>Existing Scorecard Found</AlertDialogTitle>
                  <AlertDialogDescription>
                      A scorecard for {foundScorecard?.courseName} ({foundScorecard?.teeColor} tees) already exists. Would you like to use it?
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="max-h-60 overflow-y-auto pr-2">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead className="text-center">Hole</TableHead>
                              <TableHead className="text-center">Par</TableHead>
                              <TableHead className="text-center">Yardage</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {foundScorecard?.holeData.map((hole) => (
                              <TableRow key={hole.hole}>
                                  <TableCell className="text-center">{hole.hole}</TableCell>
                                  <TableCell className="text-center">{hole.par}</TableCell>
                                  <TableCell className="text-center">{hole.yardage}</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </div>
              <AlertDialogFooter className="mt-4">
                  <AlertDialogCancel onClick={startManualScorecardEntry}>Enter Manually</AlertDialogCancel>
                  <AlertDialogAction onClick={useFoundScorecard}>Use this Scorecard</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      <AlertDialog 
        open={showConfirmationDialog.isOpen} 
        onOpenChange={(isOpen) => setShowConfirmationDialog({ isOpen, type: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No New Activity Logged</AlertDialogTitle>
            <AlertDialogDescription>
              You haven't logged a new round or practice session since your last {showConfirmationDialog.type === 'checkIn' ? 'check-in' : 'briefing'}. 
              The advice may be similar to what you've already received.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button 
                  variant="outline" 
                  onClick={() => {
                      setShowConfirmationDialog({ isOpen: false, type: null });
                      setCurrentPage('journal');
                  }}
                  className="w-full sm:w-auto"
              >
                  Go to Journal
              </Button>
              <Button 
                  variant="default" 
                  onClick={() => {
                      setShowConfirmationDialog({ isOpen: false, type: null });
                      if (showConfirmationDialog.type === 'checkIn') {
                          triggerFetchCoachCheckIn();
                      } else if (showConfirmationDialog.type === 'preRound') {
                          setCurrentPage('preRoundCheckIn');
                      }
                  }}
                  className="w-full sm:w-auto"
              >
                  Get Advice Anyway
              </Button>
            <AlertDialogCancel className="w-full sm:w-auto mt-0" onClick={() => setShowConfirmationDialog({ isOpen: false, type: null })}>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
       <AlertDialog open={showCoachDialog} onOpenChange={setShowCoachDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Speak to Coach</AlertDialogTitle>
            <AlertDialogDescription>
              What would you like to talk about?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
             <Button 
                variant="outline" 
                onClick={() => {
                  if (!activityStatus.checkIn) {
                    setShowConfirmationDialog({ isOpen: true, type: 'checkIn' });
                  } else {
                    triggerFetchCoachCheckIn();
                  }
                }}
                className="w-full sm:w-auto"
            >
                Get a Progress Check-in
            </Button>
            <Button 
                variant="default" 
                onClick={() => {
                  setShowCoachDialog(false);
                   if (!activityStatus.preRound) {
                     setShowConfirmationDialog({ isOpen: true, type: 'preRound' });
                  } else {
                    setCurrentPage('preRoundCheckIn');
                  }
                }}
                className="w-full sm:w-auto"
            >
                Get Pre-round Advice
            </Button>
            <AlertDialogCancel className="w-full sm:w-auto mt-0">Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={showCompleteDrillDialog.isOpen}
        onOpenChange={(isOpen) => setShowCompleteDrillDialog({ isOpen, planIndex: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Drill Session Complete!</AlertDialogTitle>
            <AlertDialogDescription>
              Great work. What's next?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (showCompleteDrillDialog.planIndex !== null) {
                  const item = practicePlan[showCompleteDrillDialog.planIndex];
                  if (item) onCompleteAgain(item.drillId);
                }
              }}
            >
              <Repeat className="mr-2" /> Complete Again
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (showCompleteDrillDialog.planIndex !== null) {
                    toggleCompleteDrill(showCompleteDrillDialog.planIndex);
                } else {
                    setShowCompleteDrillDialog({ isOpen: false, planIndex: null });
                }
              }}
            >
              Back to The Agenda <ChevronRight className="ml-2" />
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={showAssignSessionDialog} onOpenChange={setShowAssignSessionDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{drillToAssign ? 'Assign Drill to Session' : 'Create New Session'}</DialogTitle>
            </DialogHeader>
            {drillToAssign && drillDetails && <p className="text-sm text-muted-foreground">Assigning: <span className="font-bold text-foreground">{drillDetails.name}</span></p>}
            <div className="space-y-4 py-4">
                {drillToAssign && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Existing Sessions</h4>
                      {practiceSessions.filter(s => !s.isCompleted).length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {practiceSessions.filter(s => !s.isCompleted).map(session => (
                                <Button key={session.id} variant="outline" onClick={() => handleAssignDrillToSession(session.id)}>
                                    {session.name} {session.sessionDate && `(${format(parseISO(session.sessionDate), 'PP')})`}
                                </Button>
                            ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No active sessions. Create one below.</p>
                      )}
                    </div>
                )}
                 {drillToAssign && <Separator />}
                <div className="space-y-2">
                    <h4 className="font-medium">Create New Session</h4>
                    <InputField
                      label="New Session Name"
                      name="newSessionName"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      placeholder="e.g., Tuesday Range Work"
                    />
                    <div className="mb-4">
                        <ShadLabel className="block text-sm font-medium text-foreground mb-1">Session Date (Optional)</ShadLabel>
                        <Popover open={isNewSessionCalendarOpen} onOpenChange={setIsNewSessionCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newSessionDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {newSessionDate ? format(newSessionDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={newSessionDate} onSelect={(date) => { setNewSessionDate(date); setIsNewSessionCalendarOpen(false); }} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Button onClick={handleCreateNewSession} disabled={isCreatingSession || !newSessionName.trim()} className="w-full">
                        {isCreatingSession ? <Loader2 className="animate-spin" /> : "Create & Assign"}
                    </Button>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent>
          {selectedAchievement && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <DynamicLucideIcon name={selectedAchievement.icon} className="text-success" />
                  {selectedAchievement.name}
                </DialogTitle>
                <DialogDescription className="pt-2">
                  {selectedAchievement.description}
                </DialogDescription>
              </DialogHeader>
              <div>
                <h4 className="font-semibold mb-2 text-foreground">Unlocked:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedAchievement.getInstances?.(achievementData).map((instance, index) => (
                    <div key={index} className="text-sm p-2 rounded-md bg-secondary/50">
                      <p className="font-medium text-foreground">{instance.description}</p>
                      <p className="text-xs text-muted-foreground">{instance.date}</p>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setSelectedAchievement(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <MainApp />;
}

    



