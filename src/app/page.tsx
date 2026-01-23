'use client';

import { useState, useEffect } from 'react';
import { libraries, disciplines, icons } from '@/lib/data';
import { personalizePrompt, simpleMarkdown } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getCreativePersonas, getStrategyPersonas, type Persona } from '@/lib/personas';

type Step = 'landing' | 'projects' | 'brand-input' | 'discipline-select' | 'library-view' | 'llm-output' | 'my-library';
type Mode = 'strategy' | 'execution';
type Provider = 'gemini' | 'openai' | 'anthropic' | 'none';
type AuthModal = 'none' | 'login' | 'signup' | 'signup-success' | 'forgot-password' | 'reset-sent';

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
  created_at: string;
  updated_at: string;
}

interface State {
  step: Step;
  mode: Mode;
  brand: string;
  website: string;
  industry: string;
  challenge: string;
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
}

const FREE_PROMPT_LIMIT = 15;

export default function Home() {
  const [state, setState] = useState<State>({
    step: 'landing',
    mode: 'strategy',
    brand: '',
    website: '',
    industry: '',
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

  const handleLogin = async (email: string, password: string) => {
    updateState({ authLoading: true, authError: null });
    try {
      const response = await fetch('/api/auth/login', {
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

      updateState({ authModal: 'none', authLoading: false });
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

  const createProject = async (name: string, website: string, industry: string, challenge: string) => {
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
          step: 'discipline-select',
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
      step: 'discipline-select',
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
    updateState({ mode });
  };

  const setProvider = (provider: Provider) => {
    updateState({ llmProvider: provider });
    localStorage.setItem('amplify_provider', provider);
  };

  const runPromptWithLLM = async (prompt: string) => {
    // Check free tier limit if using Gemini (server key)
    if (state.llmProvider === 'gemini' && state.freePromptsUsed >= state.promptsLimit) {
      updateState({
        step: 'llm-output',
        llmOutput: `__LIMIT_REACHED__\n\nYou've used all ${state.promptsLimit} free prompts this month.\n\nTo continue:\n1. Add your own API key (OpenAI or Anthropic)\n2. Upgrade to Premium for unlimited prompts`,
        isLoading: false,
      });
      return;
    }

    updateState({ isLoading: true, llmOutput: '', step: 'llm-output' });

    const personalizedPrompt = personalizePrompt(prompt, state);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: personalizedPrompt,
          mode: state.mode,
          provider: state.llmProvider,
          userApiKey: state.llmProvider !== 'gemini' ? state.apiKey : undefined,
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

  const submitBrandInfo = () => {
    const brand = (document.getElementById('brand') as HTMLInputElement)?.value || '';
    const website = (document.getElementById('website') as HTMLInputElement)?.value || '';
    const industry = (document.getElementById('industry') as HTMLInputElement)?.value || '';
    const challenge = (document.getElementById('challenge') as HTMLTextAreaElement)?.value || '';
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
      apiKey: apiKeyInput,
      step: 'discipline-select',
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

      {state.step !== 'landing' && (
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={resetAll}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                  <span dangerouslySetInnerHTML={{ __html: icons.sparkles }} />
                </div>
                <div>
                  <h1 className="font-bold text-lg">Amplify</h1>
                  <p className="text-xs text-slate-400">AI-powered marketing</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {state.currentProject && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                    <span className="font-medium">{state.currentProject.name}</span>
                  </div>
                )}
                {state.llmProvider === 'gemini' && (
                  <div className="text-xs text-slate-500">
                    {state.freePromptsUsed}/{state.promptsLimit} free prompts
                  </div>
                )}
                {state.user && (
                  <>
                    <button
                      onClick={openProjects}
                      className="text-sm text-slate-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Projects
                    </button>
                    <button
                      onClick={openMyLibrary}
                      className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      My Library
                    </button>
                  </>
                )}
                {state.user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">{state.user.email}</span>
                    <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-white">
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => updateState({ authModal: 'login' })}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={`max-w-6xl mx-auto px-4 ${state.step !== 'landing' ? 'py-8' : 'py-4'}`}>
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
            onEditProject={(project) => updateState({ step: 'brand-input', editingProject: project, currentProject: project, brand: project.name, website: project.website, industry: project.industry, challenge: project.challenge })}
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
        {state.step === 'discipline-select' && (
          <DisciplineSelect state={state} selectDiscipline={selectDiscipline} goBack={() => state.user ? goBack('projects') : goBack('brand-input')} />
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
          />
        )}
        {state.step === 'llm-output' && (
          <LLMOutput
            state={state}
            copyLLMOutput={copyLLMOutput}
            switchModeAndRerun={switchModeAndRerun}
            goBack={() => goBack('library-view')}
            onSaveOriginal={() => saveToLibrary(false)}
            onSaveRemix={() => saveToLibrary(true)}
            onRemix={openRemixModal}
            onClearRemix={clearRemix}
            onToggleOriginal={() => updateState({ originalExpanded: !state.originalExpanded })}
            onToggleRemix={() => updateState({ remixExpanded: !state.remixExpanded })}
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
  onLogin: (email: string, password: string) => void;
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
      onLogin(email, password);
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
            We sent a password reset link to<br />
            <span className="text-white font-medium">{signupEmail}</span>
          </p>

          <p className="text-xs text-slate-500 mb-4">
            Didn't receive the email? Check your spam folder or{' '}
            <button onClick={() => onSwitchMode('forgot-password')} className="text-purple-400 hover:text-purple-300">
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

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => onSwitchMode('forgot-password')}
                  className="text-xs text-purple-400 hover:text-purple-300"
                >
                  Forgot password?
                </button>
              )}
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
            {mode === 'signup' && (
              <p className="text-xs text-slate-500 mt-2">Must be at least 6 characters</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              mode === 'login' ? 'Sign in' : 'Create account'
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
    <div className="min-h-[80vh] flex flex-col">
      {/* Top right auth buttons */}
      <div className="flex justify-end py-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">{user.email}</span>
            <button onClick={onLogout} className="text-sm text-slate-500 hover:text-white">Logout</button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={onLogin} className="text-sm text-slate-400 hover:text-white">Log in</button>
            <button onClick={onSignup} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium">Sign up</button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm mb-8">
          <span dangerouslySetInnerHTML={{ __html: icons.sparkles }} />
          <span>By Fabrica Collective</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-4 max-w-4xl leading-tight">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Amplify</span>
        </h1>
        <p className="text-2xl md:text-3xl font-semibold text-white mb-3">AI-powered marketing</p>
        <p className="text-xl text-slate-400 mb-8 max-w-2xl">Your AI marketing team in a browser — from strategy to send</p>

        <p className="text-base text-slate-500 max-w-2xl mb-8 leading-relaxed">
          90 expert prompts across 9 disciplines. Personalized to your brand. Powered by the strategic wisdom of legendary creative minds.
        </p>

        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="inline-flex items-center bg-slate-800 rounded-xl p-1.5 border border-slate-700">
            <div className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium flex items-center gap-2">📋 Strategy Mode</div>
            <div className="px-4 py-2 rounded-lg text-slate-400 text-sm font-medium flex items-center gap-2">⚡ Execution Mode</div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-lg flex items-center gap-3 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
        >
          Get Started — It's Free
          <span dangerouslySetInnerHTML={{ __html: icons.arrowRight }} />
        </button>

        <p className="text-xs text-slate-600 mt-4">15 free prompts/month • Sign up to track usage across devices</p>
      </div>

      <div className="py-16 border-t border-slate-800">
        <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4 text-2xl border border-purple-500/20">1</div>
            <h3 className="font-semibold text-lg mb-2">Add Your Context</h3>
            <p className="text-slate-400 text-sm">Enter your brand, website, industry, and business challenge</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center mx-auto mb-4 text-2xl border border-cyan-500/20">2</div>
            <h3 className="font-semibold text-lg mb-2">Pick a Discipline</h3>
            <p className="text-slate-400 text-sm">Choose from 9 disciplines: SEO, Email, Social, Blog, and more</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 flex items-center justify-center mx-auto mb-4 text-2xl border border-pink-500/20">3</div>
            <h3 className="font-semibold text-lg mb-2">Choose Your Mode</h3>
            <p className="text-slate-400 text-sm">Strategy for frameworks & planning, or Execution for ready-to-use content</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mx-auto mb-4 text-2xl border border-green-500/20">4</div>
            <h3 className="font-semibold text-lg mb-2">Run or Copy</h3>
            <p className="text-slate-400 text-sm">Execute with AI instantly, or copy to your favorite tool</p>
          </div>
        </div>
      </div>

      <div className="py-8 border-t border-slate-800 text-center">
        <p className="text-sm text-slate-400 mb-2">
          Powered by <a href="https://fabricacollective.com" target="_blank" className="text-purple-400 hover:text-purple-300">Fabrica Collective</a>
        </p>
        <p className="text-xs text-slate-600">Sources: Reforge, Demand Curve, CXL, HubSpot, Semrush, Growth.Design</p>
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
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Your Projects</h2>
        <p className="text-slate-400">Select a project to continue or create a new one</p>
      </div>

      {state.projectsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Create New Project Button */}
          <button
            onClick={onCreateNew}
            className="w-full p-6 rounded-xl border-2 border-dashed border-slate-600 hover:border-purple-500 bg-slate-800/50 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-600/30">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-lg group-hover:text-purple-300">Create New Project</div>
              <div className="text-sm text-slate-400">Add a new brand or client</div>
            </div>
          </button>

          {/* Existing Projects */}
          {state.projects.length > 0 ? (
            state.projects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors"
              >
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => onSelectProject(project)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl border border-purple-500/20">
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-white hover:text-purple-300 transition-colors">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                          <span>{project.industry}</span>
                          {project.website && (
                            <>
                              <span>•</span>
                              <span>{project.website}</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{project.challenge}</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(project.updated_at)}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-slate-700 bg-slate-900/50 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(project);
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <span dangerouslySetInnerHTML={{ __html: icons.arrowRight }} />
                    Continue
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProject(project);
                      }}
                      className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg text-sm transition-colors"
                    >
                      Edit
                    </button>
                    {deleteConfirm === project.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Delete?</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(project.id);
                          }}
                          disabled={isDeleting}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? '...' : 'Yes'}
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
                          setDeleteConfirm(project.id);
                        }}
                        className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>No projects yet. Create your first one to get started!</p>
            </div>
          )}
        </div>
      )}

      <button onClick={goBack} className="mt-8 mx-auto flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <span dangerouslySetInnerHTML={{ __html: icons.arrowLeft }} />
        Back to Home
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
  onCreateProject?: (name: string, website: string, industry: string, challenge: string) => Promise<Project | null>;
  onUpdateProject?: (project: Project) => Promise<boolean>;
  goBack?: () => void;
  updateState: (updates: Partial<State>) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!state.editingProject;
  const isLoggedIn = !!state.user;

  const handleSubmit = async () => {
    const brand = (document.getElementById('brand') as HTMLInputElement)?.value || '';
    const website = (document.getElementById('website') as HTMLInputElement)?.value || '';
    const industry = (document.getElementById('industry') as HTMLInputElement)?.value || '';
    const challenge = (document.getElementById('challenge') as HTMLTextAreaElement)?.value || '';
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
        });
        setIsSaving(false);
        if (success) {
          // Continue to discipline select after update
        }
      } else {
        // Create new project
        const project = await onCreateProject(brand, website, industry, challenge);
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
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">
          {isEditing ? 'Edit Project' : isLoggedIn ? 'Create New Project' : 'Tell us about your business'}
        </h2>
        <p className="text-slate-400">
          {isLoggedIn
            ? isEditing
              ? 'Update your project details'
              : 'Save this as a project to access it anytime'
            : "We'll personalize every prompt to your specific context"}
        </p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">{isLoggedIn ? 'Project Name *' : 'Brand Name *'}</label>
          <input type="text" id="brand" defaultValue={state.brand} placeholder="e.g., Acme Inc." className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Website</label>
          <div className="flex items-center gap-2">
            <span className="text-slate-500" dangerouslySetInnerHTML={{ __html: icons.globe }} />
            <input type="text" id="website" defaultValue={state.website} placeholder="e.g., acme.com" className="flex-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Industry / Niche *</label>
          <input type="text" id="industry" defaultValue={state.industry} placeholder="e.g., B2B SaaS, E-commerce, Healthcare" className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Business Challenge *</label>
          <textarea id="challenge" rows={3} defaultValue={state.challenge} placeholder="e.g., We need to increase organic traffic by 50% in Q1..." className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none" />
          <p className="text-xs text-slate-500 mt-2">Be specific—this context makes the prompts 10x more useful</p>
        </div>

        <div className="pt-4 border-t border-slate-700">
          <label className="block text-sm font-medium text-slate-300 mb-2">AI Provider</label>
          <div className="flex gap-3 mb-3">
            <button onClick={() => setProvider('gemini')} className={`flex-1 px-4 py-2 rounded-lg border ${state.llmProvider === 'gemini' ? 'border-green-500 bg-green-500/20 text-green-300' : 'border-slate-600 text-slate-400 hover:border-slate-500'}`}>Gemini (Free)</button>
            <button onClick={() => setProvider('openai')} className={`flex-1 px-4 py-2 rounded-lg border ${state.llmProvider === 'openai' ? 'border-purple-500 bg-purple-500/20 text-purple-300' : 'border-slate-600 text-slate-400 hover:border-slate-500'}`}>OpenAI</button>
            <button onClick={() => setProvider('anthropic')} className={`flex-1 px-4 py-2 rounded-lg border ${state.llmProvider === 'anthropic' ? 'border-purple-500 bg-purple-500/20 text-purple-300' : 'border-slate-600 text-slate-400 hover:border-slate-500'}`}>Anthropic</button>
          </div>
          {state.llmProvider === 'gemini' ? (
            <p className="text-xs text-green-400">✓ {state.promptsLimit - state.freePromptsUsed} free prompts remaining this month</p>
          ) : (
            <>
              <input
                type="password"
                id="apiKey"
                value={state.apiKey}
                onChange={(e) => updateState({ apiKey: e.target.value })}
                placeholder={state.llmProvider === 'openai' ? 'sk-...' : 'sk-ant-...'}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <p className="text-xs text-slate-500 mt-2">Stored locally in your browser only</p>
            </>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              {isEditing ? 'Save Changes & Continue' : isLoggedIn ? 'Save Project & Continue' : 'Continue to Prompt Library'}
              <span dangerouslySetInnerHTML={{ __html: icons.arrowRight }} />
            </>
          )}
        </button>

        {goBack && (
          <button
            onClick={goBack}
            className="w-full py-3 text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
          >
            <span dangerouslySetInnerHTML={{ __html: icons.arrowLeft }} />
            {isLoggedIn ? 'Back to Projects' : 'Back'}
          </button>
        )}
      </div>
    </div>
  );
}

// Discipline Select Component
function DisciplineSelect({ state, selectDiscipline, goBack }: { state: State; selectDiscipline: (v: string) => void; goBack: () => void }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm mb-4">
          <span className="font-medium">{state.brand}</span>
          <span className="text-slate-500">•</span>
          <span>{state.industry}</span>
        </div>
        <h2 className="text-3xl font-bold mb-4">Choose Your Marketing Focus</h2>
        <p className="text-slate-400">Select a discipline to get personalized prompts for {state.brand}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {disciplines.map((d) => (
          <button key={d.value} onClick={() => selectDiscipline(d.value)} className="p-6 rounded-xl border-2 transition-all text-left border-slate-700 bg-slate-800 hover:border-purple-500 hover:bg-slate-700 group">
            <div className="text-3xl mb-3">{d.icon}</div>
            <div className="font-semibold text-lg mb-1 group-hover:text-purple-300">{d.label}</div>
            <div className="text-sm text-slate-400">{d.desc}</div>
          </button>
        ))}
      </div>

      <button onClick={goBack} className="mt-8 mx-auto flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <span dangerouslySetInnerHTML={{ __html: icons.arrowLeft }} />
        Edit business info
      </button>
    </div>
  );
}

