'use client';

import { useState, useEffect } from 'react';
import { libraries, disciplines, icons } from '@/lib/data';
import { personalizePrompt, simpleMarkdown } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getCreativePersonas, getStrategyPersonas, type Persona as RemixPersona } from '@/lib/personas';

type Step = 'landing' | 'projects' | 'brand-input' | 'discipline-select' | 'library-view' | 'llm-output' | 'my-library' | 'mode-select' | 'discovery-brief' | 'message-strategy' | 'creative-ideas' | 'directed-brief' | 'strategy-check' | 'campaigns' | 'upload-brief' | 'brief-review';
type Mode = 'strategy' | 'execution';
type CampaignMode = 'discovery' | 'directed' | 'upload';
type CampaignGoalType = 'awareness' | 'consideration' | 'conversion' | 'retention';
type ThreadState = 'draft' | 'in_planning' | 'pending_review' | 'approved' | 'active';
type Provider = 'gemini' | 'openai' | 'anthropic' | 'none';
type AuthModal = 'none' | 'login' | 'signup' | 'signup-success' | 'forgot-password' | 'reset-sent';

interface MessageStrategy {
  id: string;
  name: string;
  core_message: string;
  angle: string;
  rationale: string;
  best_for?: string[];
  user_refinements?: string;
}

interface CreativeIdea {
  id: string;
  name: string;
  summary: string;
  why_it_fits: string;
  tone_and_feel: string[];
  creative_risk_level: 'low' | 'medium' | 'high';
  what_it_sacrifices: string;
}

interface Campaign {
  id: string;
  name: string;
  mode: CampaignMode;
  brand_id: string;
  discipline?: string;
  // Strategic Thread State (Agency Model)
  threadState: ThreadState;
  // Discovery Mode
  business_problem?: string;
  success_metric?: string;
  success_metric_value?: string;
  timeline?: string;
  budget?: string;
  campaign_constraints?: string;
  what_been_tried?: string;
  // Directed Mode
  goal_type?: CampaignGoalType;
  goal_description?: string;
  campaign_mandatories?: string[];
  // Strategy
  message_strategy_options?: MessageStrategy[];
  selected_message_strategy?: MessageStrategy;
  strategy_check_shown?: boolean;
  strategy_check_recommendation?: string;
  // Metadata
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
}

interface SavedItem {
  id: string;
  title: string;
  discipline: string;
  mode: string;
  prompt_goal: string;
  content: string;
  created_at: string;
  project_id?: string;
}

interface Project {
  id: string;
  name: string;
  website: string;
  industry: string;
  challenge: string;
  target_audience: string;
  brand_voice: string;
  // New v1.1 fields
  value_proposition?: string;
  persistent_mandatories?: string[];
  persistent_constraints?: string;
  created_at: string;
  updated_at: string;
}

interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
  demographics?: string;
  psychographics?: string;
  pain_points?: string[];
  goals?: string[];
  behaviors?: string[];
  preferred_channels?: string[];
  quote?: string;
  avatar_emoji?: string;
  is_generated: boolean;
  project_id?: string;
  created_at: string;
}

interface State {
  step: Step;
  mode: Mode;
  brand: string;
  website: string;
  industry: string;
  challenge: string;
  targetAudience: string;
  brandVoice: string;
  discipline: string | null;
  library: any | null;
  expandedModels: Record<number, boolean>;
  expandedPrompts: Record<number, boolean>;
  copiedId: number | string | null;
  selectedPrompt: any | null;
  llmOutput: string;
  isLoading: boolean;
  apiKey: string;
  llmProvider: Provider;
  freePromptsUsed: number;
  promptsLimit: number;
  user: User | null;
  authModal: AuthModal;
  authLoading: boolean;
  authError: string | null;
  signupEmail: string;
  savedItems: SavedItem[];
  libraryLoading: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  // Projects
  projects: Project[];
  currentProject: Project | null;
  projectsLoading: boolean;
  editingProject: Project | null;
  // Remix
  showRemixModal: boolean;
  remixLoading: boolean;
  remixedOutput: string | null;
  remixPersona: { id: string; name: string; tagline: string; colors: [string, string]; quote: string } | null;
  // Accordion state
  originalExpanded: boolean;
  remixExpanded: boolean;
  // Usage limit modal
  showLimitModal: boolean;
  // Campaign flow (v1.1)
  campaignMode: CampaignMode | null;
  currentCampaign: Campaign | null;
  campaigns: Campaign[];
  campaignsLoading: boolean;
  messageStrategies: MessageStrategy[];
  messageStrategiesLoading: boolean;
  selectedStrategy: MessageStrategy | null;
  // Creative Ideas (Phase 1 - Agency Model)
  creativeIdeas: CreativeIdea[];
  creativeIdeasLoading: boolean;
  selectedCreativeIdea: CreativeIdea | null;
  strategyCheckResult: {
    aligned: boolean;
    severity: 'none' | 'mild' | 'strong';
    recommendation: string;
    alternativeDisciplines: string[];
  } | null;
  // Discovery brief form (expanded for complete creative brief)
  discoveryBrief: {
    // Step 1: The Problem
    campaignName: string;
    businessProblem: string;
    whatBeenTried: string;
    // Step 2: The Audience
    targetAudience: string;
    // Step 3: The Proposition
    proposition: string;
    support: string[];
    // Step 4: The Brief Details
    tone: string;
    mandatories: string[];
    constraints: string;
    // Step 5: The Measures
    successMetric: string;
    successMetricValue: string;
    timeline: string;
    budget: string;
  };
  // Discovery wizard step tracking
  discoveryWizardStep: 1 | 2 | 3 | 4 | 5 | 6;
  // Directed brief form
  directedBrief: {
    campaignName: string;
    goalType: CampaignGoalType;
    goalDescription: string;
    campaignMandatories: string[];
  };
  // Uploaded brief data
  uploadedBrief: {
    campaignName: string | null;
    objective: string | null;
    targetAudience: string | null;
    proposition: string | null;
    support: string[] | null;
    mandatories: string[] | null;
    tone: string | null;
    constraints: string | null;
    budget: string | null;
    timeline: string | null;
    successMetrics: string | null;
  };
  briefParsingLoading: boolean;
  briefFileName: string | null;
  // Personas
  personas: Persona[];
  personasLoading: boolean;
  selectedPersona: Persona | null;
  showPersonaModal: boolean;
  personaGenerating: boolean;
  // Planning Review (Agency Model)
  showPlanningReview: boolean;
  planningReviewLoading: boolean;
  planningReviewResult: {
    score: number;
    assessment: string;
    suggestions: string[];
  } | null;
  skippedPlanningReview: boolean;
  // Re-brief / Edit Output
  showRebriefModal: boolean;
  rebriefFeedback: string;
  isEditingOutput: boolean;
  editedOutput: string;
  // Re-brief / Edit Remix
  showRebriefRemixModal: boolean;
  rebriefRemixFeedback: string;
  isEditingRemix: boolean;
  editedRemix: string;
}

const FREE_PROMPT_LIMIT = 15;

