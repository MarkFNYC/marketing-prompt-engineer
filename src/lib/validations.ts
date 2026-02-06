import { z } from 'zod';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email().max(255),
});

export const signupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(255),
  turnstileToken: z.string().max(4096).optional(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email().max(255),
  turnstileToken: z.string().max(4096).optional(),
});

// ─── Generate ────────────────────────────────────────────────────────────────

export const generateSchema = z.object({
  prompt: z.string().min(1).max(50000),
  mode: z.enum(['strategy', 'execution']).optional(),
  provider: z.string().max(50).optional(),
  userApiKey: z.string().max(500).optional(),
  brandContext: z.object({
    brand: z.string().max(255).optional(),
    website: z.string().max(500).optional(),
    industry: z.string().max(255).optional(),
    challenge: z.string().max(5000).optional(),
    targetAudience: z.string().max(5000).optional(),
    brandVoice: z.string().max(5000).optional(),
    persistentMandatories: z.array(z.string().max(1000)).optional(),
    persistentConstraints: z.string().max(5000).optional(),
  }).optional().nullable(),
  campaignContext: z.object({
    campaignName: z.string().max(255).optional(),
    goalType: z.string().max(255).optional(),
    goalDescription: z.string().max(5000).optional(),
    targetAudience: z.string().max(5000).optional(),
    businessProblem: z.string().max(5000).optional(),
    proposition: z.string().max(5000).optional(),
    support: z.array(z.string().max(2000)).optional(),
    tone: z.string().max(1000).optional(),
    successMetric: z.string().max(1000).optional(),
    successMetricValue: z.string().max(1000).optional(),
    timeline: z.string().max(1000).optional(),
    budget: z.string().max(1000).optional(),
    constraints: z.string().max(5000).optional(),
    campaignMandatories: z.array(z.string().max(1000)).optional(),
    selectedStrategy: z.object({
      name: z.string().max(500),
      core_message: z.string().max(2000),
      angle: z.string().max(2000),
    }).optional().nullable(),
    selectedCreativeIdea: z.object({
      name: z.string().max(500),
      summary: z.string().max(2000),
      why_it_fits: z.string().max(2000),
      tone_and_feel: z.array(z.string().max(255)).optional(),
    }).optional().nullable(),
  }).optional().nullable(),
  personaContext: z.object({
    name: z.string().max(255),
    role: z.string().max(255).optional(),
    description: z.string().max(5000).optional(),
    pain_points: z.array(z.string().max(1000)).optional(),
    goals: z.array(z.string().max(1000)).optional(),
    behaviors: z.array(z.string().max(1000)).optional(),
    preferred_channels: z.array(z.string().max(255)).optional(),
  }).optional().nullable(),
});

// ─── Creative Ideas ──────────────────────────────────────────────────────────

export const creativeIdeasSchema = z.object({
  brandContext: z.object({
    name: z.string().max(255).optional(),
    industry: z.string().max(255).optional(),
    targetAudience: z.string().max(5000).optional(),
    valueProposition: z.string().max(5000).optional(),
  }).optional().nullable(),
  businessProblem: z.string().min(1).max(5000),
  selectedStrategy: z.object({
    name: z.string().max(500),
    core_message: z.string().max(2000),
    angle: z.string().max(2000),
    rationale: z.string().max(2000).optional(),
  }),
  constraints: z.string().max(5000).optional().nullable(),
  targetAudience: z.string().max(5000).optional().nullable(),
});

// ─── Remix ───────────────────────────────────────────────────────────────────

export const remixSchema = z.object({
  originalContent: z.string().min(1).max(50000),
  personaId: z.string().min(1).max(255),
  mode: z.enum(['strategy', 'execution']).optional(),
  brandContext: z.object({
    brand: z.string().max(255).optional(),
    industry: z.string().max(255).optional(),
    challenge: z.string().max(5000).optional(),
    targetAudience: z.string().max(5000).optional(),
    brandVoice: z.string().max(5000).optional(),
  }).optional().nullable(),
  feedback: z.string().max(10000).optional().nullable(),
});

// ─── Planning Review ─────────────────────────────────────────────────────────