// Library View Component
function LibraryView({ state, setMode, toggleModel, togglePrompt, runPrompt, copyToClipboard, goBack }: { state: State; setMode: (m: Mode) => void; toggleModel: (i: number) => void; togglePrompt: (i: number) => void; runPrompt: (i: number) => void; copyToClipboard: (t: string, id: number | string) => void; goBack: () => void }) {
  const lib = state.library;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={goBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <span dangerouslySetInnerHTML={{ __html: icons.arrowLeft }} /> Back
        </button>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
          <span className="font-medium">{state.brand}</span>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
          <button onClick={() => setMode('strategy')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${state.mode === 'strategy' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>📋 Strategy</button>
          <button onClick={() => setMode('execution')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${state.mode === 'execution' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}>⚡ Execution</button>
        </div>
      </div>
      <p className="text-center text-sm text-slate-500">{state.mode === 'strategy' ? 'Get frameworks, analysis, and strategic recommendations' : 'Get ready-to-use content you can copy and publish immediately'}</p>

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
  copyLLMOutput,
  switchModeAndRerun,
  goBack,
  onSaveOriginal,
  onSaveRemix,
  onRemix,
  onClearRemix,
  onToggleOriginal,
  onToggleRemix,
}: {
  state: State;
  copyLLMOutput: (id: string) => void;
  switchModeAndRerun: (m: Mode) => void;
  goBack: () => void;
  onSaveOriginal: () => void;
  onSaveRemix: () => void;
  onRemix: () => void;
  onClearRemix: () => void;
  onToggleOriginal: () => void;
  onToggleRemix: () => void;
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
                {state.mode === 'strategy' ? 'Strategy' : 'Creative'} Remix
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
              <button onClick={() => switchModeAndRerun('strategy')} className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${state.mode === 'strategy' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>📋 Strategy</button>
              <button onClick={() => switchModeAndRerun('execution')} className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${state.mode === 'execution' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}>⚡ Execution</button>
            </div>
            <span className="text-xs text-slate-500">Switch mode to regenerate</span>
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
            ) : (
              <div className="markdown-output text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: simpleMarkdown(content) }} />
            )}
          </div>
        )}
      </div>

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
              <div className="markdown-output text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: simpleMarkdown(state.remixedOutput || '') }} />
            </div>
          )}
        </div>
      )}
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
              {mode === 'strategy' ? 'Strategy' : 'Creative'} Remix
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

// Persona Card Component
function PersonaCard({
  persona,
  onSelect,
}: {
  persona: Persona;
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
                          {item.mode === 'strategy' ? '📋 Strategy' : '⚡ Execution'}
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