export default function Home() {
  const [state, setState] = useState<State>({
    step: 'landing',
    mode: 'strategy',
    brand: '',
    website: '',
    industry: '',
    targetAudience: '',
    brandVoice: '',
    challenge: '',
    discipline: null,
    library: null,
    expandedModels: {},
    expandedPrompts: {},
    copiedId: null,
    selectedPrompt: null,
    llmOutput: '',
    isLoading: false,
    apiKey: '',
    llmProvider: 'gemini',
    freePromptsUsed: 0,
    promptsLimit: FREE_PROMPT_LIMIT,
    user: null,
    authModal: 'none',
    authLoading: false,
    authError: null,
    signupEmail: '',
    savedItems: [],
    libraryLoading: false,
    saveStatus: 'idle',
    // Projects
    projects: [],
    currentProject: null,
    projectsLoading: false,
    editingProject: null,
    // Remix
    showRemixModal: false,
    remixLoading: false,
    remixedOutput: null,
    remixPersona: null,
    // Accordion state
    originalExpanded: true,
    remixExpanded: true,
    // Usage limit modal
    showLimitModal: false,
    // Campaign flow (v1.1)
    campaignMode: null,
    currentCampaign: null,
    campaigns: [],
    campaignsLoading: false,
    messageStrategies: [],
    messageStrategiesLoading: false,
    selectedStrategy: null,
    // Creative Ideas
    creativeIdeas: [],
    creativeIdeasLoading: false,
    selectedCreativeIdea: null,
    strategyCheckResult: null,
    // Discovery brief form (expanded)
    discoveryBrief: {
      // Step 1: The Problem
      campaignName: '',
      businessProblem: '',
      whatBeenTried: '',
      // Step 2: The Audience
      targetAudience: '',
      // Step 3: The Proposition
      proposition: '',
      support: [],
      // Step 4: The Brief Details
      tone: '',
      mandatories: [],
      constraints: '',
      // Step 5: The Measures
      successMetric: '',
      successMetricValue: '',
      timeline: '',
      budget: '',
    },
    // Discovery wizard step
    discoveryWizardStep: 1,
    // Directed brief form
    directedBrief: {
      campaignName: '',
      goalType: 'awareness',
      goalDescription: '',
      campaignMandatories: [],
    },
    // Uploaded brief data
    uploadedBrief: {
      campaignName: null,
      objective: null,
      targetAudience: null,
      proposition: null,
      support: null,
      mandatories: null,
      tone: null,
      constraints: null,
      budget: null,
      timeline: null,
      successMetrics: null,
    },
    briefParsingLoading: false,
    briefFileName: null,
    // Personas
    personas: [],
    personasLoading: false,
    selectedPersona: null,
    showPersonaModal: false,
    personaGenerating: false,
    // Planning Review (Agency Model)
    showPlanningReview: false,
    planningReviewLoading: false,
    planningReviewResult: null,
    skippedPlanningReview: false,
    // Re-brief / Edit Output
    showRebriefModal: false,
    rebriefFeedback: '',
    isEditingOutput: false,
    editedOutput: '',
    // Re-brief / Edit Remix
    showRebriefRemixModal: false,
    rebriefRemixFeedback: '',
    isEditingRemix: false,
    editedRemix: '',
  });

  // Check auth and load state on mount
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    // Only setup Supabase auth if configured
    if (supabase && isSupabaseConfigured()) {
      // Check for existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setState(prev => ({
            ...prev,
            user: { id: session.user.id, email: session.user.email || '' },
          }));
          loadUserUsage(session.user.id);
        }
      });

      // Listen for auth changes
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setState(prev => ({
            ...prev,
            user: { id: session.user.id, email: session.user.email || '' },
          }));
          loadUserUsage(session.user.id);
        } else {
          setState(prev => ({
            ...prev,
            user: null,
            projects: [],
            currentProject: null,
            freePromptsUsed: parseInt(localStorage.getItem('amplify_free_prompts_used') || '0', 10),
          }));
        }
      });
      subscription = data.subscription;
    }

    // Load local state
    const savedApiKey = localStorage.getItem('amplify_api_key') || '';
    const savedProvider = (localStorage.getItem('amplify_provider') as Provider) || 'gemini';
    const savedPromptsUsed = parseInt(localStorage.getItem('amplify_free_prompts_used') || '0', 10);

    setState(prev => ({
      ...prev,
      apiKey: savedApiKey,
      llmProvider: savedProvider,
      freePromptsUsed: prev.user ? prev.freePromptsUsed : savedPromptsUsed,
    }));

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const loadUserUsage = async (userId: string) => {
    try {
      const response = await fetch(`/api/usage?userId=${userId}`);
      const data = await response.json();
      if (!data.error) {
        setState(prev => ({
          ...prev,
          freePromptsUsed: data.prompts_used || 0,
          promptsLimit: data.prompts_limit || FREE_PROMPT_LIMIT,
        }));
      }
    } catch (error) {
      console.error('Failed to load usage:', error);
    }
  };

  const updateState = (updates: Partial<State>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleSignup = async (email: string, password: string) => {
    updateState({ authLoading: true, authError: null });
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        updateState({ authError: data.error, authLoading: false });
        return;
      }

      if (data.session && supabase) {
        await supabase.auth.setSession(data.session);
      }

      // Show success screen instead of alert
      updateState({ authModal: 'signup-success', authLoading: false, signupEmail: email });
    } catch (error: any) {
      updateState({ authError: error.message, authLoading: false });
    }
  };

  const handleForgotPassword = async (email: string) => {
    updateState({ authLoading: true, authError: null });
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        updateState({ authError: data.error, authLoading: false });
        return;
      }

      updateState({ authModal: 'reset-sent', authLoading: false, signupEmail: email });
    } catch (error: any) {
      updateState({ authError: error.message, authLoading: false });
    }
  };

  const handleLogin = async (email: string) => {
    updateState({ authLoading: true, authError: null });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        updateState({ authError: data.error, authLoading: false });
        return;
      }

      // Show success message - user needs to check email for magic link
      updateState({ authModal: 'reset-sent', authLoading: false });
    } catch (error: any) {
      updateState({ authError: error.message, authLoading: false });
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    updateState({
      user: null,
      projects: [],
      currentProject: null,
      freePromptsUsed: parseInt(localStorage.getItem('amplify_free_prompts_used') || '0', 10),
      promptsLimit: FREE_PROMPT_LIMIT,
    });
  };

  // Library functions
  const loadSavedItems = async (projectId?: string) => {
    if (!state.user) return;
    updateState({ libraryLoading: true });
    try {
      let url = `/api/library?userId=${state.user.id}`;
      if (projectId) {
        url += `&projectId=${projectId}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (!data.error) {
        updateState({ savedItems: data.items || [], libraryLoading: false });
      } else {
        updateState({ libraryLoading: false });
      }
    } catch (error) {
      console.error('Failed to load library:', error);
      updateState({ libraryLoading: false });
    }
  };

  const saveToLibrary = async (saveRemix: boolean = false) => {
    if (!state.user || !state.llmOutput || !state.selectedPrompt) {
      if (!state.user) {
        updateState({ authModal: 'login' });
      }
      return;
    }

    const contentToSave = saveRemix ? state.remixedOutput : state.llmOutput;
    if (!contentToSave) return;

    const titleSuffix = saveRemix && state.remixPersona
      ? ` (${state.remixPersona.name} Remix)`
      : '';

    updateState({ saveStatus: 'saving' });
    try {
      const response = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.user.id,
          projectId: state.currentProject?.id || null,
          title: `${state.brand} - ${state.selectedPrompt.goal}${titleSuffix}`,
          discipline: state.discipline,
          mode: state.mode,
          promptGoal: state.selectedPrompt.goal,
          content: contentToSave,
          remixPersona: saveRemix ? state.remixPersona?.name : null,
        }),
      });
      const data = await response.json();
      if (!data.error) {
        updateState({ saveStatus: 'saved' });
        setTimeout(() => updateState({ saveStatus: 'idle' }), 2000);
      } else {
        updateState({ saveStatus: 'error' });
        setTimeout(() => updateState({ saveStatus: 'idle' }), 2000);
      }
    } catch (error) {
      console.error('Failed to save:', error);
      updateState({ saveStatus: 'error' });
      setTimeout(() => updateState({ saveStatus: 'idle' }), 2000);
    }
  };

  const deleteFromLibrary = async (id: string) => {
    if (!state.user) return;
    try {
      const response = await fetch('/api/library', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, userId: state.user.id }),
      });
      const data = await response.json();
      if (!data.error) {
        updateState({ savedItems: state.savedItems.filter(item => item.id !== id) });
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const openMyLibrary = () => {
    loadSavedItems();
    updateState({ step: 'my-library' });
  };

  // Project functions
  const loadProjects = async () => {
    if (!state.user) return;
    updateState({ projectsLoading: true });
    try {
      const response = await fetch(`/api/projects?userId=${state.user.id}`);
      const data = await response.json();
      if (!data.error) {
        updateState({ projects: data.projects || [], projectsLoading: false });
      } else {
        updateState({ projectsLoading: false });
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      updateState({ projectsLoading: false });
    }
  };

  const createProject = async (name: string, website: string, industry: string, challenge: string, targetAudience: string, brandVoice: string) => {
    if (!state.user) return null;
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.user.id,
          name,
          website,
          industry,
          challenge,
          targetAudience,
          brandVoice,
        }),
      });
      const data = await response.json();
      if (!data.error && data.project) {
        updateState({
          projects: [data.project, ...state.projects],
          currentProject: data.project,
          brand: data.project.name,
          website: data.project.website,
          industry: data.project.industry,
          challenge: data.project.challenge,
          targetAudience: data.project.target_audience || '',
          brandVoice: data.project.brand_voice || '',
          step: 'mode-select',
        });
        return data.project;
      }
      return null;
    } catch (error) {
      console.error('Failed to create project:', error);
      return null;
    }
  };

  const updateProject = async (project: Project) => {
    if (!state.user) return false;
    try {
      const response = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: project.id,
          userId: state.user.id,
          name: project.name,
          website: project.website,
          industry: project.industry,
          challenge: project.challenge,
          targetAudience: project.target_audience,
          brandVoice: project.brand_voice,
        }),
      });
      const data = await response.json();
      if (!data.error && data.project) {
        updateState({
          projects: state.projects.map(p => p.id === project.id ? data.project : p),
          currentProject: data.project,
          brand: data.project.name,
          website: data.project.website,
          industry: data.project.industry,
          challenge: data.project.challenge,
          targetAudience: data.project.target_audience || '',
          brandVoice: data.project.brand_voice || '',
          editingProject: null,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update project:', error);
      return false;
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!state.user) return false;
    try {
      const response = await fetch('/api/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, userId: state.user.id }),
      });
      const data = await response.json();
      if (!data.error) {
        updateState({
          projects: state.projects.filter(p => p.id !== projectId),
          currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
  };

  const selectProject = (project: Project) => {
    updateState({
      currentProject: project,
      brand: project.name,
      website: project.website,
      industry: project.industry,
      challenge: project.challenge,
      targetAudience: project.target_audience || '',
      brandVoice: project.brand_voice || '',
      step: 'mode-select',
    });
  };

  const openProjects = () => {
    loadProjects();
    updateState({ step: 'projects' });
  };

  // Remix functions
  const openRemixModal = () => {
    updateState({ showRemixModal: true, remixedOutput: null, remixPersona: null });
  };

  const closeRemixModal = () => {
    updateState({ showRemixModal: false });
  };

  const runRemix = async (personaId: string) => {
    updateState({ remixLoading: true, remixedOutput: null });
    try {
      const response = await fetch('/api/remix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalContent: state.llmOutput,
          personaId,
          mode: state.mode,
          brandContext: {
            brand: state.brand,
            industry: state.industry,
            challenge: state.challenge,
            targetAudience: state.targetAudience,
            brandVoice: state.brandVoice,
          },
        }),
      });
      const data = await response.json();
      if (data.error) {
        updateState({ remixLoading: false });
        alert('Failed to generate remix: ' + data.error);
      } else {
        updateState({
          remixLoading: false,
          remixedOutput: data.result,
          remixPersona: data.persona,
          showRemixModal: false,
        });
      }
    } catch (error: any) {
      console.error('Remix failed:', error);
      updateState({ remixLoading: false });
      alert('Failed to generate remix');
    }
  };

  const clearRemix = () => {
    updateState({ remixedOutput: null, remixPersona: null });
  };

  // Planning Review functions (Agency Model)
  const triggerPlanningReview = async () => {
    updateState({ showPlanningReview: true, planningReviewLoading: true, planningReviewResult: null });

    try {
      // Gather context for review - prioritize discovery brief fields
      const problemStatement = state.discoveryBrief.businessProblem ||
        state.uploadedBrief.objective ||
        state.directedBrief.goalDescription ||
        state.currentProject?.challenge ||
        '';

      const targetAudience = state.discoveryBrief.targetAudience ||
        (state.selectedPersona?.name
          ? `${state.selectedPersona.name} - ${state.selectedPersona.role}: ${state.selectedPersona.description || ''}`
          : state.uploadedBrief.targetAudience ||
            state.currentProject?.target_audience ||
            state.targetAudience ||
            '');

      const proposition = state.discoveryBrief.proposition ||
        state.uploadedBrief.proposition ||
        '';

      const support = [
        ...(state.discoveryBrief.support || []),
        ...(state.uploadedBrief.support || []),
      ].filter(Boolean);

      const tone = state.discoveryBrief.tone ||
        state.uploadedBrief.tone ||
        '';

      const mandatories = [
        ...(state.discoveryBrief.mandatories || []),
        ...(state.directedBrief.campaignMandatories || []),
        ...(state.uploadedBrief.mandatories || []),
        ...(state.currentProject?.persistent_mandatories || []),
      ].filter(Boolean);

      const constraints = state.discoveryBrief.constraints ||
        state.uploadedBrief.constraints ||
        '';

      const successMetric = state.discoveryBrief.successMetric ||
        state.uploadedBrief.successMetrics ||
        '';

      const timeline = state.discoveryBrief.timeline ||
        state.uploadedBrief.timeline ||
        '';

      const budget = state.discoveryBrief.budget ||
        state.uploadedBrief.budget ||
        '';

      const response = await fetch('/api/planning-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemStatement,
          targetAudience,
          proposition,
          support,
          tone,
          strategy: state.selectedStrategy,
          creativeIdea: state.selectedCreativeIdea,
          mandatories,
          constraints,
          successMetric,
          timeline,
          budget,
          brandContext: {
            name: state.currentProject?.name || state.brand,
            industry: state.currentProject?.industry || state.industry,
          },
        }),
      });

      const result = await response.json();
      updateState({ planningReviewLoading: false, planningReviewResult: result });
    } catch (error) {
      console.error('Planning review failed:', error);
      updateState({
        planningReviewLoading: false,
        planningReviewResult: {
          score: 5,
          assessment: 'Unable to complete review. Please check your strategic foundation.',
          suggestions: ['Ensure all required fields are filled'],
        },
      });
    }
  };

  const handlePlanningApprove = () => {
    // Update campaign/thread state to approved and move to discipline selection
    const updates: Partial<State> = {
      showPlanningReview: false,
      mode: 'execution' as Mode,
      skippedPlanningReview: false,
      step: 'discipline-select' as Step,
    };

    if (state.currentCampaign) {
      const updatedCampaign = { ...state.currentCampaign, threadState: 'approved' as ThreadState };
      updates.currentCampaign = updatedCampaign;
      saveCampaignState(updatedCampaign);
    }

    updateState(updates);
  };

  const handlePlanningRefine = () => {
    // Go back to Creative Ideas to pick a different approach
    updateState({
      showPlanningReview: false,
      mode: 'strategy',
      step: 'creative-ideas', // Go back to creative ideas to refine
    });
  };

  const handlePlanningSkip = () => {
    // Allow skip but set warning flag
    updateState({
      showPlanningReview: false,
      mode: 'execution',
      skippedPlanningReview: true,
      step: 'discipline-select', // Move to Creative execution with warning
    });
  };

  const saveCampaignState = (campaign: Campaign) => {
    const projectKey = state.currentProject?.id || 'default';
    localStorage.setItem(`amplify_campaign_${projectKey}`, JSON.stringify(campaign));
  };

  // Persona functions
  const loadPersonas = () => {
    // Load from localStorage for now
    const projectKey = state.currentProject?.id || 'default';
    const saved = localStorage.getItem(`amplify_personas_${projectKey}`);
    if (saved) {
      try {
        const personas = JSON.parse(saved);
        updateState({ personas });
      } catch (e) {
        console.error('Failed to load personas:', e);
      }
    }
  };

  const savePersonas = (personas: Persona[]) => {
    const projectKey = state.currentProject?.id || 'default';
    localStorage.setItem(`amplify_personas_${projectKey}`, JSON.stringify(personas));
    updateState({ personas });
  };

  const generatePersonas = async () => {
    updateState({ personaGenerating: true });
    try {
      const response = await fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          projectId: state.currentProject?.id,
          industry: state.currentProject?.industry || state.industry,
          targetAudience: state.currentProject?.target_audience || state.targetAudience,
          challenge: state.currentProject?.challenge || state.challenge,
        }),
      });
      const data = await response.json();
      if (data.personas) {
        const newPersonas = [...state.personas, ...data.personas];
        savePersonas(newPersonas);
      } else if (data.error) {
        alert('Failed to generate personas: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to generate personas:', error);
      alert('Failed to generate personas');
    }
    updateState({ personaGenerating: false });
  };

  const addManualPersona = (personaData: Partial<Persona>) => {
    const newPersona: Persona = {
      id: `manual-${Date.now()}`,
      name: personaData.name || 'New Persona',
      role: personaData.role || '',
      description: personaData.description || '',
      demographics: personaData.demographics,
      psychographics: personaData.psychographics,
      pain_points: personaData.pain_points || [],
      goals: personaData.goals || [],
      behaviors: personaData.behaviors || [],
      preferred_channels: personaData.preferred_channels || [],
      quote: personaData.quote,
      avatar_emoji: personaData.avatar_emoji || '👤',
      is_generated: false,
      project_id: state.currentProject?.id,
      created_at: new Date().toISOString(),
    };
    const newPersonas = [...state.personas, newPersona];
    savePersonas(newPersonas);
  };

  const deletePersona = (personaId: string) => {
    const newPersonas = state.personas.filter(p => p.id !== personaId);
    savePersonas(newPersonas);
    if (state.selectedPersona?.id === personaId) {
      updateState({ selectedPersona: null });
    }
  };

  const selectPersona = (persona: Persona | null) => {
    updateState({ selectedPersona: persona });
  };

  const copyToClipboard = (text: string, id: number | string) => {
    navigator.clipboard.writeText(text).then(() => {
      updateState({ copiedId: id });
      setTimeout(() => updateState({ copiedId: null }), 2000);
    });
  };

  const copyLLMOutput = (id: string) => {
    const isNoApiKey = state.llmOutput.startsWith('__NO_API_KEY__');
    const content = isNoApiKey ? state.llmOutput.replace('__NO_API_KEY__\n\n', '') : state.llmOutput;
    copyToClipboard(content, id);
  };

  const setMode = (mode: Mode) => {
    // If switching to Creative (execution) mode, check if Planning Review is needed
    if (mode === 'execution' && state.mode === 'strategy') {
      // Check if thread is already approved
      const isApproved = state.currentCampaign?.threadState === 'approved' ||
                         state.currentCampaign?.threadState === 'active';

      if (!isApproved) {
        // Trigger Planning Review before allowing Creative mode
        triggerPlanningReview();
        return;
      }
    }

    // If switching back to Planning from Creative, clear the skipped warning
    if (mode === 'strategy' && state.mode === 'execution') {
      updateState({ mode, skippedPlanningReview: false });
      return;
    }

    updateState({ mode });
  };

  const setProvider = (provider: Provider) => {
    updateState({ llmProvider: provider });
    localStorage.setItem('amplify_provider', provider);
  };

  const runPromptWithLLM = async (prompt: string) => {
    // Check free tier limit if using Gemini (server key) and no API key
    if (state.llmProvider === 'gemini' && !state.apiKey && state.freePromptsUsed >= state.promptsLimit) {
      updateState({ showLimitModal: true });
      return;
    }

    updateState({ isLoading: true, llmOutput: '', step: 'llm-output' });

    const personalizedPrompt = personalizePrompt(prompt, state);

    try {
      // Build campaign context - check for actual data, not just mode flag
      const hasDiscoveryData = state.discoveryBrief.campaignName || state.discoveryBrief.businessProblem;
      const hasDirectedData = state.directedBrief.campaignName || state.directedBrief.goalDescription;
      const hasUploadedData = state.uploadedBrief.campaignName || state.uploadedBrief.proposition;
      const hasCampaignData = state.campaignMode || hasDiscoveryData || hasDirectedData || hasUploadedData;

      // Determine which brief has the active data
      const isDiscoveryMode = state.campaignMode === 'discovery' || (hasDiscoveryData && !hasDirectedData && !hasUploadedData);
      const isUploadMode = state.campaignMode === 'upload' || (hasUploadedData && !hasDiscoveryData && !hasDirectedData);

      // For uploaded briefs, merge the data into campaign context
      const uploadedBrief = state.uploadedBrief;

      const campaignContext = hasCampaignData ? {
        // Campaign name from the active mode
        campaignName: isUploadMode
          ? uploadedBrief.campaignName
          : isDiscoveryMode
            ? state.discoveryBrief.campaignName
            : state.directedBrief.campaignName,
        // Discovery mode fields (expanded)
        businessProblem: state.discoveryBrief.businessProblem || undefined,
        successMetric: state.discoveryBrief.successMetric || uploadedBrief.successMetrics || undefined,
        successMetricValue: state.discoveryBrief.successMetricValue || undefined,
        timeline: state.discoveryBrief.timeline || uploadedBrief.timeline || undefined,
        budget: state.discoveryBrief.budget || uploadedBrief.budget || undefined,
        constraints: state.discoveryBrief.constraints || uploadedBrief.constraints || undefined,
        whatBeenTried: state.discoveryBrief.whatBeenTried || undefined,
        // Directed mode fields - ALWAYS include if present
        goalType: state.directedBrief.goalType || undefined,
        goalDescription: state.directedBrief.goalDescription || uploadedBrief.objective || undefined,
        campaignMandatories: [
          ...(state.discoveryBrief.mandatories || []),
          ...(state.directedBrief.campaignMandatories || []),
          ...(uploadedBrief.mandatories || []),
        ].filter(Boolean).length > 0 ? [
          ...(state.discoveryBrief.mandatories || []),
          ...(state.directedBrief.campaignMandatories || []),
          ...(uploadedBrief.mandatories || []),
        ].filter(Boolean) : undefined,
        // Strategy anchor (from Discovery mode)
        selectedStrategy: state.selectedStrategy || undefined,
        // Creative idea (from Creative Ideas step)
        selectedCreativeIdea: state.selectedCreativeIdea || undefined,
        // Brief fields - prioritize discovery, fallback to uploaded
        proposition: state.discoveryBrief.proposition || uploadedBrief.proposition || undefined,
        support: [...(state.discoveryBrief.support || []), ...(uploadedBrief.support || [])].filter(Boolean).length > 0
          ? [...(state.discoveryBrief.support || []), ...(uploadedBrief.support || [])].filter(Boolean)
          : undefined,
        targetAudience: state.discoveryBrief.targetAudience || uploadedBrief.targetAudience || undefined,
        tone: state.discoveryBrief.tone || uploadedBrief.tone || undefined,
      } : undefined;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: personalizedPrompt,
          mode: state.mode,
          provider: state.llmProvider,
          userApiKey: state.llmProvider !== 'gemini' ? state.apiKey : undefined,
          brandContext: {
            brand: state.brand,
            website: state.website,
            industry: state.industry,
            challenge: state.challenge,
            targetAudience: state.targetAudience,
            brandVoice: state.brandVoice,
            persistentMandatories: state.currentProject?.persistent_mandatories,
            persistentConstraints: state.currentProject?.persistent_constraints,
          },
          campaignContext,
          personaContext: state.selectedPersona ? {
            name: state.selectedPersona.name,
            role: state.selectedPersona.role,
            description: state.selectedPersona.description,
            pain_points: state.selectedPersona.pain_points,
            goals: state.selectedPersona.goals,
            behaviors: state.selectedPersona.behaviors,
            preferred_channels: state.selectedPersona.preferred_channels,
          } : undefined,
        }),
      });

      const data = await response.json();

      if (data.error) {
        updateState({ llmOutput: `Error: ${data.error}`, isLoading: false });
      } else {
        // Track usage
        if (state.llmProvider === 'gemini') {
          if (state.user) {
            // Update server-side usage
            const usageResponse = await fetch('/api/usage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: state.user.id }),
            });
            const usageData = await usageResponse.json();
            updateState({ freePromptsUsed: usageData.prompts_used });
          } else {
            // Update localStorage for anonymous users
            const newCount = state.freePromptsUsed + 1;
            localStorage.setItem('amplify_free_prompts_used', newCount.toString());
            updateState({ freePromptsUsed: newCount });
          }
        }
        updateState({ llmOutput: data.result, isLoading: false });
      }
    } catch (error: any) {
      updateState({ llmOutput: `Error: ${error.message}`, isLoading: false });
    }
  };

  const switchModeAndRerun = (newMode: Mode) => {
    if (state.mode !== newMode && state.selectedPrompt) {
      updateState({ mode: newMode });
      runPromptWithLLM(state.selectedPrompt.prompt);
    }
  };

  // Regenerate with creative re-brief feedback
  const regenerateWithFeedback = (feedback: string) => {
    if (!state.selectedPrompt) return;

    // Append feedback as a re-brief instruction to the original prompt
    const rebriefPrompt = `${state.selectedPrompt.prompt}

---
CREATIVE RE-BRIEF:
The previous output didn't meet requirements. Please regenerate with the following feedback in mind:
${feedback}

Important: Address this specific feedback while maintaining the core brief requirements. Generate a fresh, improved version.`;

    updateState({
      showRebriefModal: false,
      rebriefFeedback: '',
      isEditingOutput: false,
    });
    runPromptWithLLM(rebriefPrompt);
  };

  // Save edited output
  const saveEditedOutput = () => {
    updateState({
      llmOutput: state.editedOutput,
      isEditingOutput: false,
      editedOutput: '',
    });
  };

  // Cancel edit
  const cancelEdit = () => {
    updateState({
      isEditingOutput: false,
      editedOutput: '',
    });
  };

  // Save edited remix
  const saveEditedRemix = () => {
    updateState({
      remixedOutput: state.editedRemix,
      isEditingRemix: false,
      editedRemix: '',
    });
  };

  // Cancel remix edit
  const cancelRemixEdit = () => {
    updateState({
      isEditingRemix: false,
      editedRemix: '',
    });
  };

  // Regenerate remix with feedback
  const regenerateRemixWithFeedback = (feedback: string) => {
    if (!state.remixPersona) return;

    // Re-run the remix with feedback
    updateState({
      showRebriefRemixModal: false,
      rebriefRemixFeedback: '',
      remixLoading: true,
    });

    // Call the remix API with feedback
    const runRemixWithFeedback = async () => {
      try {
        const response = await fetch('/api/remix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalContent: state.llmOutput,
            personaId: state.remixPersona?.id,
            mode: state.mode,
            feedback: feedback, // Pass the feedback for re-brief
          }),
        });
        const data = await response.json();
        if (data.result) {
          updateState({ remixedOutput: data.result, remixLoading: false });
        } else {
          updateState({ remixLoading: false });
        }
      } catch (error) {
        console.error('Remix with feedback failed:', error);
        updateState({ remixLoading: false });
      }
    };

    runRemixWithFeedback();
  };

  const submitBrandInfo = () => {
    const brand = (document.getElementById('brand') as HTMLInputElement)?.value || '';
    const website = (document.getElementById('website') as HTMLInputElement)?.value || '';
    const industry = (document.getElementById('industry') as HTMLInputElement)?.value || '';
    const challenge = (document.getElementById('challenge') as HTMLTextAreaElement)?.value || '';
    const targetAudience = (document.getElementById('targetAudience') as HTMLTextAreaElement)?.value || '';
    const brandVoice = (document.getElementById('brandVoice') as HTMLTextAreaElement)?.value || '';
    const apiKeyInput = (document.getElementById('apiKey') as HTMLInputElement)?.value || '';

    if (!brand || !industry || !challenge) {
      alert('Please fill in Brand, Industry, and Challenge fields');
      return;
    }

    if (state.llmProvider !== 'gemini' && state.llmProvider !== 'none') {
      localStorage.setItem('amplify_api_key', apiKeyInput);
    }

    updateState({
      brand,
      website,
      industry,
      challenge,
      targetAudience,
      brandVoice,
      apiKey: apiKeyInput,
      step: 'mode-select',
    });
  };

  const selectDiscipline = (value: string) => {
    updateState({
      discipline: value,
      library: libraries[value as keyof typeof libraries],
      expandedModels: {},
      expandedPrompts: {},
      step: 'library-view',
    });
  };

  const toggleModel = (index: number) => {
    updateState({
      expandedModels: {
        ...state.expandedModels,
        [index]: !state.expandedModels[index],
      },
    });
  };

  const togglePrompt = (index: number) => {
    updateState({
      expandedPrompts: {
        ...state.expandedPrompts,
        [index]: !state.expandedPrompts[index],
      },
    });
  };

  const runPrompt = (index: number) => {
    const prompt = state.library.prompts[index];
    updateState({ selectedPrompt: prompt });
    runPromptWithLLM(prompt.prompt);
  };

  const goBack = (step: Step) => {
    updateState({ step });
  };

  const resetAll = () => {
    updateState({
      step: 'landing',
      discipline: null,
      library: null,
      expandedModels: {},
      expandedPrompts: {},
      llmOutput: '',
      selectedPrompt: null,
    });
  };

  return (
    <>
      {/* Auth Modal */}
      {state.authModal !== 'none' && (
        <AuthModal
          mode={state.authModal}
          onClose={() => updateState({ authModal: 'none', authError: null, signupEmail: '' })}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onForgotPassword={handleForgotPassword}
          onSwitchMode={(mode) => updateState({ authModal: mode, authError: null })}
          isLoading={state.authLoading}
          error={state.authError}
          signupEmail={state.signupEmail}
        />
      )}

      {/* Usage Limit Modal */}
      {state.showLimitModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border-3 border-[#ff3333] p-8 w-full max-w-md relative">
            {/* Corner accents */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-[#f7ff00]"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-[#f7ff00]"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-[#f7ff00]"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-[#f7ff00]"></div>

            <div className="text-center">
              <div className="font-display text-6xl text-[#ff3333] mb-4">!</div>
              <h2 className="headline-md text-[#ff3333] mb-2">LIMIT REACHED</h2>
              <p className="text-[#666] mb-8">
                You've burned through all {state.promptsLimit} free prompts. Time to level up.
              </p>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-[#1a1a1a] border-2 border-[#f7ff00]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display text-lg text-[#f7ff00]">PREMIUM</span>
                    <span className="font-mono text-[#f7ff00]">$29/mo</span>
                  </div>
                  <ul className="text-sm text-[#999] text-left space-y-2 mb-4 font-mono">
                    <li className="flex items-center gap-2">
                      <span className="text-[#00ff66]">✓</span> Unlimited prompts
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#00ff66]">✓</span> Priority AI responses
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#00ff66]">✓</span> All 26 creative personas
                    </li>
                  </ul>
                  <button
                    onClick={() => {
                      updateState({ showLimitModal: false });
                      alert('Premium checkout coming soon!');
                    }}
                    className="btn-primary w-full"
                  >
                    UPGRADE NOW
                  </button>
                </div>

                <div className="font-display text-[#333] tracking-[0.3em]">OR</div>

                <div className="p-4 bg-[#1a1a1a] border-2 border-[#333]">
                  <p className="text-sm text-white mb-2 font-display">BRING YOUR OWN KEY</p>
                  <p className="text-xs text-[#666] mb-3">Use your OpenAI or Anthropic API key</p>
                  <button
                    onClick={() => {
                      updateState({ showLimitModal: false, step: 'brand-input' });
                      setTimeout(() => {
                        document.getElementById('apiKeySection')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="btn-secondary btn-sm w-full"
                  >
                    ADD API KEY
                  </button>
                </div>
              </div>

              <button
                onClick={() => updateState({ showLimitModal: false })}
                className="text-xs text-[#444] hover:text-[#666] font-display tracking-wider"
              >
                MAYBE LATER
              </button>
            </div>
          </div>
        </div>
      )}

      {state.step !== 'landing' && (
        <header className="border-b-2 border-[#333] bg-[#0a0a0a] sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo - bold and stark */}
              <div className="flex items-center gap-4 cursor-pointer group" onClick={resetAll}>
                <div className="w-10 h-10 bg-[#f7ff00] flex items-center justify-center">
                  <span className="font-display text-black text-xl">A</span>
                </div>
                <div>
                  <h1 className="font-display text-xl tracking-wide text-white group-hover:text-[#f7ff00] transition-colors">AMPLIFY</h1>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Current project badge */}
                {state.currentProject && (() => {
                  const project = state.currentProject!;
                  return (
                    <button
                      onClick={() => updateState({
                        editingProject: project,
                        brand: project.name,
                        website: project.website,
                        industry: project.industry,
                        challenge: project.challenge,
                        targetAudience: project.target_audience || '',
                        brandVoice: project.brand_voice || '',
                        step: 'brand-input'
                      })}
                      className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#1a1a1a] border-2 border-[#333] text-[#f7ff00] text-xs font-display tracking-wider hover:border-[#f7ff00] transition-colors"
                      title="Edit brand profile"
                    >
                      <span>{project.name.toUpperCase()}</span>
                      <span className="text-[#666]">✎</span>
                    </button>
                  );
                })()}

                {/* Usage meter - industrial style */}
                {state.llmProvider === 'gemini' && !state.apiKey && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-[#1a1a1a] border border-[#333] overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            state.freePromptsUsed >= state.promptsLimit
                              ? 'bg-[#ff3333]'
                              : state.freePromptsUsed >= state.promptsLimit * 0.8
                                ? 'bg-[#f7ff00]'
                                : 'bg-[#00ff66]'
                          }`}
                          style={{ width: `${Math.min((state.freePromptsUsed / state.promptsLimit) * 100, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-mono ${
                        state.freePromptsUsed >= state.promptsLimit
                          ? 'text-[#ff3333]'
                          : state.freePromptsUsed >= state.promptsLimit * 0.8
                            ? 'text-[#f7ff00]'
                            : 'text-[#666]'
                      }`}>
                        {state.freePromptsUsed}/{state.promptsLimit}
                      </span>
                    </div>
                    {state.freePromptsUsed >= state.promptsLimit && (
                      <button
                        onClick={() => updateState({ showLimitModal: true })}
                        className="text-xs text-[#ff3333] hover:text-[#ff1493] uppercase tracking-wider font-display"
                      >
                        UPGRADE
                      </button>
                    )}
                  </div>
                )}

                {/* Nav links */}
                {state.user && (
                  <>
                    <button
                      onClick={openProjects}
                      className="text-xs text-[#666] hover:text-[#f7ff00] uppercase tracking-wider font-display flex items-center gap-1"
                    >
                      PROJECTS
                    </button>
                    <button
                      onClick={openMyLibrary}
                      className="text-xs text-[#f7ff00] hover:text-white uppercase tracking-wider font-display flex items-center gap-1"
                    >
                      LIBRARY
                    </button>
                  </>
                )}

                {/* Auth */}
                {state.user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#666] font-mono hidden sm:inline">{state.user.email}</span>
                    <button onClick={handleLogout} className="text-xs text-[#666] hover:text-white uppercase tracking-wider">
                      EXIT
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => updateState({ authModal: 'login' })}
                    className="text-xs text-[#f7ff00] hover:text-white uppercase tracking-wider font-display"
                  >
                    LOGIN
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={`max-w-6xl mx-auto px-4 ${state.step !== 'landing' ? 'py-12' : 'py-4'}`}>
        {state.step === 'landing' && (
          <LandingPage
            onStart={() => {
              if (state.user) {
                loadProjects();
                updateState({ step: 'projects' });
              } else {
                updateState({ step: 'brand-input' });
              }
            }}
            onLogin={() => updateState({ authModal: 'login' })}
            onSignup={() => updateState({ authModal: 'signup' })}
            user={state.user}
            onLogout={handleLogout}
          />
        )}
        {state.step === 'projects' && (
          <ProjectsList
            state={state}
            onSelectProject={selectProject}
            onCreateNew={() => updateState({ step: 'brand-input', currentProject: null, editingProject: null })}
            onEditProject={(project) => updateState({ step: 'brand-input', editingProject: project, currentProject: project, brand: project.name, website: project.website, industry: project.industry, challenge: project.challenge, targetAudience: project.target_audience || '', brandVoice: project.brand_voice || '' })}
            onDeleteProject={deleteProject}
            goBack={() => updateState({ step: 'landing' })}
          />
        )}
        {state.step === 'brand-input' && (
          <BrandInput
            state={state}
            setProvider={setProvider}
            submitBrandInfo={submitBrandInfo}
            onCreateProject={createProject}
            onUpdateProject={updateProject}
            goBack={() => state.user ? updateState({ step: 'projects', editingProject: null }) : updateState({ step: 'landing' })}
            updateState={updateState}
          />
        )}
        {state.step === 'mode-select' && (
          <ModeSelect
            state={state}
            updateState={updateState}
            onSelectMode={(mode) => {
              updateState({ campaignMode: mode });
              if (mode === 'discovery') {
                // Reset wizard to step 1 when entering discovery mode
                updateState({ step: 'discovery-brief', discoveryWizardStep: 1 });
              } else if (mode === 'upload') {
                updateState({ step: 'upload-brief' });
              } else {
                updateState({ step: 'discipline-select' });
              }
            }}
            goBack={() => state.user ? goBack('projects') : goBack('brand-input')}
          />
        )}
        {state.step === 'discovery-brief' && (
          <DiscoveryWizard
            state={state}
            updateState={updateState}
            onComplete={async () => {
              // Create campaign and generate message strategies
              updateState({ messageStrategiesLoading: true });
              try {
                // Create campaign with expanded brief fields
                const campaignRes = await fetch('/api/campaigns', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: state.user?.id,
                    brandId: state.currentProject?.id,
                    name: state.discoveryBrief.campaignName,
                    mode: 'discovery',
                    businessProblem: state.discoveryBrief.businessProblem,
                    successMetric: state.discoveryBrief.successMetric,
                    successMetricValue: state.discoveryBrief.successMetricValue,
                    timeline: state.discoveryBrief.timeline,
                    budget: state.discoveryBrief.budget,
                    campaignConstraints: state.discoveryBrief.constraints,
                    whatBeenTried: state.discoveryBrief.whatBeenTried,
                    // Expanded brief fields
                    targetAudience: state.discoveryBrief.targetAudience,
                    proposition: state.discoveryBrief.proposition,
                    support: state.discoveryBrief.support,
                    tone: state.discoveryBrief.tone,
                    mandatories: state.discoveryBrief.mandatories,
                  }),
                });
                const campaignData = await campaignRes.json();
                if (campaignData.campaign) {
                  updateState({ currentCampaign: campaignData.campaign });
                }

                // Generate message strategies with expanded brief context
                const strategyRes = await fetch('/api/campaigns/message-strategy', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    campaignId: campaignData.campaign?.id,
                    brandContext: {
                      name: state.currentProject?.name || state.brand,
                      industry: state.currentProject?.industry || state.industry,
                      targetAudience: state.discoveryBrief.targetAudience || state.currentProject?.target_audience || state.targetAudience,
                      valueProposition: state.discoveryBrief.proposition || state.currentProject?.value_proposition,
                    },
                    businessProblem: state.discoveryBrief.businessProblem,
                    successMetric: state.discoveryBrief.successMetric,
                    timeline: state.discoveryBrief.timeline,
                    budget: state.discoveryBrief.budget,
                    constraints: state.discoveryBrief.constraints,
                    whatBeenTried: state.discoveryBrief.whatBeenTried,
                    // Expanded brief fields for richer strategy generation
                    targetAudience: state.discoveryBrief.targetAudience,
                    proposition: state.discoveryBrief.proposition,
                    support: state.discoveryBrief.support,
                    tone: state.discoveryBrief.tone,
                    mandatories: state.discoveryBrief.mandatories,
                  }),
                });
                const strategyData = await strategyRes.json();
                if (strategyData.error) {
                  alert('Strategy generation failed: ' + strategyData.error);
                } else if (strategyData.strategies) {
                  updateState({ messageStrategies: strategyData.strategies, step: 'message-strategy' });
                } else {
                  alert('No strategies returned. Please try again.');
                }
              } catch (error: any) {
                console.error('Error creating campaign:', error);
                alert('Error: ' + (error.message || 'Failed to generate strategies'));
              } finally {
                updateState({ messageStrategiesLoading: false });
              }
            }}
            goBack={() => updateState({ step: 'mode-select', discoveryWizardStep: 1 })}
          />
        )}
        {state.step === 'message-strategy' && (
          <MessageStrategySelect
            state={state}
            onSelect={async (strategy) => {
              // Save the selected strategy
              updateState({ selectedStrategy: strategy, creativeIdeasLoading: true });
              // Update campaign with selected strategy
              if (state.currentCampaign?.id) {
                fetch('/api/campaigns', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    id: state.currentCampaign.id,
                    userId: state.user?.id,
                    selectedMessageStrategy: strategy,
                  }),
                });
              }
              // Generate creative ideas and move to creative-ideas step
              try {
                const ideasRes = await fetch('/api/creative-ideas', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    brandContext: {
                      name: state.currentProject?.name || state.brand,
                      industry: state.currentProject?.industry || state.industry,
                      valueProposition: state.currentProject?.value_proposition,
                    },
                    businessProblem: state.discoveryBrief.businessProblem,
                    selectedStrategy: strategy,
                    constraints: state.discoveryBrief.constraints,
                    targetAudience: state.currentProject?.target_audience || state.targetAudience,
                  }),
                });
                const ideasData = await ideasRes.json();
                if (ideasData.ideas) {
                  updateState({ creativeIdeas: ideasData.ideas, step: 'creative-ideas' });
                } else {
                  alert('Error generating creative ideas: ' + (ideasData.error || 'Unknown error'));
                }
              } catch (error: any) {
                console.error('Error generating creative ideas:', error);
                alert('Error generating creative ideas');
              } finally {
                updateState({ creativeIdeasLoading: false });
              }
            }}
            onRegenerate={async () => {
              updateState({ messageStrategiesLoading: true });
              try {
                const strategyRes = await fetch('/api/campaigns/message-strategy', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    campaignId: state.currentCampaign?.id,
                    brandContext: {
                      name: state.currentProject?.name || state.brand,
                      industry: state.currentProject?.industry || state.industry,
                      targetAudience: state.currentProject?.target_audience || state.targetAudience,
                    },
                    businessProblem: state.discoveryBrief.businessProblem,
                    successMetric: state.discoveryBrief.successMetric,
                    timeline: state.discoveryBrief.timeline,
                    budget: state.discoveryBrief.budget,
                    constraints: state.discoveryBrief.constraints,
                    whatBeenTried: state.discoveryBrief.whatBeenTried,
                  }),
                });
                const strategyData = await strategyRes.json();
                if (strategyData.strategies) {
                  updateState({ messageStrategies: strategyData.strategies });
                }
              } catch (error) {
                console.error('Error regenerating strategies:', error);
              } finally {
                updateState({ messageStrategiesLoading: false });
              }
            }}
            goBack={() => updateState({ step: 'discovery-brief', discoveryWizardStep: 6 })}
          />
        )}
        {state.step === 'creative-ideas' && (
          <CreativeIdeasSelect
            state={state}
            onSelect={(idea) => {
              updateState({ selectedCreativeIdea: idea });
              // Now trigger Planning Review before moving to Creative
              triggerPlanningReview();
            }}
            onRegenerate={async () => {
              updateState({ creativeIdeasLoading: true });
              try {
                const ideasRes = await fetch('/api/creative-ideas', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    brandContext: {
                      name: state.currentProject?.name || state.brand,
                      industry: state.currentProject?.industry || state.industry,
                      valueProposition: state.currentProject?.value_proposition,
                    },
                    businessProblem: state.discoveryBrief.businessProblem,
                    selectedStrategy: state.selectedStrategy,
                    constraints: state.discoveryBrief.constraints,
                    targetAudience: state.currentProject?.target_audience || state.targetAudience,
                  }),
                });
                const ideasData = await ideasRes.json();
                if (ideasData.ideas) {
                  updateState({ creativeIdeas: ideasData.ideas });
                }
              } catch (error) {
                console.error('Error regenerating creative ideas:', error);
              } finally {
                updateState({ creativeIdeasLoading: false });
              }
            }}
            goBack={() => updateState({ step: 'message-strategy' })}
          />
        )}
        {state.step === 'directed-brief' && (
          <DirectedBrief
            state={state}
            updateState={updateState}
            onSubmit={async () => {
              // Create campaign and run strategy check
              try {
                // Create campaign
                const campaignRes = await fetch('/api/campaigns', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: state.user?.id,
                    brandId: state.currentProject?.id,
                    name: state.directedBrief.campaignName,
                    mode: 'directed',
                    discipline: state.discipline,
                    goalType: state.directedBrief.goalType,
                    goalDescription: state.directedBrief.goalDescription,
                    campaignMandatories: state.directedBrief.campaignMandatories,
                  }),
                });
                const campaignData = await campaignRes.json();
                if (campaignData.campaign) {
                  updateState({ currentCampaign: campaignData.campaign });
                }

                // Run strategy check
                const checkRes = await fetch('/api/campaigns/strategy-check', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: state.user?.id,
                    campaignId: campaignData.campaign?.id,
                    discipline: state.discipline,
                    goalType: state.directedBrief.goalType,
                    goalDescription: state.directedBrief.goalDescription,
                    brandContext: {
                      industry: state.currentProject?.industry || state.industry,
                    },
                  }),
                });
                const checkData = await checkRes.json();

                if (!checkData.aligned && checkData.severity !== 'none') {
                  updateState({ strategyCheckResult: checkData, step: 'strategy-check' });
                } else {
                  // Aligned - go straight to execution
                  updateState({ step: 'library-view' });
                }
              } catch (error) {
                console.error('Error:', error);
                updateState({ step: 'library-view' });
              }
            }}
            goBack={() => updateState({ step: 'discipline-select' })}
          />
        )}
        {state.step === 'strategy-check' && (
          <StrategyCheckScreen
            state={state}
            onProceed={() => updateState({ step: 'library-view', strategyCheckResult: null })}
            onAddDiscipline={(disc) => {
              // User chose to add the suggested discipline
              updateState({ discipline: disc, step: 'library-view', strategyCheckResult: null });
            }}
            goBack={() => updateState({ step: 'directed-brief' })}
          />
        )}
        {state.step === 'upload-brief' && (
          <UploadBrief
            state={state}
            updateState={updateState}
            onParsed={(parsed, missingFields) => {
              updateState({
                uploadedBrief: parsed,
                step: 'brief-review',
              });
            }}
            goBack={() => updateState({ step: 'mode-select' })}
          />
        )}
        {state.step === 'brief-review' && (
          <BriefReview
            state={state}
            updateState={updateState}
            onComplete={() => {
              // After brief is complete, go to discipline select
              updateState({ step: 'discipline-select' });
            }}
            goBack={() => updateState({ step: 'upload-brief' })}
          />
        )}
        {state.step === 'discipline-select' && (
          <DisciplineSelect
            state={state}
            selectDiscipline={(disc) => {
              selectDiscipline(disc);
              // If in Directed mode, go to brief first
              if (state.campaignMode === 'directed') {
                updateState({ discipline: disc, step: 'directed-brief' });
              }
            }}
            goBack={() => state.campaignMode ? updateState({ step: 'mode-select' }) : (state.user ? goBack('projects') : goBack('brand-input'))}
          />
        )}
        {state.step === 'library-view' && (
          <LibraryView
            state={state}
            setMode={setMode}
            toggleModel={toggleModel}
            togglePrompt={togglePrompt}
            runPrompt={runPrompt}
            copyToClipboard={copyToClipboard}
            goBack={() => goBack('discipline-select')}
            onOpenPersonas={() => {
              loadPersonas();
              updateState({ showPersonaModal: true });
            }}
          />
        )}
        {state.step === 'llm-output' && (
          <LLMOutput
            state={state}
            updateState={updateState}
            copyLLMOutput={copyLLMOutput}
            switchModeAndRerun={switchModeAndRerun}
            goBack={() => goBack('library-view')}
            onSaveOriginal={() => saveToLibrary(false)}
            onSaveRemix={() => saveToLibrary(true)}
            onRemix={openRemixModal}
            onClearRemix={clearRemix}
            onToggleOriginal={() => updateState({ originalExpanded: !state.originalExpanded })}
            onToggleRemix={() => updateState({ remixExpanded: !state.remixExpanded })}
            onRebrief={regenerateWithFeedback}
            onSaveEdit={saveEditedOutput}
            onCancelEdit={cancelEdit}
            onSaveRemixEdit={saveEditedRemix}
            onCancelRemixEdit={cancelRemixEdit}
            onRebriefRemix={regenerateRemixWithFeedback}
          />
        )}
        {state.showRemixModal && (
          <RemixModal
            mode={state.mode}
            isLoading={state.remixLoading}
            onSelect={runRemix}
            onClose={closeRemixModal}
          />
        )}
        {state.showPersonaModal && (
          <PersonasManager
            personas={state.personas}
            selectedPersona={state.selectedPersona}
            isGenerating={state.personaGenerating}
            onGenerate={generatePersonas}
            onSelect={(persona) => {
              selectPersona(persona);
              updateState({ showPersonaModal: false });
            }}
            onDelete={deletePersona}
            onClose={() => updateState({ showPersonaModal: false })}
          />
        )}
        {state.showPlanningReview && (
          <PlanningReviewModal
            state={state}
            isLoading={state.planningReviewLoading}
            result={state.planningReviewResult}
            onApprove={handlePlanningApprove}
            onRefine={handlePlanningRefine}
            onSkip={handlePlanningSkip}
            onClose={() => updateState({ showPlanningReview: false, step: 'creative-ideas' })}
          />
        )}
        {state.step === 'my-library' && (
          <MyLibrary
            state={state}
            onDelete={deleteFromLibrary}
            goBack={() => state.user ? goBack('projects') : goBack('brand-input')}
            copyToClipboard={copyToClipboard}
          />
        )}
      </main>

      {state.step !== 'landing' && (
        <footer className="border-t border-slate-800 mt-12 py-6">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-sm text-slate-400 mb-2">
              Powered by{' '}
              <a href="https://fabricacollective.com" target="_blank" className="text-purple-400 hover:text-purple-300">
                Fabrica Collective
              </a>
            </p>
            <p className="text-xs text-slate-600">Sources: Reforge, Demand Curve, CXL, HubSpot, Semrush, Growth.Design</p>
          </div>
        </footer>
      )}
    </>
  );
}

