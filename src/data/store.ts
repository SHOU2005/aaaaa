// ── App Store (localStorage persistence) ────────────────────────────────────
import { WORKERS, JOBS, APPLICATIONS, CAPTAINS, COMMUNITIES, POSTS } from './seed';
import type { Worker, Job, Application, Captain, Community, Post } from '../types';

const KEYS = {
  WORKER: 'gpj_worker',
  JOBS: 'gpj_jobs',
  APPLICATIONS: 'gpj_applications',
  CAPTAINS: 'gpj_captains',
  COMMUNITIES: 'gpj_communities',
  POSTS: 'gpj_posts',
  WORKERS: 'gpj_all_workers',
  ONBOARDED: 'gpj_onboarded',
};

function get<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function set<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

const STORE_VERSION = 'v3';

// Seed on first load — force re-seed shared data when version changes
export function initStore() {
  const currentVersion = localStorage.getItem('gpj_version');
  if (currentVersion !== STORE_VERSION) {
    // Re-seed shared/static data (not user-specific data)
    set(KEYS.JOBS, JOBS);
    set(KEYS.CAPTAINS, CAPTAINS);
    set(KEYS.COMMUNITIES, COMMUNITIES);
    set(KEYS.POSTS, POSTS);
    set(KEYS.WORKERS, WORKERS);
    localStorage.setItem('gpj_version', STORE_VERSION);
  } else {
    if (!localStorage.getItem(KEYS.JOBS)) set(KEYS.JOBS, JOBS);
    if (!localStorage.getItem(KEYS.CAPTAINS)) set(KEYS.CAPTAINS, CAPTAINS);
    if (!localStorage.getItem(KEYS.COMMUNITIES)) set(KEYS.COMMUNITIES, COMMUNITIES);
    if (!localStorage.getItem(KEYS.POSTS)) set(KEYS.POSTS, POSTS);
    if (!localStorage.getItem(KEYS.WORKERS)) set(KEYS.WORKERS, WORKERS);
  }
  if (!localStorage.getItem(KEYS.APPLICATIONS)) set(KEYS.APPLICATIONS, APPLICATIONS);
  if (!localStorage.getItem(KEYS.WORKER)) set(KEYS.WORKER, WORKERS[0]);
}

// ── Current logged-in worker ──────────────────────────────────────────────────
export const getWorker = (): Worker => get(KEYS.WORKER, WORKERS[0]);
export const saveWorker = (w: Worker) => set(KEYS.WORKER, w);
export const isOnboarded = (): boolean => !!localStorage.getItem(KEYS.ONBOARDED);
export const setOnboarded = () => localStorage.setItem(KEYS.ONBOARDED, '1');

// ── Jobs ──────────────────────────────────────────────────────────────────────
export const getJobs = (): Job[] => get(KEYS.JOBS, JOBS);
export const getJob = (id: string): Job | undefined => getJobs().find(j => j.id === id);
export const saveJobs = (jobs: Job[]) => set(KEYS.JOBS, jobs);

// ── Saved Jobs ────────────────────────────────────────────────────────────────
export const getSavedJobs = (): string[] => get('gpj_saved_jobs', []);
export const isJobSaved = (jobId: string): boolean => getSavedJobs().includes(jobId);
export const toggleSaveJob = (jobId: string): boolean => {
  const saved = getSavedJobs();
  const already = saved.includes(jobId);
  set('gpj_saved_jobs', already ? saved.filter(id => id !== jobId) : [...saved, jobId]);
  return !already;
};

// ── Applications ──────────────────────────────────────────────────────────────
export const getApplications = (): Application[] => get(KEYS.APPLICATIONS, APPLICATIONS);
export const getMyApplications = (): Application[] => {
  const worker = getWorker();
  return getApplications().filter(a => a.workerId === worker.id);
};
export const saveApplications = (apps: Application[]) => set(KEYS.APPLICATIONS, apps);
export const addApplication = (app: Application) => {
  const apps = getApplications();
  set(KEYS.APPLICATIONS, [...apps, app]);
};
export const hasApplied = (jobId: string): boolean => {
  const worker = getWorker();
  return getApplications().some(a => a.workerId === worker.id && a.jobId === jobId);
};

