
"use client";

import type { LucideProps } from 'lucide-react';
import {
  Target, Goal, TrendingUp, Flag, ListChecks, GitCommit, Shuffle, HeartPulse, GitFork, PlayCircle, Settings2, GaugeCircle, CornerUpLeft, CornerUpRight, Mountain, Crosshair, Grid, MoveVertical, AlertTriangle, TrendingDown, ChevronsUp, ChevronsDown, Replace, Wind, Scissors, Copy, ArrowDownUp, Shield, Grip, Frown, SendToBack, Hand, ArrowUpRight, CircleDot, Circle, MoreVertical, Baseline, CircleDashed, EyeOff, Ruler, Star, Timer, AlignVerticalJustifyCenter, Footprints, LocateFixed, MousePointer, Eye, Scale, BookOpen, Video, Spline, ArrowDown, Plane, Undo2, ArrowDownToLine, Recycle, AppWindow, Ear, HelpCircle, Rocket, ShieldAlert, FastForward, Gauge, CircleSlash, Waves, Locate, StretchHorizontal, Trophy, Container, Send, CircleDollarSign, Lock, RailSymbol, PanelBottom, MoveDiagonal, CheckCheck, Puzzle, Pin, Camera, MoveRight, MoveHorizontal, FileBadge, Triangle, Anchor, AudioWaveform, Combine, Map, FileQuestion,
  Brain, Smile, ClipboardList, ScanLine, Headphones, // Added new icons
  HelpCircle as DefaultIcon // Fallback icon
} from 'lucide-react';
import React from 'react';

interface DynamicLucideIconProps extends LucideProps {
  name: string;
}

const iconMap: { [key: string]: React.ComponentType<LucideProps> } = {
  Target,
  Goal,
  TrendingUp,
  Flag,
  ListChecks,
  GitCommit,
  Shuffle,
  HeartPulse,
  GitFork,
  PlayCircle,
  Settings2,
  GaugeCircle,
  CornerUpLeft,
  CornerUpRight,
  Mountain,
  Crosshair,
  Grid,
  MoveVertical,
  AlertTriangle,
  TrendingDown,
  ChevronsUp,
  ChevronsDown,
  Replace,
  Wind,
  Scissors,
  Copy,
  ArrowDownUp,
  Shield,
  Grip,
  Frown,
  SendToBack,
  Hand,
  ArrowUpRight,
  CircleDot,
  Circle,
  MoreVertical,
  Baseline,
  CircleDashed,
  EyeOff,
  Ruler,
  Star,
  Timer,
  AlignVerticalJustifyCenter,
  Footprints,
  LocateFixed,
  MousePointer,
  Eye,
  Scale,
  BookOpen,
  Video,
  Spline,
  ArrowDown,
  Plane,
  Undo2,
  ArrowDownToLine,
  Recycle,
  AppWindow,
  Ear,
  HelpCircle,
  Rocket,
  ShieldAlert,
  FastForward,
  Gauge,
  CircleSlash,
  Waves,
  Locate,
  StretchHorizontal,
  Trophy,
  Container,
  Send,
  CircleDollarSign,
  Lock,
  RailSymbol,
  PanelBottom,
  MoveDiagonal,
  CheckCheck,
  Puzzle,
  Pin,
  Camera,
  MoveRight,
  MoveHorizontal,
  FileBadge,
  Triangle,
  Anchor,
  AudioWaveform,
  Combine,
  Map,
  Brain, 
  Smile, 
  ClipboardList, 
  ScanLine, 
  Headphones,
  FileQuestion,
};

export const DynamicLucideIcon: React.FC<DynamicLucideIconProps> = ({ name, ...props }) => {
  const IconComponent = iconMap[name] || DefaultIcon; 
  if (!iconMap[name]) {
    console.warn(`DynamicLucideIcon: Icon "${name}" not found, using default.`);
  }
  return <IconComponent {...props} />;
};