// Auth Modal Component
function AuthModal({
  mode,
  onClose,
  onLogin,
  onSignup,
  onForgotPassword,
  onSwitchMode,
  isLoading,
  error,
  signupEmail,
}: {
  mode: AuthModal;
  onClose: () => void;
  onLogin: (email: string) => void;
  onSignup: (email: string, password: string) => void;
  onForgotPassword: (email: string) => void;
  onSwitchMode: (mode: AuthModal) => void;
  isLoading: boolean;
  error: string | null;
  signupEmail: string;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      onLogin(email); // Magic link - no password needed
    } else if (mode === 'signup') {
      onSignup(email, password);
    } else if (mode === 'forgot-password') {
      onForgotPassword(email);
    }
  };

  // Success screens
  if (mode === 'signup-success') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-md text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2">Check your email</h2>
          <p className="text-slate-400 mb-6">
            We sent a confirmation link to<br />
            <span className="text-white font-medium">{signupEmail}</span>
          </p>

          <div className="bg-slate-900/50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-slate-400">
              <span className="text-purple-400 font-medium">Next steps:</span>
            </p>
            <ol className="text-sm text-slate-400 mt-2 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <span>Open the email from Amplify</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <span>Click the confirmation link</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <span>You'll be automatically signed in</span>
              </li>
            </ol>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Didn't receive the email? Check your spam folder or{' '}
            <button onClick={() => onSwitchMode('signup')} className="text-purple-400 hover:text-purple-300">
              try again
            </button>
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'reset-sent') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-md text-center">
          {/* Email Icon */}
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2">Check your email</h2>
          <p className="text-slate-400 mb-6">
            We sent a magic link to<br />
            <span className="text-white font-medium">{signupEmail}</span>
          </p>

          <div className="bg-slate-900/50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-slate-400">
              <span className="text-purple-400 font-medium">Next steps:</span>
            </p>
            <ol className="text-sm text-slate-400 mt-2 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <span>Open the email from Amplify</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <span>Click the magic link</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <span>You'll be automatically signed in</span>
              </li>
            </ol>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Didn't receive the email? Check your spam folder or{' '}
            <button onClick={() => onSwitchMode('login')} className="text-purple-400 hover:text-purple-300">
              try again
            </button>
          </p>

          <button
            onClick={() => onSwitchMode('login')}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-all"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  // Forgot Password Form
  if (mode === 'forgot-password') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Reset password</h2>
              <p className="text-sm text-slate-400 mt-1">We'll send you a reset link</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                'Send reset link'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-4">
            Remember your password?{' '}
            <button onClick={() => onSwitchMode('login')} className="text-purple-400 hover:text-purple-300 font-medium">
              Log in
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Login / Signup Forms
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <p className="text-sm text-slate-400 mt-1">
              {mode === 'login' ? 'Sign in to continue to Amplify' : 'Start creating amazing marketing content'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              required
              autoFocus
            />
          </div>

          {/* Password field - only show for signup (login uses magic link) */}
          {mode === 'signup' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Must be at least 6 characters</p>
            </div>
          )}

          {/* Magic link hint for login */}
          {mode === 'login' && (
            <p className="text-xs text-slate-400 -mt-2">
              We'll send you a magic link to sign in - no password needed.
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {mode === 'login' ? 'Sending magic link...' : 'Creating account...'}
              </>
            ) : (
              mode === 'login' ? 'Send magic link' : 'Create account'
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-800 px-2 text-slate-500">or</span>
          </div>
        </div>

        <p className="text-center text-sm text-slate-400">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => onSwitchMode(mode === 'login' ? 'signup' : 'login')}
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            {mode === 'login' ? 'Sign up for free' : 'Sign in'}
          </button>
        </p>

        {mode === 'signup' && (
          <p className="text-center text-xs text-slate-500 mt-4">
            By creating an account, you agree to our Terms of Service
          </p>
        )}
      </div>
    </div>
  );
}

