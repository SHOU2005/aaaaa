import { getWorker } from './data/store';
import type { Language } from './types';

export const translations = {
  hi: {
    start: 'शुरू करें →',
    home: 'होम',
    jobs: 'नौकरियां',
    applications: 'स्टेटस',
    community: 'समुदाय',
    profile: 'प्रोफाइल',
    searchPlaceholder: 'नौकरी, स्किल या कंपनी खोजें…',
    urgentJobs: '⚡ Urgent नौकरियां',
    nearbyJobs: '📍 सबसे नज़दीक',
    seeAll: 'सब देखें →',
    referFriend: '🎁 दोस्त को Invite करें',
    referDesc: 'वो नौकरी join करे → आपको मिलें ₹500',
    shareCode: 'Code शेयर करें',
    login: 'लॉग इन',
    signup: 'खाता बनाएं',
    phonePrompt: 'मोबाइल नंबर दर्ज करें',
    sendOtp: 'OTP भेजें',
    verifyOtp: 'OTP Verify करें',
    available: '🟢 Available',
  },
  en: {
    start: 'Start →',
    home: 'Home',
    jobs: 'Jobs',
    applications: 'Status',
    community: 'Community',
    profile: 'Profile',
    searchPlaceholder: 'Search job, skill or company...',
    urgentJobs: '⚡ Urgent Jobs',
    nearbyJobs: '📍 Closest Jobs',
    seeAll: 'See all →',
    referFriend: '🎁 Refer a Friend',
    referDesc: 'They get hired → You get ₹500',
    shareCode: 'Share Code',
    login: 'Login',
    signup: 'Sign Up',
    phonePrompt: 'Enter mobile number',
    sendOtp: 'Send OTP',
    verifyOtp: 'Verify OTP',
    available: '🟢 Available',
  },
  hig: {
    start: 'Start karein →',
    home: 'Home',
    jobs: 'Jobs',
    applications: 'Status',
    community: 'Community',
    profile: 'Profile',
    searchPlaceholder: 'Job, skill, ya company dhoondein...',
    urgentJobs: '⚡ Urgent Jobs',
    nearbyJobs: '📍 Sabse paas',
    seeAll: 'Sab dekhein →',
    referFriend: '🎁 Dost ko Invite karein',
    referDesc: 'Wo job join kare → Aapko Rs. 500!',
    shareCode: 'Code Share karein',
    login: 'Login',
    signup: 'Sign Up',
    phonePrompt: 'Mobile number daalein',
    sendOtp: 'OTP bhejein',
    verifyOtp: 'OTP Verify karein',
    available: '🟢 Available',
  }
};

export function t(key: keyof typeof translations['hi']): string {
  try {
    const worker = getWorker();
    const lang = worker?.language || 'hi';
    return translations[lang][key] || translations['hi'][key];
  } catch (e) {
    return translations['hi'][key];
  }
}