export const planningReviewSchema = z.object({
  problemStatement: z.string().max(5000).optional().nullable(),
  targetAudience: z.string().max(5000).optional().nullable(),
  strategy: z.object({
    name: z.string().max(500),
    core_message: z.string().max(2000),
    angle: z.string().max(2000),
    user_refinements: z.string().max(5000).optional(),
  }).optional().nullable(),
  creativeIdea: z.object({
    name: z.string().max(500),
    summary: z.string().max(2000),
    tone_and_feel: z.array(z.string().max(255)).optional(),
  }).optional().nullable(),
  mandatories: z.array(z.string().max(1000)).optional().nullable(),
  brandContext: z.object({
    name: z.string().max(255),
    industry: z.string().max(255),
  }).optional().nullable(),
  proposition: z.string().max(5000).optional().nullable(),
  support: z.array(z.string().max(2000)).optional().nullable(),
  tone: z.string().max(1000).optional().nullable(),
  constraints: z.string().max(5000).optional().nullable(),
  successMetric: z.string().max(1000).optional().nullable(),
  timeline: z.string().max(1000).optional().nullable(),
  budget: z.string().max(1000).optional().nullable(),
});

// ─── Library ─────────────────────────────────────────────────────────────────

export const libraryPostSchema = z.object({
  userId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(255),
  discipline: z.string().min(1).max(255),
  mode: z.string().min(1).max(50),
  promptGoal: z.string().max(5000).optional().nullable(),
  content: z.string().min(1).max(100000),
});

export const libraryDeleteSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().optional(),
});

// ─── Projects ────────────────────────────────────────────────────────────────

export const projectPostSchema = z.object({
  userId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  website: z.string().max(500).optional().nullable(),
  industry: z.string().min(1).max(255),
  challenge: z.string().min(1).max(5000),
  targetAudience: z.string().max(5000).optional().nullable(),
  brandVoice: z.string().max(5000).optional().nullable(),
  valueProposition: z.string().max(5000).optional().nullable(),
  persistentMandatories: z.array(z.string().max(1000)).optional().nullable(),
  persistentConstraints: z.string().max(5000).optional().nullable(),
});

export const projectPutSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().optional(),
  name: z.string().min(1).max(255).optional(),
  website: z.string().max(500).optional().nullable(),
  industry: z.string().max(255).optional(),
  challenge: z.string().max(5000).optional(),
  targetAudience: z.string().max(5000).optional().nullable(),
  brandVoice: z.string().max(5000).optional().nullable(),
  valueProposition: z.string().max(5000).optional().nullable(),
  persistentMandatories: z.array(z.string().max(1000)).optional().nullable(),
  persistentConstraints: z.string().max(5000).optional().nullable(),
});

export const projectDeleteSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().optional(),
});

// ─── Campaigns ───────────────────────────────────────────────────────────────

export const campaignPostSchema = z.object({
  userId: z.string().uuid().optional(),
  brandId: z.string().uuid(),
  name: z.string().min(1).max(255),
  mode: z.enum(['discovery', 'directed']),
  discipline: z.string().max(255).optional().nullable(),
  // Discovery Mode fields
  businessProblem: z.string().max(5000).optional().nullable(),
  successMetric: z.string().max(1000).optional().nullable(),
  successMetricValue: z.string().max(1000).optional().nullable(),
  timeline: z.string().max(1000).optional().nullable(),
  budget: z.string().max(1000).optional().nullable(),
  campaignConstraints: z.string().max(5000).optional().nullable(),
  whatBeenTried: z.string().max(5000).optional().nullable(),
  // Directed Mode fields
  goalType: z.string().max(255).optional().nullable(),
  goalDescription: z.string().max(5000).optional().nullable(),
  campaignMandatories: z.array(z.string().max(1000)).optional().nullable(),
});