// Landing Page Component
function LandingPage({
  onStart,
  onLogin,
  onSignup,
  user,
  onLogout,
}: {
  onStart: () => void;
  onLogin: () => void;
  onSignup: () => void;
  user: User | null;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-[90vh] flex flex-col texture-grain">
      {/* Top nav - raw and direct */}
      <div className="flex justify-between items-center py-6 border-b-2 border-[#333]">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-[#f7ff00]"></div>
          <span className="font-display text-sm tracking-[0.2em] text-[#999]">FABRICA COLLECTIVE</span>
        </div>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#666] font-mono">{user.email}</span>
            <button onClick={onLogout} className="text-sm text-[#999] hover:text-white uppercase tracking-wider">Exit</button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button onClick={onLogin} className="text-sm text-[#999] hover:text-white uppercase tracking-wider">Log in</button>
            <button onClick={onSignup} className="btn-primary btn-sm">Sign up</button>
          </div>
        )}
      </div>

      {/* Hero - bold and unapologetic */}
      <div className="flex-1 flex flex-col justify-center py-16 md:py-24">
        <div className="max-w-5xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-[2px] w-12 bg-[#f7ff00]"></div>
            <span className="font-display text-sm tracking-[0.3em] text-[#f7ff00]">YOUR VIRTUAL AGENCY ROOM</span>
          </div>

          {/* Main headline - massive and loud */}
          <h1 className="headline-xl text-white mb-2">
            AMPLIFY
          </h1>
          <h2 className="headline-lg text-[#ff1493] mb-8 -mt-2">
            START WITH STRATEGY,<br/>NOT CHANNELS.
          </h2>

          {/* Subtext */}
          <p className="text-xl md:text-2xl text-[#999] max-w-2xl mb-12 leading-relaxed">
            The smoke-filled war room where AI meets advertising's golden age.
            <span className="text-white"> Planning → Creative → Results.</span>
          </p>

          {/* Mode toggle - punk style */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <div className="inline-flex border-3 border-white">
              <div className="px-6 py-3 bg-[#f7ff00] text-black font-display text-lg tracking-wide flex items-center gap-2">
                <span className="text-xl">📋</span> PLANNING
              </div>
              <div className="px-6 py-3 bg-transparent text-[#666] font-display text-lg tracking-wide flex items-center gap-2 border-l-3 border-white">
                <span className="text-xl">🎨</span> CREATIVE
              </div>
            </div>
            <span className="text-[#666] font-mono text-sm">// TOGGLE YOUR DEPARTMENT</span>
          </div>

          {/* CTA - bold and dangerous */}
          <div className="flex flex-wrap items-center gap-6">
            <button
              onClick={onStart}
              className="btn-primary text-xl px-10 py-5 flex items-center gap-4"
            >
              ENTER THE WAR ROOM
              <span className="text-2xl">→</span>
            </button>
            <span className="text-[#666] font-mono text-sm">FREE TO START</span>
          </div>
        </div>
      </div>

      {/* How it works - industrial grid */}
      <div className="py-16 border-t-2 border-[#333]">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="headline-md text-white">THE PROCESS</h2>
          <div className="flex-1 h-[2px] bg-[#333]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
          <div className="p-6 border-2 border-[#333] -ml-[2px] -mt-[2px]">
            <div className="text-6xl font-display text-[#f7ff00] mb-4">01</div>
            <h3 className="font-display text-xl mb-2 text-white">BRIEF IN</h3>
            <p className="text-[#666] text-sm leading-relaxed">Brand, industry, challenge. Set the battlefield.</p>
          </div>
          <div className="p-6 border-2 border-[#333] -ml-[2px] -mt-[2px]">
            <div className="text-6xl font-display text-[#ff1493] mb-4">02</div>
            <h3 className="font-display text-xl mb-2 text-white">PLANNING</h3>
            <p className="text-[#666] text-sm leading-relaxed">Define the problem. Develop strategy. Pick your angle.</p>
          </div>
          <div className="p-6 border-2 border-[#333] -ml-[2px] -mt-[2px]">
            <div className="text-6xl font-display text-[#ff3333] mb-4">03</div>
            <h3 className="font-display text-xl mb-2 text-white">REVIEW</h3>
            <p className="text-[#666] text-sm leading-relaxed">AI sanity-check. Is your brief ready for prime time?</p>
          </div>
          <div className="p-6 border-2 border-[#333] -ml-[2px] -mt-[2px]">
            <div className="text-6xl font-display text-[#00ff66] mb-4">04</div>
            <h3 className="font-display text-xl mb-2 text-white">CREATIVE</h3>
            <p className="text-[#666] text-sm leading-relaxed">Generate. Remix. Launch. Win.</p>
          </div>
        </div>
      </div>

      {/* Footer - minimal and raw */}
      <div className="py-8 border-t-2 border-[#333] flex flex-wrap justify-between items-center gap-4">
        <p className="text-sm text-[#666]">
          Built by <a href="https://fabricacollective.com" target="_blank" className="text-[#f7ff00] hover:underline">FABRICA COLLECTIVE</a>
        </p>
        <p className="text-xs text-[#444] font-mono">REFORGE × DEMAND CURVE × CXL × HUBSPOT</p>
      </div>
    </div>
  );
}