// ── Captains ──────────────────────────────────────────────────────────────────
export const getCaptains = (): Captain[] => get(KEYS.CAPTAINS, CAPTAINS);
export const getCaptain = (id: string): Captain | undefined => getCaptains().find(c => c.id === id);

// ── Communities ───────────────────────────────────────────────────────────────
export const getCommunities = (): Community[] => get(KEYS.COMMUNITIES, COMMUNITIES);
export const getCommunity = (id: string): Community | undefined => getCommunities().find(c => c.id === id);
export const saveCommunities = (cs: Community[]) => set(KEYS.COMMUNITIES, cs);
export const joinCommunity = (communityId: string) => {
  const worker = getWorker();
  if (!worker.communityIds.includes(communityId)) {
    const updated = { ...worker, communityIds: [...worker.communityIds, communityId] };
    saveWorker(updated);
    const communities = getCommunities().map(c =>
      c.id === communityId ? { ...c, memberIds: [...c.memberIds, worker.id] } : c
    );
    saveCommunities(communities);
  }
};

// ── All Workers ───────────────────────────────────────────────────────────────
export const getAllWorkers = (): Worker[] => get(KEYS.WORKERS, WORKERS);
export const getWorkerById = (id: string): Worker | undefined => getAllWorkers().find(w => w.id === id);

// ── Posts ─────────────────────────────────────────────────────────────────────
export const getPosts = (): Post[] => get(KEYS.POSTS, POSTS);
export const getPost = (id: string): Post | undefined => getPosts().find(p => p.id === id);
export const savePosts = (posts: Post[]) => set(KEYS.POSTS, posts);
export const addPost = (post: Post) => { set(KEYS.POSTS, [post, ...getPosts()]); };
export const toggleLike = (postId: string) => {
  const worker = getWorker();
  const posts = getPosts().map(p => {
    if (p.id !== postId) return p;
    const liked = p.likes.includes(worker.id);
    return { ...p, likes: liked ? p.likes.filter(id => id !== worker.id) : [...p.likes, worker.id] };
  });
  savePosts(posts);
};
export const addComment = (postId: string, content: string) => {
  const worker = getWorker();
  const comment = { id: `c_${Date.now()}`, authorId: worker.id, content, createdAt: new Date().toISOString() };
  const posts = getPosts().map(p =>
    p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
  );
  savePosts(posts);
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export function bearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

export function walkTime(distanceKm: number): string {
  const mins = Math.round(distanceKm * 15);
  if (mins <= 15) return `पैदल ${mins} मिनट`;
  if (distanceKm <= 3) return `Auto ₹${Math.round(distanceKm * 25)}`;
  return `${distanceKm.toFixed(1)} km दूर`;
}

export function formatSalary(min: number, max: number): string {
  const fmt = (n: number) => n >= 1000 ? `₹${Math.round(n/1000)}k` : `₹${n}`;
  if (min === max) return fmt(min);
  return `${fmt(min)}–${fmt(max)}`;
}

export function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'अभी';
  if (diff < 3600) return `${Math.floor(diff/60)} मिनट पहले`;
  if (diff < 86400) return `${Math.floor(diff/3600)} घंटे पहले`;
  if (diff < 172800) return 'कल';
  return `${Math.floor(diff/86400)} दिन पहले`;
}

export function categoryColor(category: string): string {
  const map: Record<string, string> = {
    security: '#1B6B3A', housekeeping: '#E88C2A', driver: '#1E6FBF',
    cook: '#7C3AED', helper: '#DC3545', technician: '#0891B2',
    gardener: '#059669', caretaker: '#DB2777', general: '#6B7280',
  };
  return map[category] || '#6B7280';
}

export function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function generateRegNumber(): string {
  const n = Math.floor(Math.random() * 99999).toString().padStart(6, '0');
  return `SW-0${n}`;
}