export const campaignPutSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().optional(),
  name: z.string().max(255).optional(),
  mode: z.enum(['discovery', 'directed']).optional(),
  discipline: z.string().max(255).optional().nullable(),
  businessProblem: z.string().max(5000).optional().nullable(),
  successMetric: z.string().max(1000).optional().nullable(),
  successMetricValue: z.string().max(1000).optional().nullable(),
  timeline: z.string().max(1000).optional().nullable(),
  budget: z.string().max(1000).optional().nullable(),
  campaignConstraints: z.string().max(5000).optional().nullable(),
  whatBeenTried: z.string().max(5000).optional().nullable(),
  goalType: z.string().max(255).optional().nullable(),
  goalDescription: z.string().max(5000).optional().nullable(),
  campaignMandatories: z.array(z.string().max(1000)).optional().nullable(),
  messageStrategyOptions: z.any().optional(),
  selectedMessageStrategy: z.any().optional(),
  mediaStrategyOptions: z.any().optional(),
  selectedMediaStrategy: z.any().optional(),
  strategyCheckShown: z.boolean().optional(),
  strategyCheckRecommendation: z.string().max(5000).optional().nullable(),
  strategyCheckUserResponse: z.string().max(255).optional().nullable(),
  outcome: z.string().max(255).optional().nullable(),
  outcomeNotes: z.string().max(10000).optional().nullable(),
  outcomeMetrics: z.any().optional().nullable(),
  completedAt: z.string().max(255).optional().nullable(),
});

export const campaignDeleteSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().optional(),
});

// ─── Message Strategy ────────────────────────────────────────────────────────

export const messageStrategySchema = z.object({
  campaignId: z.string().uuid().optional().nullable(),
  brandContext: z.object({
    name: z.string().max(255).optional(),
    industry: z.string().max(255).optional(),
    targetAudience: z.string().max(5000).optional(),
    valueProposition: z.string().max(5000).optional(),
  }).optional().nullable(),
  businessProblem: z.string().min(1).max(5000),
  successMetric: z.string().max(1000).optional().nullable(),
  timeline: z.string().max(1000).optional().nullable(),
  budget: z.string().max(1000).optional().nullable(),
  constraints: z.string().max(5000).optional().nullable(),
  whatBeenTried: z.string().max(5000).optional().nullable(),
  targetAudience: z.string().max(5000).optional().nullable(),
  proposition: z.string().max(5000).optional().nullable(),
  support: z.array(z.string().max(2000)).optional().nullable(),
  tone: z.string().max(1000).optional().nullable(),
  mandatories: z.array(z.string().max(1000)).optional().nullable(),
});

// ─── Strategy Check ──────────────────────────────────────────────────────────

export const strategyCheckPostSchema = z.object({
  userId: z.string().uuid().optional(),
  campaignId: z.string().uuid().optional().nullable(),
  discipline: z.string().min(1).max(255),
  goalType: z.string().min(1).max(255),
  goalDescription: z.string().max(5000).optional().nullable(),
  brandContext: z.object({
    industry: z.string().max(255).optional(),
  }).optional().nullable(),
});

export const strategyCheckPutSchema = z.object({
  strategyCheckId: z.string().uuid().optional().nullable(),
  campaignId: z.string().uuid().optional().nullable(),
  response: z.enum(['accepted', 'overridden', 'dismissed']),
});

// ─── Personas ────────────────────────────────────────────────────────────────

export const personasPostSchema = z.object({
  action: z.enum(['generate', 'create']),
  projectId: z.string().max(255).optional().nullable(),
  industry: z.string().max(255).optional().nullable(),
  targetAudience: z.string().max(5000).optional().nullable(),
  challenge: z.string().max(5000).optional().nullable(),
  personaData: z.object({
    name: z.string().min(1).max(255),
    role: z.string().min(1).max(255),
    description: z.string().max(5000).optional(),
    demographics: z.string().max(1000).optional(),
    psychographics: z.string().max(1000).optional(),
    pain_points: z.array(z.string().max(1000)).optional(),
    goals: z.array(z.string().max(1000)).optional(),
    behaviors: z.array(z.string().max(1000)).optional(),
    preferred_channels: z.array(z.string().max(255)).optional(),
    quote: z.string().max(1000).optional(),
    avatar_emoji: z.string().max(10).optional(),
  }).optional().nullable(),
});

// ─── User Delete ─────────────────────────────────────────────────────────────

export const userDeleteSchema = z.object({
  confirmEmail: z.string().email().max(255),
});

// ─── Stripe Checkout ─────────────────────────────────────────────────────────

export const stripeCheckoutSchema = z.object({
  priceType: z.enum(['monthly', 'yearly']).optional(),
});