// Projects List Component
function ProjectsList({
  state,
  onSelectProject,
  onCreateNew,
  onEditProject,
  onDeleteProject,
  goBack,
}: {
  state: State;
  onSelectProject: (project: Project) => void;
  onCreateNew: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => Promise<boolean>;
  goBack: () => void;
}) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDelete = async (projectId: string) => {
    setIsDeleting(true);
    await onDeleteProject(projectId);
    setIsDeleting(false);
    setDeleteConfirm(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-[2px] w-8 bg-[#f7ff00]"></div>
          <span className="font-display text-sm tracking-[0.3em] text-[#f7ff00]">SELECT OR CREATE</span>
        </div>
        <h2 className="headline-lg text-white">YOUR PROJECTS</h2>
      </div>

      {state.projectsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#f7ff00] border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Create New Project Button */}
          <button
            onClick={onCreateNew}
            className="w-full p-6 border-2 border-dashed border-[#333] hover:border-[#f7ff00] bg-[#1a1a1a] transition-all flex items-center gap-4 group"
          >
            <div className="w-14 h-14 bg-[#f7ff00] flex items-center justify-center text-black font-display text-3xl group-hover:bg-white transition-colors">
              +
            </div>
            <div className="text-left">
              <div className="font-display text-xl text-white group-hover:text-[#f7ff00] transition-colors">NEW PROJECT</div>
              <div className="text-sm text-[#666]">Add a new brand or client</div>
            </div>
          </button>

          {/* Existing Projects */}
          {state.projects.length > 0 ? (
            state.projects.map((project) => (
              <div
                key={project.id}
                className="bg-[#1a1a1a] border-2 border-[#333] overflow-hidden hover:border-[#666] transition-colors group"
              >
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => onSelectProject(project)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-[#ff1493] flex items-center justify-center text-white font-display text-2xl">
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-display text-xl text-white group-hover:text-[#f7ff00] transition-colors">
                          {project.name.toUpperCase()}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-[#666] mt-1 font-mono">
                          <span>{project.industry}</span>
                          {project.website && (
                            <>
                              <span className="text-[#333]">//</span>
                              <span>{project.website}</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-[#999] mt-2 line-clamp-2">{project.challenge}</p>
                      </div>
                    </div>
                    <div className="text-xs text-[#444] font-mono whitespace-nowrap">
                      {formatDate(project.updated_at)}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 border-t-2 border-[#333] bg-[#0a0a0a] flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(project);
                    }}
                    className="btn-primary btn-sm flex items-center gap-2"
                  >
                    CONTINUE →
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProject(project);
                      }}
                      className="px-3 py-2 text-[#666] hover:text-white text-xs font-display tracking-wider transition-colors"
                    >
                      EDIT
                    </button>
                    {deleteConfirm === project.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#666] font-display">DELETE?</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(project.id);
                          }}
                          disabled={isDeleting}
                          className="px-3 py-1.5 bg-[#ff3333] text-white text-xs font-display tracking-wider transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? '...' : 'YES'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(null);
                          }}
                          className="px-3 py-1.5 bg-[#333] text-white text-xs font-display tracking-wider transition-colors"
                        >
                          NO
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(project.id);
                        }}
                        className="px-3 py-2 text-[#ff3333] hover:text-[#ff1493] text-xs font-display tracking-wider transition-colors"
                      >
                        DELETE
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-[#666] border-2 border-dashed border-[#333]">
              <p className="font-display text-lg">NO PROJECTS YET</p>
              <p className="text-sm mt-2">Create your first one to get started</p>
            </div>
          )}
        </div>
      )}

      <button onClick={goBack} className="mt-12 mx-auto flex items-center gap-3 text-[#666] hover:text-[#f7ff00] transition-colors font-display tracking-wider">
        <span>←</span>
        BACK TO HOME
      </button>
    </div>
  );
}

// Brand Input Component
function BrandInput({
  state,
  setProvider,
  submitBrandInfo,
  onCreateProject,
  onUpdateProject,
  goBack,
  updateState,
}: {
  state: State;
  setProvider: (p: Provider) => void;
  submitBrandInfo: () => void;
  onCreateProject?: (name: string, website: string, industry: string, challenge: string, targetAudience: string, brandVoice: string) => Promise<Project | null>;
  onUpdateProject?: (project: Project) => Promise<boolean>;
  goBack?: () => void;
  updateState: (updates: Partial<State>) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  // Auto-expand if editing or if there's existing data
  const hasExistingBrandData = !!(state.targetAudience || state.brandVoice || state.editingProject?.target_audience || state.editingProject?.brand_voice);
  const [showAdvanced, setShowAdvanced] = useState(hasExistingBrandData);
  const isEditing = !!state.editingProject;
  const isLoggedIn = !!state.user;

  // Calculate profile completion
  const getProfileCompletion = () => {
    const fields = [
      state.brand || (document.getElementById('brand') as HTMLInputElement)?.value,
      state.industry || (document.getElementById('industry') as HTMLInputElement)?.value,
      state.challenge || (document.getElementById('challenge') as HTMLTextAreaElement)?.value,
      state.targetAudience || (document.getElementById('targetAudience') as HTMLTextAreaElement)?.value,
      state.brandVoice || (document.getElementById('brandVoice') as HTMLTextAreaElement)?.value,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleSubmit = async () => {
    const brand = (document.getElementById('brand') as HTMLInputElement)?.value || '';
    const website = (document.getElementById('website') as HTMLInputElement)?.value || '';
    const industry = (document.getElementById('industry') as HTMLInputElement)?.value || '';
    const challenge = (document.getElementById('challenge') as HTMLTextAreaElement)?.value || '';
    const targetAudience = (document.getElementById('targetAudience') as HTMLTextAreaElement)?.value || '';
    const brandVoice = (document.getElementById('brandVoice') as HTMLTextAreaElement)?.value || '';
    const apiKeyInput = (document.getElementById('apiKey') as HTMLInputElement)?.value || '';

    if (!brand || !industry || !challenge) {
      alert('Please fill in Brand, Industry, and Challenge fields');
      return;
    }

    if (state.llmProvider !== 'gemini' && state.llmProvider !== 'none') {
      localStorage.setItem('amplify_api_key', apiKeyInput);
      // Also update state immediately so the API key is available for calls
      updateState({ apiKey: apiKeyInput });
    }

    // If logged in, save as project
    if (isLoggedIn && onCreateProject && onUpdateProject) {
      setIsSaving(true);
      if (isEditing && state.editingProject) {
        // Update existing project
        const success = await onUpdateProject({
          ...state.editingProject,
          name: brand,
          website,
          industry,
          challenge,
          target_audience: targetAudience,
          brand_voice: brandVoice,
        });
        setIsSaving(false);
        if (success) {
          // Continue to discipline select after update
        }
      } else {
        // Create new project
        const project = await onCreateProject(brand, website, industry, challenge, targetAudience, brandVoice);
        setIsSaving(false);
        if (!project) {
          alert('Failed to save project. Please try again.');
          return;
        }
      }
      // Also call submitBrandInfo to update the main state (including API key)
      submitBrandInfo();
    } else {
      // Not logged in, just continue with the flow
      submitBrandInfo();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-[2px] w-8 bg-[#f7ff00]"></div>
          <span className="font-display text-sm tracking-[0.3em] text-[#f7ff00]">
            {isEditing ? 'EDIT PROFILE' : isLoggedIn ? 'NEW PROJECT' : 'BRIEF IN'}
          </span>
        </div>
        <h2 className="headline-lg text-white">
          {isEditing ? 'UPDATE YOUR' : isLoggedIn ? 'CREATE YOUR' : 'TELL US ABOUT YOUR'}
        </h2>
        <h2 className="headline-lg text-[#ff1493] -mt-2">BRAND</h2>
      </div>

      {/* First-time user tip */}
      {!isEditing && !isLoggedIn && (
        <div className="mb-8 p-4 bg-[#1a1a1a] border-2 border-[#f7ff00]">
          <div className="flex gap-3">
            <div className="text-[#f7ff00] font-display text-2xl">!</div>
            <div>
              <p className="text-sm text-[#f7ff00] font-display tracking-wide">THE MORE CONTEXT, THE BETTER</p>
              <p className="text-xs text-[#666] mt-1">Complete profiles generate 3x more relevant content. Fill everything.</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#1a1a1a] border-2 border-[#333] p-6 space-y-6">
        <div>
          <label className="block text-xs font-display tracking-[0.2em] text-[#f7ff00] mb-2">{isLoggedIn ? 'PROJECT NAME *' : 'BRAND NAME *'}</label>
          <input type="text" id="brand" defaultValue={state.brand} placeholder="e.g., Acme Inc." className="input-raw w-full" />
        </div>

        <div>
          <label className="block text-xs font-display tracking-[0.2em] text-[#999] mb-2">WEBSITE</label>
          <input type="text" id="website" defaultValue={state.website} placeholder="e.g., acme.com" className="input-raw w-full" />
        </div>

        <div>
          <label className="block text-xs font-display tracking-[0.2em] text-[#f7ff00] mb-2">INDUSTRY / NICHE *</label>
          <input type="text" id="industry" defaultValue={state.industry} placeholder="e.g., B2B SaaS, E-commerce, Healthcare" className="input-raw w-full" />
        </div>

        <div>
          <label className="block text-xs font-display tracking-[0.2em] text-[#f7ff00] mb-2">BUSINESS CHALLENGE *</label>
          <textarea id="challenge" rows={3} defaultValue={state.challenge} placeholder="e.g., We need to increase organic traffic by 50% in Q1..." className="input-raw w-full resize-none" />
          <p className="text-xs text-[#666] mt-2 font-mono">// Be specific. This context makes prompts 10x better.</p>
        </div>

        {/* Brand Voice Section */}
        <div className="pt-6 border-t-2 border-[#333]">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-left group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-display tracking-[0.2em] text-white group-hover:text-[#f7ff00] transition-colors">BRAND VOICE & AUDIENCE</span>
              <span className="tag tag-yellow text-[10px]">RECOMMENDED</span>
            </div>
            <span className={`text-[#666] transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showAdvanced && (
            <div className="mt-6 space-y-6">
              <div>
                <label className="block text-xs font-display tracking-[0.2em] text-[#999] mb-2">TARGET AUDIENCE</label>
                <textarea
                  id="targetAudience"
                  rows={2}
                  defaultValue={state.targetAudience}
                  placeholder="e.g., Marketing managers at B2B SaaS companies with 50-500 employees..."
                  className="input-raw w-full resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-display tracking-[0.2em] text-[#999] mb-2">BRAND VOICE & TONE</label>
                <textarea
                  id="brandVoice"
                  rows={2}
                  defaultValue={state.brandVoice}
                  placeholder="e.g., Professional but warm. Clear language, no jargon..."
                  className="input-raw w-full resize-none"
                />
              </div>

              {/* Profile Completion Indicator */}
              <div className="bg-[#0a0a0a] border-2 border-[#333] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-display tracking-wider text-[#666]">PROFILE COMPLETION</span>
                  <span className="text-sm font-mono text-[#f7ff00]">{getProfileCompletion()}%</span>
                </div>
                <div className="h-2 bg-[#1a1a1a] border border-[#333] overflow-hidden">
                  <div
                    className="h-full bg-[#f7ff00] transition-all duration-300"
                    style={{ width: `${getProfileCompletion()}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div id="apiKeySection" className="pt-6 border-t-2 border-[#333]">
          <label className="block text-xs font-display tracking-[0.2em] text-white mb-4">AI PROVIDER</label>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setProvider('gemini')} className={`flex-1 px-4 py-3 font-display text-sm tracking-wider border-2 transition-all ${state.llmProvider === 'gemini' ? 'border-[#00ff66] bg-[#00ff66]/10 text-[#00ff66]' : 'border-[#333] text-[#666] hover:border-[#666]'}`}>GEMINI (FREE)</button>
            <button onClick={() => setProvider('openai')} className={`flex-1 px-4 py-3 font-display text-sm tracking-wider border-2 transition-all ${state.llmProvider === 'openai' ? 'border-[#f7ff00] bg-[#f7ff00]/10 text-[#f7ff00]' : 'border-[#333] text-[#666] hover:border-[#666]'}`}>OPENAI</button>
            <button onClick={() => setProvider('anthropic')} className={`flex-1 px-4 py-3 font-display text-sm tracking-wider border-2 transition-all ${state.llmProvider === 'anthropic' ? 'border-[#ff1493] bg-[#ff1493]/10 text-[#ff1493]' : 'border-[#333] text-[#666] hover:border-[#666]'}`}>ANTHROPIC</button>
          </div>
          {state.llmProvider === 'gemini' ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-[#1a1a1a] border border-[#333] overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    state.freePromptsUsed >= state.promptsLimit
                      ? 'bg-[#ff3333]'
                      : state.freePromptsUsed >= state.promptsLimit * 0.8
                        ? 'bg-[#f7ff00]'
                        : 'bg-[#00ff66]'
                  }`}
                  style={{ width: `${Math.min((state.freePromptsUsed / state.promptsLimit) * 100, 100)}%` }}
                />
              </div>
              <span className={`text-xs font-mono ${
                state.freePromptsUsed >= state.promptsLimit
                  ? 'text-[#ff3333]'
                  : state.freePromptsUsed >= state.promptsLimit * 0.8
                    ? 'text-[#f7ff00]'
                    : 'text-[#00ff66]'
              }`}>
                {state.promptsLimit - state.freePromptsUsed} LEFT
              </span>
            </div>
          ) : (
            <>
              <input
                type="password"
                id="apiKey"
                value={state.apiKey}
                onChange={(e) => updateState({ apiKey: e.target.value })}
                placeholder={state.llmProvider === 'openai' ? 'sk-...' : 'sk-ant-...'}
                className="input-raw w-full"
              />
              <p className="text-xs text-[#666] mt-2 font-mono">// Stored locally. Never leaves your browser.</p>
            </>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-black/30 border-t-black animate-spin" />
              SAVING...
            </>
          ) : (
            <>
              {isEditing ? 'SAVE & CONTINUE' : isLoggedIn ? 'CREATE PROJECT' : 'CONTINUE'} →
            </>
          )}
        </button>

        {goBack && (
          <button
            onClick={goBack}
            className="w-full py-3 text-[#666] hover:text-[#f7ff00] flex items-center justify-center gap-2 transition-colors font-display tracking-wider"
          >
            ← {isLoggedIn ? 'BACK TO PROJECTS' : 'BACK'}
          </button>
        )}
      </div>
    </div>
  );
}

// Discipline Select Component
function DisciplineSelect({ state, selectDiscipline, goBack }: { state: State; selectDiscipline: (v: string) => void; goBack: () => void }) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="tag tag-pink">{state.brand.toUpperCase()}</div>
          <span className="text-[#333] font-display">//</span>
          <span className="text-[#666] text-sm font-display tracking-wider">{state.industry.toUpperCase()}</span>
        </div>
        <h2 className="headline-lg text-white">CHOOSE YOUR</h2>
        <h2 className="headline-lg text-[#f7ff00] -mt-2">WEAPON</h2>
        <p className="text-[#666] mt-4">Select a discipline. Each one is loaded with specialized prompts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
        {disciplines.map((d, index) => (
          <button
            key={d.value}
            onClick={() => selectDiscipline(d.value)}
            className="p-6 border-2 border-[#333] -ml-[2px] -mt-[2px] transition-all text-left bg-[#1a1a1a] hover:bg-[#0a0a0a] hover:border-[#f7ff00] group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 font-display text-6xl text-[#1a1a1a] group-hover:text-[#222] transition-colors">
              {String(index + 1).padStart(2, '0')}
            </div>
            <div className="relative z-10">
              <div className="text-4xl mb-4">{d.icon}</div>
              <div className="font-display text-xl text-white group-hover:text-[#f7ff00] transition-colors tracking-wide">{d.label.toUpperCase()}</div>
              <div className="text-sm text-[#666] mt-2 group-hover:text-[#999] transition-colors">{d.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <button onClick={goBack} className="mt-12 mx-auto flex items-center gap-3 text-[#666] hover:text-[#f7ff00] transition-colors font-display tracking-wider">
        ← EDIT BRIEF
      </button>
    </div>
  );
}

// Library View Component
function LibraryView({ state, setMode, toggleModel, togglePrompt, runPrompt, copyToClipboard, goBack, onOpenPersonas }: { state: State; setMode: (m: Mode) => void; toggleModel: (i: number) => void; togglePrompt: (i: number) => void; runPrompt: (i: number) => void; copyToClipboard: (t: string, id: number | string) => void; goBack: () => void; onOpenPersonas: () => void }) {
  const lib = state.library;

  return (
    <div className="space-y-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={goBack} className="flex items-center gap-2 text-[#666] hover:text-[#f7ff00] transition-colors font-display tracking-wider">
          ← BACK
        </button>
        <div className="tag tag-pink">{state.brand.toUpperCase()}</div>
      </div>

      {/* Mode toggle - punk style */}
      <div className="flex justify-center">
        <div className="inline-flex border-2 border-white">
          <button
            onClick={() => setMode('strategy')}
            className={`px-6 py-3 font-display text-sm tracking-wide flex items-center gap-2 transition-all ${state.mode === 'strategy' ? 'bg-[#f7ff00] text-black' : 'bg-transparent text-[#666] hover:text-white'}`}
          >
            📋 PLANNING
          </button>
          <button
            onClick={() => setMode('execution')}
            className={`px-6 py-3 font-display text-sm tracking-wide flex items-center gap-2 transition-all border-l-2 border-white ${state.mode === 'execution' ? 'bg-[#00ff66] text-black' : 'bg-transparent text-[#666] hover:text-white'}`}
          >
            🎨 CREATIVE
          </button>
        </div>
      </div>
      <p className="text-center text-xs text-[#666] font-mono">// {state.mode === 'strategy' ? 'Define strategy, validate briefs, develop message angles' : 'Execute within your approved strategic direction'}</p>

      {/* Skipped Planning Review Warning */}
      {state.skippedPlanningReview && state.mode === 'execution' && (
        <div className="max-w-2xl mx-auto bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <span className="text-amber-400 text-xl">⚠️</span>
          <div className="flex-1">
            <p className="text-amber-300 font-medium">Strategy not reviewed</p>
            <p className="text-sm text-amber-200/70 mt-1">
              You skipped Planning Review. Your creative outputs may not be strategically aligned.
              <button
                onClick={() => setMode('strategy')}
                className="ml-2 underline hover:text-amber-100"
              >
                Return to Planning
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Target Persona Selector */}
      <div className="flex justify-center">
        <button
          onClick={onOpenPersonas}
          className={`px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-3 ${
            state.selectedPersona
              ? 'border-purple-500 bg-purple-500/10 hover:bg-purple-500/20'
              : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
          }`}
        >
          <span className="text-2xl">
            {state.selectedPersona?.avatar_emoji || '👥'}
          </span>
          <div className="text-left">
            <div className="text-xs text-slate-400">Target Persona</div>
            <div className="font-medium">
              {state.selectedPersona ? state.selectedPersona.name : 'General Audience'}
            </div>
          </div>
          <svg className="w-4 h-4 text-slate-400 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">{lib.title}</h2>
        <p className="text-slate-400 leading-relaxed">{lib.summary}</p>
      </div>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400">
            <span dangerouslySetInnerHTML={{ __html: icons.brain }} />
          </div>
          <h3 className="text-xl font-bold">Mental Models</h3>
          <span className="text-sm text-slate-500">({lib.mentalModels.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lib.mentalModels.map((model: any, index: number) => (
            <MentalModelCard key={index} model={model} isOpen={state.expandedModels[index]} onToggle={() => toggleModel(index)} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-cyan-600/20 flex items-center justify-center text-cyan-400">
            <span dangerouslySetInnerHTML={{ __html: icons.zap }} />
          </div>
          <h3 className="text-xl font-bold">Personalized Prompts</h3>
          <span className="text-sm text-slate-500">(10)</span>
        </div>
        <div className="space-y-4">
          {lib.prompts.map((prompt: any, index: number) => (
            <PromptCard key={index} prompt={prompt} state={state} isExpanded={state.expandedPrompts[index]} isCopied={state.copiedId === prompt.id} onToggle={() => togglePrompt(index)} onRun={() => runPrompt(index)} onCopy={(text) => copyToClipboard(text, prompt.id)} />
          ))}
        </div>
      </section>
    </div>
  );
}

function MentalModelCard({ model, isOpen, onToggle }: { model: any; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex items-start justify-between cursor-pointer" onClick={onToggle}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0 text-purple-400">
            <span dangerouslySetInnerHTML={{ __html: icons.brain }} />
          </div>
          <div>
            <h4 className="font-semibold text-white">{model.name}</h4>
            <p className="text-sm text-slate-400 mt-1">{model.description}</p>
          </div>
        </div>
        <button className="text-slate-500 hover:text-slate-300">
          <span dangerouslySetInnerHTML={{ __html: isOpen ? icons.chevronUp : icons.chevronDown }} />
        </button>
      </div>
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
          <div className="flex items-start gap-2">
            <span className="text-yellow-400 mt-1" dangerouslySetInnerHTML={{ __html: icons.lightbulb }} />
            <p className="text-sm text-slate-300">{model.lesson}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span dangerouslySetInnerHTML={{ __html: icons.book }} />
            <span>{model.source}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function PromptCard({ prompt, state, isExpanded, isCopied, onToggle, onRun, onCopy }: { prompt: any; state: State; isExpanded: boolean; isCopied: boolean; onToggle: () => void; onRun: () => void; onCopy: (text: string) => void }) {
  const personalized = personalizePrompt(prompt.prompt, state);
  const displayText = isExpanded ? personalized : personalized.length > 180 ? personalized.slice(0, 180) + '...' : personalized;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-white">{prompt.id}</div>
            <div>
              <span className="text-xs font-medium text-cyan-400 uppercase tracking-wide">Prompt {prompt.id}</span>
              <h4 className="font-semibold text-white mt-1">{prompt.goal}</h4>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onCopy(personalized)} className={`p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors ${isCopied ? 'text-green-400' : 'text-slate-400'}`} title="Copy prompt">
              <span dangerouslySetInnerHTML={{ __html: isCopied ? icons.check : icons.copy }} />
            </button>
            <button onClick={onRun} className="px-3 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm font-medium flex items-center gap-1 transition-all" title="Run with AI">
              <span dangerouslySetInnerHTML={{ __html: icons.play }} /> Run
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-slate-900 rounded-lg">
          <p className="text-sm text-slate-300 font-mono leading-relaxed">{displayText}</p>
          {personalized.length > 180 && (
            <button onClick={onToggle} className="text-xs text-cyan-400 hover:text-cyan-300 mt-2 flex items-center gap-1">
              {isExpanded ? 'Show less' : 'Show more'}
              <span dangerouslySetInnerHTML={{ __html: isExpanded ? icons.chevronUp : icons.chevronDown }} />
            </button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center gap-2 text-xs font-medium text-purple-400 mb-2">
              <span dangerouslySetInnerHTML={{ __html: icons.target }} /> Why this fits
            </div>
            <p className="text-xs text-slate-400">{prompt.whyFits}</p>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center gap-2 text-xs font-medium text-green-400 mb-2">
              <span dangerouslySetInnerHTML={{ __html: icons.zap }} /> How to use it
            </div>
            <p className="text-xs text-slate-400">{prompt.howUsed}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LLMOutput({
  state,
  updateState,
  copyLLMOutput,
  switchModeAndRerun,
  goBack,
  onSaveOriginal,
  onSaveRemix,
  onRemix,
  onClearRemix,
  onToggleOriginal,
  onToggleRemix,
  onRebrief,
  onSaveEdit,
  onCancelEdit,
  onSaveRemixEdit,
  onCancelRemixEdit,
  onRebriefRemix,
}: {
  state: State;
  updateState: (updates: Partial<State>) => void;
  copyLLMOutput: (id: string) => void;
  switchModeAndRerun: (m: Mode) => void;
  goBack: () => void;
  onSaveOriginal: () => void;
  onSaveRemix: () => void;
  onRemix: () => void;
  onClearRemix: () => void;
  onToggleOriginal: () => void;
  onToggleRemix: () => void;
  onRebrief: (feedback: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onSaveRemixEdit: () => void;
  onCancelRemixEdit: () => void;
  onRebriefRemix: (feedback: string) => void;
}) {
  const isLimitReached = state.llmOutput.startsWith('__LIMIT_REACHED__');
  const content = isLimitReached ? state.llmOutput.replace('__LIMIT_REACHED__\n\n', '') : state.llmOutput;
  const hasRemix = !!state.remixedOutput;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={goBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <span dangerouslySetInnerHTML={{ __html: icons.arrowLeft }} /> Back to Prompts
        </button>
        <div className="flex items-center gap-2">
          {!isLimitReached && !state.isLoading && (
            <>
              <button
                onClick={onRemix}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-lg text-sm flex items-center gap-2 transition-colors text-white"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {state.mode === 'strategy' ? 'Planning' : 'Creative'} Remix
              </button>
{hasRemix ? (
                <>
                  <button
                    onClick={onSaveOriginal}
                    disabled={state.saveStatus === 'saving'}
                    className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors bg-slate-600 hover:bg-slate-500 text-white"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Save Original
                  </button>
                  <button
                    onClick={onSaveRemix}
                    disabled={state.saveStatus === 'saving'}
                    className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                      state.saveStatus === 'saved'
                        ? 'bg-green-600 text-white'
                        : state.saveStatus === 'error'
                        ? 'bg-red-600 text-white'
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
                  >
                    {state.saveStatus === 'saving' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : state.saveStatus === 'saved' ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Saved!
                      </>
                    ) : state.saveStatus === 'error' ? (
                      'Error'
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        Save Remix
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={onSaveOriginal}
                  disabled={state.saveStatus === 'saving'}
                  className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    state.saveStatus === 'saved'
                      ? 'bg-green-600 text-white'
                      : state.saveStatus === 'error'
                      ? 'bg-red-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  {state.saveStatus === 'saving' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : state.saveStatus === 'saved' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Saved!
                    </>
                  ) : state.saveStatus === 'error' ? (
                    'Error'
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      Save to Library
                    </>
                  )}
                </button>
              )}
            </>
          )}
          <button onClick={() => copyLLMOutput('output')} className={`px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-2 transition-colors ${state.copiedId === 'output' ? 'text-green-400' : ''}`}>
            <span dangerouslySetInnerHTML={{ __html: state.copiedId === 'output' ? icons.check : icons.copy }} />
            Copy
          </button>
        </div>
      </div>

      {state.selectedPrompt && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Prompt Used</div>
          <div className="text-sm text-slate-300 mb-3">{state.selectedPrompt.goal}</div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-700">
            <div className="inline-flex items-center bg-slate-900 rounded-lg p-1">
              <button onClick={() => switchModeAndRerun('strategy')} className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${state.mode === 'strategy' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>📋 Planning</button>
              <button onClick={() => switchModeAndRerun('execution')} className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${state.mode === 'execution' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}>🎨 Creative</button>
            </div>
            <span className="text-xs text-slate-500">Switch role to regenerate</span>
          </div>
        </div>
      )}

      {/* Original Output - Accordion */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <button
          onClick={onToggleOriginal}
          className="w-full p-4 border-b border-slate-700 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span dangerouslySetInnerHTML={{ __html: icons.sparkles }} />
            <span className="font-medium">{isLimitReached ? 'Notice' : 'AI Response'}</span>
            {!state.originalExpanded && !state.isLoading && (
              <span className="text-xs text-slate-500 ml-2">(click to expand)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {state.isLoading && <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />}
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${state.originalExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        {state.originalExpanded && (
          <div className="p-6">
            {state.isLoading ? (
              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <span>Generating personalized {state.mode === 'strategy' ? 'strategy' : 'content'} for {state.brand}...</span>
              </div>
            ) : isLimitReached ? (
              <div className="space-y-4 text-center">
                <p className="text-yellow-400 text-lg">Free limit reached</p>
                <p className="text-slate-400">{content}</p>
              </div>
            ) : state.isEditingOutput ? (
              /* Edit Mode */
              <div className="space-y-4">
                <textarea
                  value={state.editedOutput}
                  onChange={(e) => updateState({ editedOutput: e.target.value })}
                  className="w-full h-96 px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white font-mono text-sm focus:border-purple-500 focus:outline-none resize-y"
                  placeholder="Edit the output..."
                />
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={onCancelEdit}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSaveEdit}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm text-white transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              /* Normal View with Edit/Re-brief options */
              <div>
                <div className="markdown-output text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: simpleMarkdown(content) }} />

                {/* Edit / Re-brief Buttons */}
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => updateState({ isEditingOutput: true, editedOutput: content })}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => updateState({ showRebriefModal: true })}
                    className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/50 rounded-lg text-sm flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Re-brief & Regenerate
                  </button>
                  <span className="text-xs text-slate-500 ml-2">Not quite right? Give feedback to regenerate.</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Re-brief Modal */}
      {state.showRebriefModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-2">Creative Re-brief</h3>
            <p className="text-slate-400 text-sm mb-4">
              Tell us what's not working and we'll regenerate with your feedback.
            </p>
            <textarea
              value={state.rebriefFeedback}
              onChange={(e) => updateState({ rebriefFeedback: e.target.value })}
              placeholder="e.g., 'The tone is too formal - make it more conversational' or 'Include more specific statistics' or 'The opening hook is weak'"
              rows={4}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:border-purple-500 focus:outline-none resize-none mb-4"
              autoFocus
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => updateState({ showRebriefModal: false, rebriefFeedback: '' })}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onRebrief(state.rebriefFeedback)}
                disabled={!state.rebriefFeedback.trim()}
                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                  state.rebriefFeedback.trim()
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remixed Output - Accordion */}
      {hasRemix && state.remixPersona && (
        <div
          className="rounded-2xl border-2 overflow-hidden"
          style={{
            borderColor: state.remixPersona.colors[0],
            background: `linear-gradient(135deg, ${state.remixPersona.colors[0]}15, ${state.remixPersona.colors[1]}10)`,
          }}
        >
          <div
            className="p-4 border-b flex items-center justify-between"
            style={{ borderColor: state.remixPersona.colors[0] + '40' }}
          >
            <button
              onClick={onToggleRemix}
              className="flex items-center gap-3 flex-1 text-left"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ backgroundColor: state.remixPersona.colors[0] }}
              >
                {state.remixPersona.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white flex items-center gap-2 flex-wrap">
                  {state.remixPersona.name}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: state.remixPersona.colors[0] + '30', color: state.remixPersona.colors[0] }}
                  >
                    {state.remixPersona.tagline}
                  </span>
                  {!state.remixExpanded && (
                    <span className="text-xs text-slate-500">(click to expand)</span>
                  )}
                </div>
                <div className="text-xs text-slate-400 italic truncate">{state.remixPersona.quote}</div>
              </div>
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${state.remixExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2 ml-3">
              <button
                onClick={onRemix}
                className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 transition-colors"
                style={{
                  backgroundColor: state.remixPersona.colors[0] + '20',
                  color: state.remixPersona.colors[0],
                }}
                title="Try another creative"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Another
              </button>
              <button
                onClick={onClearRemix}
                className="text-slate-400 hover:text-white p-1"
                title="Clear remix"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          {state.remixExpanded && (
            <div className="p-6">
              {state.remixLoading ? (
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  <span>Regenerating remix...</span>
                </div>
              ) : state.isEditingRemix ? (
                /* Edit Mode for Remix */
                <div className="space-y-4">
                  <textarea
                    value={state.editedRemix}
                    onChange={(e) => updateState({ editedRemix: e.target.value })}
                    className="w-full h-96 px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white font-mono text-sm focus:border-purple-500 focus:outline-none resize-y"
                    placeholder="Edit the remix..."
                  />
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={onCancelRemixEdit}
                      className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onSaveRemixEdit}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm text-white transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal Remix View with Edit/Re-brief */
                <div>
                  <div className="markdown-output text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: simpleMarkdown(state.remixedOutput || '') }} />

                  {/* Edit / Re-brief Buttons for Remix */}
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-700/50">
                    <button
                      onClick={() => updateState({ isEditingRemix: true, editedRemix: state.remixedOutput || '' })}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => updateState({ showRebriefRemixModal: true })}
                      className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/50 rounded-lg text-sm flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Re-brief & Regenerate
                    </button>
                    <span className="text-xs text-slate-500 ml-2">Not quite right? Give feedback to regenerate.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Re-brief Remix Modal */}
      {state.showRebriefRemixModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-2">Re-brief the Remix</h3>
            <p className="text-slate-400 text-sm mb-4">
              Tell us what's not working with {state.remixPersona?.name}'s version and we'll regenerate.
            </p>
            <textarea
              value={state.rebriefRemixFeedback}
              onChange={(e) => updateState({ rebriefRemixFeedback: e.target.value })}
              placeholder="e.g., 'Don't mention price' or 'Make it shorter' or 'Add more urgency'"
              rows={4}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:border-purple-500 focus:outline-none resize-none mb-4"
              autoFocus
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => updateState({ showRebriefRemixModal: false, rebriefRemixFeedback: '' })}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onRebriefRemix(state.rebriefRemixFeedback)}
                disabled={!state.rebriefRemixFeedback.trim()}
                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                  state.rebriefRemixFeedback.trim()
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate Remix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Personas Manager Component
function PersonasManager({
  personas,
  selectedPersona,
  isGenerating,
  onGenerate,
  onSelect,
  onDelete,
  onClose,
}: {
  personas: Persona[];
  selectedPersona: Persona | null;
  isGenerating: boolean;
  onGenerate: () => void;
  onSelect: (persona: Persona | null) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden border border-slate-700">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              👥 Target Personas
            </h2>
            <p className="text-slate-400 mt-1">Generate AI personas or create your own. Select one to personalize your prompts.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          {/* Generate Button */}
          <div className="mb-6">
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating personas...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate AI Personas
                </>
              )}
            </button>
            <p className="text-xs text-slate-500 mt-2">Generates 3 distinct buyer personas based on your industry and target audience</p>
          </div>

          {/* No Personas State */}
          {personas.length === 0 && !isGenerating && (
            <div className="text-center py-12 text-slate-400">
              <div className="text-5xl mb-4">👥</div>
              <p className="text-lg mb-2">No personas yet</p>
              <p className="text-sm">Generate AI personas based on your business, or create them manually.</p>
            </div>
          )}

          {/* Personas Grid */}
          {personas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* "No Persona" option */}
              <button
                onClick={() => onSelect(null)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedPersona === null
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-2xl">
                    🎯
                  </div>
                  <div>
                    <div className="font-semibold">General Audience</div>
                    <div className="text-sm text-slate-400">No specific persona selected</div>
                  </div>
                </div>
              </button>

              {/* Persona Cards */}
              {personas.map((persona) => (
                <div
                  key={persona.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedPersona?.id === persona.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <button
                    onClick={() => onSelect(persona)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl flex-shrink-0">
                        {persona.avatar_emoji || '👤'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white">{persona.name}</div>
                        <div className="text-sm text-purple-300">{persona.role}</div>
                        <div className="text-sm text-slate-400 mt-1 line-clamp-2">{persona.description}</div>
                      </div>
                    </div>

                    {/* Pain Points Preview */}
                    {persona.pain_points && persona.pain_points.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <div className="text-xs text-slate-500 mb-1">Pain Points:</div>
                        <div className="flex flex-wrap gap-1">
                          {persona.pain_points.slice(0, 2).map((point, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded">
                              {point.length > 30 ? point.substring(0, 30) + '...' : point}
                            </span>
                          ))}
                          {persona.pain_points.length > 2 && (
                            <span className="text-xs text-slate-500">+{persona.pain_points.length - 2} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </button>

                  {/* Delete Button */}
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this persona?')) {
                          onDelete(persona.id);
                        }
                      }}
                      className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 flex justify-between items-center">
          <div className="text-sm text-slate-400">
            {selectedPersona ? (
              <span className="text-purple-300">✓ Writing for: {selectedPersona.name}</span>
            ) : (
              <span>No persona selected (general audience)</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// Remix Modal Component
function RemixModal({
  mode,
  isLoading,
  onSelect,
  onClose,
}: {
  mode: Mode;
  isLoading: boolean;
  onSelect: (personaId: string) => void;
  onClose: () => void;
}) {
  const personas = mode === 'strategy' ? getStrategyPersonas() : getCreativePersonas();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelect(id);
  };

  // Group personas by category
  const hybrids = personas.filter(p => p.category === 'hybrid');
  const others = personas.filter(p => p.category !== 'hybrid');

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="text-3xl">{mode === 'strategy' ? '🧠' : '🎨'}</span>
              {mode === 'strategy' ? 'Planning' : 'Creative'} Remix
            </h2>
            <p className="text-slate-400 mt-1">
              Reimagine your output through the lens of a legendary {mode === 'strategy' ? 'strategist' : 'creative'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2" disabled={isLoading}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-3 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg text-slate-300">
                {selectedId && personas.find(p => p.id === selectedId)?.fullName} is reimagining your content...
              </p>
              <p className="text-sm text-slate-500 mt-2">This usually takes 10-20 seconds</p>
            </div>
          </div>
        )}

        {/* Persona Grid */}
        {!isLoading && (
          <div className="flex-1 overflow-y-auto p-6">
            {/* Pure Strategists/Creatives */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                {mode === 'strategy' ? 'Pure Strategists' : 'Pure Creatives'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {others.map((persona) => (
                  <PersonaCard key={persona.id} persona={persona} onSelect={handleSelect} />
                ))}
              </div>
            </div>

            {/* Hybrids */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Creative–Strategy Hybrids
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {hybrids.map((persona) => (
                  <PersonaCard key={persona.id} persona={persona} onSelect={handleSelect} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Remix Persona Card Component
function PersonaCard({
  persona,
  onSelect,
}: {
  persona: RemixPersona;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(persona.id)}
      className="text-left p-4 rounded-xl border-2 border-slate-700 hover:border-opacity-100 transition-all group bg-slate-900/50 hover:bg-slate-900"
      style={{
        '--hover-border': persona.colors[0],
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = persona.colors[0];
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '';
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: persona.colors[0] }}
        >
          {persona.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white group-hover:text-opacity-100">
            {persona.fullName}
          </div>
          <div
            className="text-xs font-medium mt-0.5"
            style={{ color: persona.colors[0] }}
          >
            {persona.tagline}
          </div>
          <div className="text-xs text-slate-500 mt-1 line-clamp-2">
            {persona.style}
          </div>
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-400 italic line-clamp-2">
        {persona.quote}
      </div>
    </button>
  );
}

// Planning Review Modal Component (Agency Model)
function PlanningReviewModal({
  state,
  isLoading,
  result,
  onApprove,
  onRefine,
  onSkip,
  onClose,
}: {
  state: State;
  isLoading: boolean;
  result: { score: number; assessment: string; suggestions: string[] } | null;
  onApprove: () => void;
  onRefine: () => void;
  onSkip: () => void;
  onClose: () => void;
}) {
  // Gather strategic context from state
  const problemStatement = state.discoveryBrief.businessProblem ||
    state.uploadedBrief.objective ||
    state.directedBrief.goalDescription ||
    state.currentProject?.challenge ||
    '';

  const targetAudience = state.selectedPersona?.name
    ? `${state.selectedPersona.name} - ${state.selectedPersona.role}`
    : state.uploadedBrief.targetAudience ||
      state.currentProject?.target_audience ||
      state.targetAudience ||
      '';

  const strategy = state.selectedStrategy;

  const mandatories = [
    ...(state.directedBrief.campaignMandatories || []),
    ...(state.uploadedBrief.mandatories || []),
    ...(state.currentProject?.persistent_mandatories || []),
  ].filter(Boolean);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    if (score >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Strong Brief';
    if (score >= 6) return 'Workable Brief';
    if (score >= 4) return 'Needs Refinement';
    return 'Weak Brief';
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">📋</span>
                Planning Review
              </h2>
              <p className="text-slate-400 mt-1">
                Review your strategy and creative idea before selecting media channels
              </p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2" disabled={isLoading}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Strategic Foundation Summary */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span>📋</span> Strategic Foundation
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500">Problem:</span>
                <p className="text-white mt-1">{problemStatement || <span className="text-slate-500 italic">Not defined</span>}</p>
              </div>

              <div>
                <span className="text-slate-500">Audience:</span>
                <p className="text-white mt-1">{targetAudience || <span className="text-slate-500 italic">Not defined</span>}</p>
              </div>

              <div>
                <span className="text-slate-500">Strategy:</span>
                {strategy ? (
                  <div className="mt-1 bg-slate-800 rounded-lg p-3 border border-slate-600">
                    <p className="text-white font-medium">{strategy.name}</p>
                    <p className="text-slate-300 text-xs mt-1">{strategy.core_message}</p>
                  </div>
                ) : (
                  <p className="text-slate-500 italic mt-1">No strategy selected</p>
                )}
              </div>

              {state.selectedCreativeIdea && (
                <div>
                  <span className="text-slate-500">Creative Idea:</span>
                  <div className="mt-1 bg-pink-500/10 rounded-lg p-3 border border-pink-500/30">
                    <p className="text-pink-300 font-medium">{state.selectedCreativeIdea.name}</p>
                    <p className="text-slate-300 text-xs mt-1">{state.selectedCreativeIdea.summary}</p>
                    {state.selectedCreativeIdea.tone_and_feel?.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {state.selectedCreativeIdea.tone_and_feel.slice(0, 3).map((tone, i) => (
                          <span key={i} className="text-xs text-pink-400">#{tone}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {mandatories.length > 0 && (
                <div>
                  <span className="text-slate-500">Mandatories:</span>
                  <ul className="mt-1 space-y-1">
                    {mandatories.map((m, i) => (
                      <li key={i} className="text-white flex items-start gap-2">
                        <span className="text-purple-400">•</span> {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* AI Assessment */}
          {isLoading ? (
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700 text-center">
              <div className="w-10 h-10 border-3 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-300">Planning Director is reviewing your brief...</p>
            </div>
          ) : result ? (
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span>🤖</span> AI Assessment
              </h3>

              {/* Score */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}/10
                </div>
                <div>
                  <p className={`font-semibold ${getScoreColor(result.score)}`}>
                    {getScoreLabel(result.score)}
                  </p>
                  <p className="text-sm text-slate-400">Brief Quality Score</p>
                </div>
              </div>

              {/* Assessment */}
              <p className="text-slate-300 mb-4">{result.assessment}</p>

              {/* Suggestions */}
              {result.suggestions.length > 0 && result.score < 8 && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Suggestions:</p>
                  <ul className="space-y-2">
                    {result.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-yellow-400 mt-0.5">💡</span>
                        <span className="text-slate-300">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-700 bg-slate-900/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onApprove}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approve & Select Media
            </button>

            <button
              onClick={onRefine}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Refine Creative Idea
            </button>
          </div>

          <button
            onClick={onSkip}
            disabled={isLoading}
            className="w-full mt-3 px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors disabled:opacity-50"
          >
            Skip review (not recommended)
          </button>
        </div>
      </div>
    </div>
  );
}

// My Library Component
function MyLibrary({
  state,
  onDelete,
  goBack,
  copyToClipboard,
}: {
  state: State;
  onDelete: (id: string) => void;
  goBack: () => void;
  copyToClipboard: (text: string, id: number | string) => void;
}) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDisciplineIcon = (discipline: string) => {
    const icons: Record<string, string> = {
      seo: '🔍',
      email: '📧',
      social: '📱',
      blog: '✍️',
      ads: '📣',
      landing: '🎯',
      brand: '💎',
      analytics: '📊',
      growth: '🚀',
    };
    return icons[discipline] || '📄';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={goBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">My Library</h2>
        <p className="text-slate-400">Your saved marketing content</p>
      </div>

      {state.libraryLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : state.savedItems.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700">
          <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No saved content yet</h3>
          <p className="text-slate-400 mb-4">Run a prompt and click "Save to Library" to save it here</p>
          <button
            onClick={goBack}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors"
          >
            Start Creating
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {state.savedItems.map((item) => (
            <div key={item.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
                onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
                      {getDisciplineIcon(item.discipline)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.mode === 'strategy' ? 'bg-purple-500/20 text-purple-300' : 'bg-green-500/20 text-green-300'}`}>
                          {item.mode === 'strategy' ? '📋 Planning' : '🎨 Creative'}
                        </span>
                        <span className="text-xs text-slate-500">{formatDate(item.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform ${expandedItem === item.id ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {expandedItem === item.id && (
                <div className="border-t border-slate-700">
                  <div className="p-4 bg-slate-900/50">
                    <div className="markdown-output text-slate-300 text-sm leading-relaxed max-h-96 overflow-y-auto" dangerouslySetInnerHTML={{ __html: simpleMarkdown(item.content) }} />
                  </div>
                  <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(item.content, item.id);
                        }}
                        className={`px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-2 transition-colors ${state.copiedId === item.id ? 'text-green-400' : ''}`}
                      >
                        {state.copiedId === item.id ? (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    {deleteConfirm === item.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Delete?</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                            setDeleteConfirm(null);
                          }}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(null);
                          }}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(item.id);
                        }}
                        className="px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-sm flex items-center gap-2 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Mode Selection Component (v1.1)
function ModeSelect({ state, onSelectMode, goBack, updateState }: { state: State; onSelectMode: (mode: CampaignMode) => void; goBack: () => void; updateState: (updates: Partial<State>) => void }) {
  const [showSettings, setShowSettings] = useState(false);

  const setProvider = (provider: Provider) => {
    updateState({ llmProvider: provider });
    localStorage.setItem('amplify_provider', provider);
    if (provider === 'gemini') {
      updateState({ apiKey: '' });
      localStorage.removeItem('amplify_api_key');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="tag tag-pink">{(state.currentProject?.name || state.brand).toUpperCase()}</div>
          <span className="text-[#333] font-display">//</span>
          <span className="text-[#666] text-sm font-display tracking-wider">{(state.currentProject?.industry || state.industry).toUpperCase()}</span>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="ml-auto text-[#666] hover:text-[#f7ff00] font-display text-xs tracking-wider transition-colors"
            title="API Settings"
          >
            ⚙ SETTINGS
          </button>
        </div>
        <h2 className="headline-lg text-white">WHAT'S YOUR</h2>
        <h2 className="headline-lg text-[#ff1493] -mt-2">SITUATION?</h2>
      </div>

      {/* Collapsible API Settings */}
      {showSettings && (
        <div className="mb-8 p-4 bg-[#1a1a1a] border-2 border-[#333]">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-display tracking-[0.2em] text-white">AI PROVIDER</label>
            <button onClick={() => setShowSettings(false)} className="text-[#666] hover:text-white font-display text-xs">✕ CLOSE</button>
          </div>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setProvider('gemini')} className={`flex-1 px-4 py-3 font-display text-xs tracking-wider border-2 transition-all ${state.llmProvider === 'gemini' ? 'border-[#00ff66] bg-[#00ff66]/10 text-[#00ff66]' : 'border-[#333] text-[#666] hover:border-[#666]'}`}>GEMINI (FREE)</button>
            <button onClick={() => setProvider('openai')} className={`flex-1 px-4 py-3 font-display text-xs tracking-wider border-2 transition-all ${state.llmProvider === 'openai' ? 'border-[#f7ff00] bg-[#f7ff00]/10 text-[#f7ff00]' : 'border-[#333] text-[#666] hover:border-[#666]'}`}>OPENAI</button>
            <button onClick={() => setProvider('anthropic')} className={`flex-1 px-4 py-3 font-display text-xs tracking-wider border-2 transition-all ${state.llmProvider === 'anthropic' ? 'border-[#ff1493] bg-[#ff1493]/10 text-[#ff1493]' : 'border-[#333] text-[#666] hover:border-[#666]'}`}>ANTHROPIC</button>
          </div>
          {state.llmProvider === 'gemini' ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-[#1a1a1a] border border-[#333] overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${state.freePromptsUsed >= state.promptsLimit ? 'bg-[#ff3333]' : state.freePromptsUsed >= state.promptsLimit * 0.8 ? 'bg-[#f7ff00]' : 'bg-[#00ff66]'}`}
                  style={{ width: `${Math.min((state.freePromptsUsed / state.promptsLimit) * 100, 100)}%` }}
                />
              </div>
              <span className={`text-xs font-mono ${state.freePromptsUsed >= state.promptsLimit ? 'text-[#ff3333]' : state.freePromptsUsed >= state.promptsLimit * 0.8 ? 'text-[#f7ff00]' : 'text-[#00ff66]'}`}>
                {state.promptsLimit - state.freePromptsUsed} LEFT
              </span>
            </div>
          ) : (
            <>
              <input
                type="password"
                value={state.apiKey}
                onChange={(e) => {
                  updateState({ apiKey: e.target.value });
                  localStorage.setItem('amplify_api_key', e.target.value);
                }}
                placeholder={state.llmProvider === 'openai' ? 'sk-...' : 'sk-ant-...'}
                className="input-raw w-full text-sm"
              />
              <p className="text-xs text-[#666] mt-2 font-mono">// Stored locally. Never leaves your browser.</p>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {/* Discovery Mode */}
        <button
          onClick={() => onSelectMode('discovery')}
          className="p-6 border-2 border-[#333] -ml-[2px] -mt-[2px] transition-all text-left bg-[#1a1a1a] hover:bg-[#0a0a0a] hover:border-[#ff1493] group relative"
        >
          <div className="absolute top-4 right-4 font-display text-5xl text-[#1a1a1a] group-hover:text-[#ff1493]/20 transition-colors">01</div>
          <div className="relative z-10">
            <div className="text-4xl mb-4">🧭</div>
            <div className="font-display text-xl text-white group-hover:text-[#ff1493] transition-colors tracking-wide">"I HAVE A PROBLEM"</div>
            <div className="text-[#666] text-sm mt-2 mb-4">Guide me to the right strategy</div>
            <div className="text-xs text-[#666] space-y-1 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[#ff1493]">→</span> New campaigns
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#ff1493]">→</span> Uncertain goals
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#ff1493]">→</span> Strategic planning
              </div>
            </div>
          </div>
        </button>

        {/* Directed Mode */}
        <button
          onClick={() => onSelectMode('directed')}
          className="p-6 border-2 border-[#333] -ml-[2px] -mt-[2px] transition-all text-left bg-[#1a1a1a] hover:bg-[#0a0a0a] hover:border-[#00ff66] group relative"
        >
          <div className="absolute top-4 right-4 font-display text-5xl text-[#1a1a1a] group-hover:text-[#00ff66]/20 transition-colors">02</div>
          <div className="relative z-10">
            <div className="text-4xl mb-4">🚀</div>
            <div className="font-display text-xl text-white group-hover:text-[#00ff66] transition-colors tracking-wide">"I KNOW WHAT I NEED"</div>
            <div className="text-[#666] text-sm mt-2 mb-4">Let me execute quickly</div>
            <div className="text-xs text-[#666] space-y-1 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[#00ff66]">→</span> Repeat tasks
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00ff66]">→</span> Clear objectives
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00ff66]">→</span> Fast turnaround
              </div>
            </div>
          </div>
        </button>

        {/* Upload Mode */}
        <button
          onClick={() => onSelectMode('upload')}
          className="p-6 border-2 border-[#333] -ml-[2px] -mt-[2px] transition-all text-left bg-[#1a1a1a] hover:bg-[#0a0a0a] hover:border-[#f7ff00] group relative"
        >
          <div className="absolute top-4 right-4 font-display text-5xl text-[#1a1a1a] group-hover:text-[#f7ff00]/20 transition-colors">03</div>
          <div className="relative z-10">
            <div className="text-4xl mb-4">📄</div>
            <div className="font-display text-xl text-white group-hover:text-[#f7ff00] transition-colors tracking-wide">"I HAVE A BRIEF"</div>
            <div className="text-[#666] text-sm mt-2 mb-4">Upload your creative brief</div>
            <div className="text-xs text-[#666] space-y-1 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[#f7ff00]">→</span> PDF, Word, or text
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#f7ff00]">→</span> Auto-extract fields
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#f7ff00]">→</span> Agency workflows
              </div>
            </div>
          </div>
        </button>
      </div>

      <button onClick={goBack} className="mt-12 mx-auto flex items-center gap-3 text-[#666] hover:text-[#f7ff00] transition-colors font-display tracking-wider">
        ← BACK
      </button>
    </div>
  );
}

// Discovery Wizard Progress Bar
function DiscoveryProgressBar({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: 'PROBLEM' },
    { num: 2, label: 'AUDIENCE' },
    { num: 3, label: 'PROPOSITION' },
    { num: 4, label: 'DETAILS' },
    { num: 5, label: 'MEASURES' },
    { num: 6, label: 'REVIEW' },
  ];

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 flex items-center justify-center font-display text-lg transition-all border-2 ${
                  step.num < currentStep
                    ? 'bg-[#00ff66] text-black border-[#00ff66]'
                    : step.num === currentStep
                    ? 'bg-[#f7ff00] text-black border-[#f7ff00]'
                    : 'bg-[#1a1a1a] text-[#444] border-[#333]'
                }`}
              >
                {step.num < currentStep ? '✓' : step.num}
              </div>
              <span className={`text-[10px] mt-2 font-display tracking-wider ${step.num === currentStep ? 'text-[#f7ff00]' : step.num < currentStep ? 'text-[#00ff66]' : 'text-[#444]'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-6 md:w-10 h-[2px] mx-1 ${
                  step.num < currentStep ? 'bg-[#00ff66]' : 'bg-[#333]'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Discovery Wizard Component (v2.0 - Guided Briefing Session)
function DiscoveryWizard({ state, updateState, onComplete, goBack }: {
  state: State;
  updateState: (updates: Partial<State>) => void;
  onComplete: () => void;
  goBack: () => void;
}) {
  const step = state.discoveryWizardStep;

  const updateBrief = (field: keyof State['discoveryBrief'], value: string | string[]) => {
    updateState({
      discoveryBrief: { ...state.discoveryBrief, [field]: value }
    });
  };

  const nextStep = () => {
    if (step < 6) {
      updateState({ discoveryWizardStep: (step + 1) as 1 | 2 | 3 | 4 | 5 | 6 });
    }
  };

  const prevStep = () => {
    if (step > 1) {
      updateState({ discoveryWizardStep: (step - 1) as 1 | 2 | 3 | 4 | 5 | 6 });
    } else {
      goBack();
    }
  };

  const stepTitles: Record<number, { title: string; subtitle: string }> = {
    1: { title: 'THE PROBLEM', subtitle: "What are we fighting?" },
    2: { title: 'THE AUDIENCE', subtitle: 'Who are we talking to?' },
    3: { title: 'THE PROPOSITION', subtitle: 'What are we selling?' },
    4: { title: 'THE DETAILS', subtitle: 'How should it feel?' },
    5: { title: 'THE MEASURES', subtitle: 'How do we win?' },
    6: { title: 'THE REVIEW', subtitle: 'Final sanity check' },
  };

  const canProceed = () => {
    switch (step) {
      case 1: return state.discoveryBrief.campaignName && state.discoveryBrief.businessProblem;
      case 2: return state.discoveryBrief.targetAudience;
      case 3: return state.discoveryBrief.proposition;
      case 4: return true; // All optional
      case 5: return true; // All optional
      case 6: return true; // Review
      default: return false;
    }
  };

  // Calculate brief completeness
  const calculateCompleteness = () => {
    const fields = [
      { name: 'Campaign Name', value: state.discoveryBrief.campaignName, weight: 5 },
      { name: 'Business Problem', value: state.discoveryBrief.businessProblem, weight: 15 },
      { name: 'Target Audience', value: state.discoveryBrief.targetAudience, weight: 15 },
      { name: 'Proposition', value: state.discoveryBrief.proposition, weight: 20 },
      { name: 'Support Points', value: state.discoveryBrief.support?.length > 0, weight: 10 },
      { name: 'Tone', value: state.discoveryBrief.tone, weight: 5 },
      { name: 'Mandatories', value: state.discoveryBrief.mandatories?.length > 0, weight: 5 },
      { name: 'Constraints', value: state.discoveryBrief.constraints, weight: 5 },
      { name: 'Success Metric', value: state.discoveryBrief.successMetric, weight: 10 },
      { name: 'Timeline', value: state.discoveryBrief.timeline, weight: 5 },
      { name: 'Budget', value: state.discoveryBrief.budget, weight: 5 },
    ];

    let score = 0;
    fields.forEach(f => {
      if (f.value) score += f.weight;
    });
    return score;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with brand context */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm mb-4">
          <span>Building Your Brief</span>
          <span className="text-slate-500">•</span>
          <span>{state.currentProject?.name || state.brand}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <DiscoveryProgressBar currentStep={step} />

      {/* Step Title */}
      <div className="text-center mb-6">
        <div className="text-sm text-purple-400 mb-1">Step {step} of 6</div>
        <h2 className="text-2xl font-bold mb-2">{stepTitles[step].title}</h2>
        <p className="text-slate-400">{stepTitles[step].subtitle}</p>
      </div>

      {/* Step Content */}
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Campaign Name *</label>
              <input
                type="text"
                value={state.discoveryBrief.campaignName}
                onChange={(e) => updateBrief('campaignName', e.target.value)}
                placeholder="e.g., Q2 Pipeline Growth, Brand Awareness Push"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">What's the business problem? *</label>
              <textarea
                value={state.discoveryBrief.businessProblem}
                onChange={(e) => updateBrief('businessProblem', e.target.value)}
                placeholder="Describe the challenge you're trying to solve. What's not working? What opportunity are you trying to capture?"
                rows={4}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">What's been tried before?</label>
              <textarea
                value={state.discoveryBrief.whatBeenTried}
                onChange={(e) => updateBrief('whatBeenTried', e.target.value)}
                placeholder="Previous approaches, what worked or didn't work..."
                rows={2}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Who is your target audience? *</label>
              <textarea
                value={state.discoveryBrief.targetAudience}
                onChange={(e) => updateBrief('targetAudience', e.target.value)}
                placeholder="Describe who you're trying to reach. Include demographics, psychographics, behaviors, pain points..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                Tip: Be specific. "Enterprise IT decision-makers frustrated with legacy systems" is better than "businesses"
              </p>
            </div>
            {state.personas.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Or select from your personas:</label>
                <div className="flex flex-wrap gap-2">
                  {state.personas.map(p => (
                    <button
                      key={p.id}
                      onClick={() => updateBrief('targetAudience', `${p.name} - ${p.role}: ${p.description || ''}`)}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                    >
                      {p.avatar_emoji || '👤'} {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">What's your core proposition? *</label>
              <textarea
                value={state.discoveryBrief.proposition}
                onChange={(e) => updateBrief('proposition', e.target.value)}
                placeholder="The single most important thing you want your audience to think, feel, or do. This is your key message or promise."
                rows={3}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Support points / Reasons to believe</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add a proof point and press Enter..."
                  className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      updateBrief('support', [...(state.discoveryBrief.support || []), e.currentTarget.value.trim()]);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              {state.discoveryBrief.support && state.discoveryBrief.support.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {state.discoveryBrief.support.map((point, i) => (
                    <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm flex items-center gap-2">
                      {point}
                      <button
                        onClick={() => updateBrief('support', state.discoveryBrief.support.filter((_, idx) => idx !== i))}
                        className="text-purple-400 hover:text-white"
                      >×</button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-2">
                Why should they believe your proposition? Add facts, features, or proof points.
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tone of voice</label>
              <input
                type="text"
                value={state.discoveryBrief.tone}
                onChange={(e) => updateBrief('tone', e.target.value)}
                placeholder="e.g., Professional but approachable, Bold and provocative, Warm and empathetic..."
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Mandatories (must-include elements)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add a mandatory and press Enter..."
                  className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      updateBrief('mandatories', [...(state.discoveryBrief.mandatories || []), e.currentTarget.value.trim()]);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              {state.discoveryBrief.mandatories && state.discoveryBrief.mandatories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {state.discoveryBrief.mandatories.map((item, i) => (
                    <span key={i} className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm flex items-center gap-2">
                      {item}
                      <button
                        onClick={() => updateBrief('mandatories', state.discoveryBrief.mandatories.filter((_, idx) => idx !== i))}
                        className="text-amber-400 hover:text-white"
                      >×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Constraints (things to avoid)</label>
              <textarea
                value={state.discoveryBrief.constraints}
                onChange={(e) => updateBrief('constraints', e.target.value)}
                placeholder="Legal restrictions, competitor comparisons to avoid, off-brand topics..."
                rows={2}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>
            <button
              onClick={nextStep}
              className="w-full py-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              Skip this step →
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Success Metric</label>
                <input
                  type="text"
                  value={state.discoveryBrief.successMetric}
                  onChange={(e) => updateBrief('successMetric', e.target.value)}
                  placeholder="e.g., Pipeline value, Leads, Revenue"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Value</label>
                <input
                  type="text"
                  value={state.discoveryBrief.successMetricValue}
                  onChange={(e) => updateBrief('successMetricValue', e.target.value)}
                  placeholder="e.g., $2.6M, 500 leads"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Timeline</label>
                <input
                  type="date"
                  value={state.discoveryBrief.timeline}
                  onChange={(e) => updateBrief('timeline', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Budget</label>
                <select
                  value={state.discoveryBrief.budget}
                  onChange={(e) => updateBrief('budget', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select budget range</option>
                  <option value="<5k">Less than $5K</option>
                  <option value="5k-25k">$5K - $25K</option>
                  <option value="25k-100k">$25K - $100K</option>
                  <option value="100k+">$100K+</option>
                </select>
              </div>
            </div>
            <button
              onClick={nextStep}
              className="w-full py-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              Skip this step →
            </button>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            {/* Brief Completeness Score */}
            <div className="p-4 bg-slate-900/50 rounded-xl mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">Brief Completeness</span>
                <span className={`text-sm font-bold ${calculateCompleteness() >= 80 ? 'text-green-400' : calculateCompleteness() >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {calculateCompleteness()}%
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${calculateCompleteness() >= 80 ? 'bg-green-500' : calculateCompleteness() >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${calculateCompleteness()}%` }}
                />
              </div>
            </div>

            {/* Brief Summary */}
            <div className="space-y-3">
              <div className="flex justify-between items-start py-2 border-b border-slate-700">
                <span className="text-slate-400 text-sm">Campaign</span>
                <span className="text-white text-sm text-right max-w-[60%]">{state.discoveryBrief.campaignName || '-'}</span>
              </div>
              <div className="flex justify-between items-start py-2 border-b border-slate-700">
                <span className="text-slate-400 text-sm">Problem</span>
                <span className="text-white text-sm text-right max-w-[60%] line-clamp-2">{state.discoveryBrief.businessProblem || '-'}</span>
              </div>
              <div className="flex justify-between items-start py-2 border-b border-slate-700">
                <span className="text-slate-400 text-sm">Audience</span>
                <span className="text-white text-sm text-right max-w-[60%] line-clamp-2">{state.discoveryBrief.targetAudience || '-'}</span>
              </div>
              <div className="flex justify-between items-start py-2 border-b border-slate-700">
                <span className="text-slate-400 text-sm">Proposition</span>
                <span className="text-white text-sm text-right max-w-[60%] line-clamp-2">{state.discoveryBrief.proposition || '-'}</span>
              </div>
              <div className="flex justify-between items-start py-2 border-b border-slate-700">
                <span className="text-slate-400 text-sm">Support Points</span>
                <span className="text-white text-sm text-right max-w-[60%]">
                  {state.discoveryBrief.support?.length ? `${state.discoveryBrief.support.length} point(s)` : '-'}
                </span>
              </div>
              <div className="flex justify-between items-start py-2 border-b border-slate-700">
                <span className="text-slate-400 text-sm">Tone</span>
                <span className="text-white text-sm text-right max-w-[60%]">{state.discoveryBrief.tone || '-'}</span>
              </div>
              <div className="flex justify-between items-start py-2 border-b border-slate-700">
                <span className="text-slate-400 text-sm">Mandatories</span>
                <span className="text-white text-sm text-right max-w-[60%]">
                  {state.discoveryBrief.mandatories?.length ? `${state.discoveryBrief.mandatories.length} item(s)` : '-'}
                </span>
              </div>
              <div className="flex justify-between items-start py-2 border-b border-slate-700">
                <span className="text-slate-400 text-sm">Success Metric</span>
                <span className="text-white text-sm text-right max-w-[60%]">
                  {state.discoveryBrief.successMetric ? `${state.discoveryBrief.successMetric}: ${state.discoveryBrief.successMetricValue || 'TBD'}` : '-'}
                </span>
              </div>
              <div className="flex justify-between items-start py-2">
                <span className="text-slate-400 text-sm">Timeline / Budget</span>
                <span className="text-white text-sm text-right max-w-[60%]">
                  {state.discoveryBrief.timeline || '-'} / {state.discoveryBrief.budget || '-'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevStep} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {step < 6 ? (
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
              canProceed()
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Next
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            onClick={onComplete}
            disabled={state.messageStrategiesLoading}
            className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
          >
            {state.messageStrategiesLoading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating Strategies...
              </>
            ) : (
              <>
                Continue to Strategy
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// Message Strategy Selection Component (v1.1)
function MessageStrategySelect({ state, onSelect, onRegenerate, goBack }: {
  state: State;
  onSelect: (strategy: MessageStrategy) => void;
  onRegenerate: () => void;
  goBack: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refinement, setRefinement] = useState('');

  const handleConfirm = () => {
    const strategy = state.messageStrategies.find(s => s.id === selectedId);
    if (strategy) {
      onSelect({ ...strategy, user_refinements: refinement || undefined });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm mb-4">
          <span>Discovery Mode</span>
          <span className="text-slate-500">•</span>
          <span>Message Strategy</span>
        </div>
        <h2 className="text-3xl font-bold mb-4">Choose Your Strategic Angle</h2>
        <p className="text-slate-400">Based on your brief, here are three positioning strategies</p>
      </div>

      {state.messageStrategiesLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="animate-spin w-12 h-12 text-purple-500 mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-400">Generating strategic options...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {state.messageStrategies.map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => setSelectedId(strategy.id)}
              className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                selectedId === strategy.id
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-white">{strategy.name}</h3>
                {selectedId === strategy.id && (
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-purple-300 font-medium mb-2">"{strategy.core_message}"</p>
              <p className="text-slate-400 text-sm mb-3">{strategy.angle}</p>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Why this fits</p>
                <p className="text-sm text-slate-300">{strategy.rationale}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedId && (
        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Any adjustments to this strategy? (optional)
          </label>
          <input
            type="text"
            value={refinement}
            onChange={(e) => setRefinement(e.target.value)}
            placeholder="e.g., Emphasize our 10-year track record..."
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          />
        </div>
      )}

      <div className="flex items-center justify-between mt-8">
        <button onClick={goBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <span dangerouslySetInnerHTML={{ __html: icons.arrowLeft }} />
          Edit Brief
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={onRegenerate}
            disabled={state.messageStrategiesLoading}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Show different options
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedId}
            className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
              selectedId
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Confirm Strategy
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Creative Ideas Selection Component (v1.0 - Agency Model Phase 1)
function CreativeIdeasSelect({ state, onSelect, onRegenerate, goBack }: {
  state: State;
  onSelect: (idea: CreativeIdea) => void;
  onRegenerate: () => void;
  goBack: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleConfirm = () => {
    const idea = state.creativeIdeas.find(i => i.id === selectedId);
    if (idea) {
      onSelect(idea);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/20';
      case 'high': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm mb-4">
          <span>🎨 Creative Director</span>
          <span className="text-slate-500">•</span>
          <span>Idea Exploration</span>
        </div>
        <h2 className="text-3xl font-bold mb-4">Explore Creative Territories</h2>
        <p className="text-slate-400">How could your strategy come to life? These are big ideas, not executions.</p>

        {/* Show selected strategy context */}
        {state.selectedStrategy && (
          <div className="mt-4 inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-xs text-purple-400 uppercase tracking-wide">Building on strategy</p>
            <p className="text-sm text-purple-300 font-medium">"{state.selectedStrategy.core_message}"</p>
          </div>
        )}
      </div>

      {state.creativeIdeasLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="animate-spin w-12 h-12 text-pink-500 mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-400">Generating creative territories...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {state.creativeIdeas.map((idea) => (
            <button
              key={idea.id}
              onClick={() => setSelectedId(idea.id)}
              className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                selectedId === idea.id
                  ? 'border-pink-500 bg-pink-500/10'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{idea.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskColor(idea.creative_risk_level)}`}>
                      {idea.creative_risk_level} risk
                    </span>
                    {idea.tone_and_feel.slice(0, 3).map((tone, i) => (
                      <span key={i} className="text-xs text-slate-500">#{tone}</span>
                    ))}
                  </div>
                </div>
                {selectedId === idea.id && (
                  <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              <p className="text-pink-300 font-medium mb-3">{idea.summary}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Why it fits the strategy</p>
                  <p className="text-sm text-slate-300">{idea.why_it_fits}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">What it sacrifices</p>
                  <p className="text-sm text-slate-400">{idea.what_it_sacrifices}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-8">
        <button onClick={goBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <span dangerouslySetInnerHTML={{ __html: icons.arrowLeft }} />
          Back to Strategy
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={onRegenerate}
            disabled={state.creativeIdeasLoading}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Show different ideas
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedId || state.creativeIdeasLoading}
            className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
              selectedId && !state.creativeIdeasLoading
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {state.creativeIdeasLoading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </>
            ) : (
              <>
                Select This Idea
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Directed Brief Component (v1.1)
function DirectedBrief({ state, updateState, onSubmit, goBack }: {
  state: State;
  updateState: (updates: Partial<State>) => void;
  onSubmit: () => void;
  goBack: () => void;
}) {
  const updateBrief = (field: keyof State['directedBrief'], value: any) => {
    updateState({
      directedBrief: { ...state.directedBrief, [field]: value }
    });
  };

  const isValid = state.directedBrief.campaignName && state.directedBrief.goalType;

  const disciplineLabel = disciplines.find(d => d.value === state.discipline)?.label || state.discipline;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm mb-4">
          <span>Directed Mode</span>
          <span className="text-slate-500">•</span>
          <span>{disciplineLabel}</span>
        </div>
        <h2 className="text-3xl font-bold mb-4">Quick Campaign Setup</h2>
        <p className="text-slate-400">Tell us the basics so we can tailor your content</p>
      </div>

      <div className="space-y-6 bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Campaign Name *</label>
          <input
            type="text"
            value={state.directedBrief.campaignName}
            onChange={(e) => updateBrief('campaignName', e.target.value)}
            placeholder="e.g., Product Launch Social"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-green-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">What's your goal? *</label>
          <div className="grid grid-cols-2 gap-3">
            {(['awareness', 'consideration', 'conversion', 'retention'] as CampaignGoalType[]).map((goal) => (
              <button
                key={goal}
                onClick={() => updateBrief('goalType', goal)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  state.directedBrief.goalType === goal
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                }`}
              >
                <div className="font-medium capitalize">{goal}</div>
                <div className="text-xs text-slate-500">
                  {goal === 'awareness' && 'Get noticed'}
                  {goal === 'consideration' && 'Build interest'}
                  {goal === 'conversion' && 'Drive action'}
                  {goal === 'retention' && 'Keep customers'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Goal details (optional)</label>
          <input
            type="text"
            value={state.directedBrief.goalDescription}
            onChange={(e) => updateBrief('goalDescription', e.target.value)}
            placeholder="e.g., Drive pre-orders for new product"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-green-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Campaign-specific must-includes (optional)
          </label>
          <input
            type="text"
            placeholder="Type and press Enter to add (or it will be added when you continue)"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                updateBrief('campaignMandatories', [...(state.directedBrief.campaignMandatories || []), e.currentTarget.value.trim()]);
                e.currentTarget.value = '';
              }
            }}
            onBlur={(e) => {
              // Auto-add text when user leaves the field (in case they didn't press Enter)
              if (e.currentTarget.value.trim()) {
                updateBrief('campaignMandatories', [...(state.directedBrief.campaignMandatories || []), e.currentTarget.value.trim()]);
                e.currentTarget.value = '';
              }
            }}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-green-500 focus:outline-none"
          />
          {state.directedBrief.campaignMandatories && state.directedBrief.campaignMandatories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {state.directedBrief.campaignMandatories.map((m, i) => (
                <span key={i} className="px-3 py-1 bg-slate-700 rounded-full text-sm flex items-center gap-2">
                  {m}
                  <button
                    onClick={() => {
                      const newList = state.directedBrief.campaignMandatories?.filter((_, idx) => idx !== i);
                      updateBrief('campaignMandatories', newList);
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <button onClick={goBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <span dangerouslySetInnerHTML={{ __html: icons.arrowLeft }} />
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!isValid}
          className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
            isValid
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          Continue to Prompts
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Strategy Check Screen Component (v1.1)
function StrategyCheckScreen({ state, onProceed, onAddDiscipline, goBack }: {
  state: State;
  onProceed: () => void;
  onAddDiscipline: (discipline: string) => void;
  goBack: () => void;
}) {
  const check = state.strategyCheckResult;
  if (!check) return null;

  const isStrong = check.severity === 'strong';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-4 ${
          isStrong ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
        }`}>
          <span>{isStrong ? 'Strategy Alert' : 'Quick Suggestion'}</span>
        </div>
        <h2 className="text-3xl font-bold mb-4">
          {isStrong ? 'Hold on a moment...' : 'A quick thought'}
        </h2>
      </div>

      <div className={`p-6 rounded-2xl border-2 ${
        isStrong ? 'border-amber-500/50 bg-amber-500/5' : 'border-blue-500/50 bg-blue-500/5'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${
            isStrong ? 'bg-amber-500/20' : 'bg-blue-500/20'
          }`}>
            {isStrong ? (
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className="text-white mb-4">{check.recommendation}</p>

            {check.alternativeDisciplines.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-slate-400 mb-2">Suggested disciplines for {state.directedBrief.goalType}:</p>
                <div className="flex flex-wrap gap-2">
                  {check.alternativeDisciplines.map((disc) => {
                    const discipline = disciplines.find(d => d.value === disc);
                    return (
                      <button
                        key={disc}
                        onClick={() => onAddDiscipline(disc)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-2 transition-colors"
                      >
                        <span>{discipline?.icon || '📌'}</span>
                        <span>{discipline?.label || disc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <button onClick={goBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <span dangerouslySetInnerHTML={{ __html: icons.arrowLeft }} />
          Edit Brief
        </button>
        <button
          onClick={onProceed}
          className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all bg-slate-700 hover:bg-slate-600 text-white"
        >
          Continue Anyway
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Upload Brief Component
function UploadBrief({ state, updateState, onParsed, goBack }: {
  state: State;
  updateState: (updates: Partial<State>) => void;
  onParsed: (parsed: State['uploadedBrief'], missingFields: string[]) => void;
  goBack: () => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    updateState({ briefParsingLoading: true, briefFileName: file.name });
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/briefs/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        updateState({ briefParsingLoading: false });
        return;
      }

      onParsed(data.parsed, data.missingFields);
      updateState({ briefParsingLoading: false });
    } catch (err: any) {
      setError(err.message || 'Failed to parse brief');
      updateState({ briefParsingLoading: false });
    }
  };

  const handlePastedText = async () => {
    if (!pastedText.trim()) {
      setError('Please paste some text');
      return;
    }

    updateState({ briefParsingLoading: true, briefFileName: 'Pasted text' });
    setError(null);

    try {
      const formData = new FormData();
      formData.append('textContent', pastedText);

      const response = await fetch('/api/briefs/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        updateState({ briefParsingLoading: false });
        return;
      }

      onParsed(data.parsed, data.missingFields);
      updateState({ briefParsingLoading: false });
    } catch (err: any) {
      setError(err.message || 'Failed to parse brief');
      updateState({ briefParsingLoading: false });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm mb-4">
          <span>Upload Brief</span>
        </div>
        <h2 className="text-3xl font-bold mb-4">Upload Your Creative Brief</h2>
        <p className="text-slate-400">We'll extract the key information and fill in the gaps</p>
      </div>

      {state.briefParsingLoading ? (
        <div className="bg-slate-800/50 rounded-2xl p-12 border border-slate-700 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium">Analyzing your brief...</p>
          <p className="text-slate-400 text-sm mt-2">{state.briefFileName}</p>
        </div>
      ) : (
        <>
          {!pasteMode ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`bg-slate-800/50 rounded-2xl p-12 border-2 border-dashed transition-all text-center ${
                dragActive ? 'border-amber-500 bg-amber-500/10' : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="text-5xl mb-4">📄</div>
              <p className="text-lg font-medium mb-2">Drag & drop your brief here</p>
              <p className="text-slate-400 text-sm mb-6">PDF, Word, or text files accepted</p>

              <div className="flex items-center justify-center gap-4">
                <label className="px-6 py-3 rounded-xl font-medium bg-amber-600 hover:bg-amber-500 text-white cursor-pointer transition-all">
                  Browse Files
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
                <button
                  onClick={() => setPasteMode(true)}
                  className="px-6 py-3 rounded-xl font-medium bg-slate-700 hover:bg-slate-600 text-white transition-all"
                >
                  Paste Text Instead
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-2">Paste your brief content</label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your creative brief text here..."
                rows={12}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none resize-none"
              />
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setPasteMode(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ← Upload file instead
                </button>
                <button
                  onClick={handlePastedText}
                  disabled={!pastedText.trim()}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    pastedText.trim()
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Analyze Brief
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
          {error}
        </div>
      )}

      <button onClick={goBack} className="mt-8 mx-auto flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <span dangerouslySetInnerHTML={{ __html: icons.arrowLeft }} />
        Back
      </button>
    </div>
  );
}

// Brief Review Component
function BriefReview({ state, updateState, onComplete, goBack }: {
  state: State;
  updateState: (updates: Partial<State>) => void;
  onComplete: () => void;
  goBack: () => void;
}) {
  const brief = state.uploadedBrief;

  const updateField = (field: keyof State['uploadedBrief'], value: any) => {
    updateState({
      uploadedBrief: { ...state.uploadedBrief, [field]: value }
    });
  };

  // Fields configuration
  const fields = [
    { key: 'campaignName', label: 'Campaign Name', type: 'text', required: true },
    { key: 'objective', label: 'Objective', type: 'text', required: true, placeholder: 'What do you want to achieve?' },
    { key: 'targetAudience', label: 'Target Audience', type: 'textarea', placeholder: 'Who are you trying to reach?' },
    { key: 'proposition', label: 'Proposition / Key Message', type: 'textarea', required: true, placeholder: 'The core promise or single-minded message' },
    { key: 'support', label: 'Support / Proof Points', type: 'array', placeholder: 'Reasons to believe' },
    { key: 'mandatories', label: 'Mandatories', type: 'array', placeholder: 'Must-include elements' },
    { key: 'tone', label: 'Tone of Voice', type: 'text', placeholder: 'How should it sound?' },
    { key: 'constraints', label: 'Constraints', type: 'textarea', placeholder: 'Things to avoid or limitations' },
    { key: 'budget', label: 'Budget', type: 'text', placeholder: 'If relevant' },
    { key: 'timeline', label: 'Timeline', type: 'text', placeholder: 'Key dates' },
    { key: 'successMetrics', label: 'Success Metrics', type: 'text', placeholder: 'How will you measure success?' },
  ];

  const requiredFields = fields.filter(f => f.required);
  const isValid = requiredFields.every(f => {
    const value = brief[f.key as keyof typeof brief];
    return value && (Array.isArray(value) ? value.length > 0 : value.trim() !== '');
  });

  const extractedCount = Object.entries(brief).filter(([_, v]) => v && (Array.isArray(v) ? v.length > 0 : true)).length;
  const totalFields = fields.length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm mb-4">
          <span>Review Brief</span>
          <span className="text-slate-500">•</span>
          <span>{extractedCount}/{totalFields} fields extracted</span>
        </div>
        <h2 className="text-3xl font-bold mb-4">Review & Complete Your Brief</h2>
        <p className="text-slate-400">Fill in any missing fields or mark them as not relevant</p>
      </div>

      <div className="space-y-6 bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
        {fields.map((field) => {
          const value = brief[field.key as keyof typeof brief];
          const isEmpty = !value || (Array.isArray(value) && value.length === 0);

          return (
            <div key={field.key} className={isEmpty ? 'bg-slate-700/30 rounded-xl p-4 -mx-2' : ''}>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">
                  {field.label}
                  {field.required && <span className="text-amber-400 ml-1">*</span>}
                </label>
                {isEmpty && (
                  <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full">
                    Missing
                  </span>
                )}
              </div>

              {field.type === 'text' && (
                <input
                  type="text"
                  value={(value as string) || ''}
                  onChange={(e) => updateField(field.key as keyof State['uploadedBrief'], e.target.value)}
                  placeholder={field.placeholder || ''}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                />
              )}

              {field.type === 'textarea' && (
                <textarea
                  value={(value as string) || ''}
                  onChange={(e) => updateField(field.key as keyof State['uploadedBrief'], e.target.value)}
                  placeholder={field.placeholder || ''}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              )}

              {field.type === 'array' && (
                <div>
                  <input
                    type="text"
                    placeholder={`Add ${field.placeholder || 'item'} and press Enter`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const currentArray = (value as string[]) || [];
                        updateField(field.key as keyof State['uploadedBrief'], [...currentArray, e.currentTarget.value.trim()]);
                        e.currentTarget.value = '';
                      }
                    }}
                    onBlur={(e) => {
                      if (e.currentTarget.value.trim()) {
                        const currentArray = (value as string[]) || [];
                        updateField(field.key as keyof State['uploadedBrief'], [...currentArray, e.currentTarget.value.trim()]);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                  {value && (value as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(value as string[]).map((item, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-700 rounded-full text-sm flex items-center gap-2">
                          {item}
                          <button
                            onClick={() => {
                              const newArray = (value as string[]).filter((_, idx) => idx !== i);
                              updateField(field.key as keyof State['uploadedBrief'], newArray.length > 0 ? newArray : null);
                            }}
                            className="text-slate-400 hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-8">
        <button onClick={goBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <span dangerouslySetInnerHTML={{ __html: icons.arrowLeft }} />
          Back
        </button>
        <button
          onClick={onComplete}
          disabled={!isValid}
          className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
            isValid
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          Continue to Prompts
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
