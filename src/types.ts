export type Language = 'hi' | 'en'; // Hindi, English

export interface Captain {
  id: string;
  name: string;
  regNumber: string;
  avatar: string;
  placements: number;
  mobile: string;
}

export interface Worker {
  id: string;
  name: string;
  mobile: string;
  city: string;
  sector: string;
  state: string;
  regNumber: string;
  avatar: string;
  photoUrl?: string; // New for premium
  bio: string;
  skills: string[];
  jobTypes: string[];
  documents: {
    aadhar: boolean;
    policeVerification: boolean;
    experience: boolean;
    photo: boolean;
  };
  isVerified: boolean; // New for premium
  availability: 'available' | 'notice_period' | 'working';
  referralCode: string;
  referralEarnings: number;
  referralCount: number;
  communityIds: string[];
  lat: number;
  lng: number;
  workHistory?: {
    employer: string;
    role: string;
    from: string;
    to: string;
    verified: boolean;
  }[];
  language: Language; // New
}

export interface Job {
  id: string;
  captainId: string;
  employerName: string;
  employerId: string;
  employerRating: number;
  employerReviewCount: number;
  role: string;
  category: string;
  location: string;
  city: string;
  lat: number;
  lng: number;
  salary: {
    min: number;
    max: number;
  };
  openings: number;
  filled: number;
  postedAt: string;
  urgent: boolean;
  active: boolean;
  shift: string;
  food: boolean;
  accommodation: boolean;
  nearbyPG: {
    available: boolean;
    priceRange: string;
  };
  uniform: 'company_provided' | 'self' | 'not_required';
  experience: 'Fresher' | '1-2 Years' | '3+ Years';
  documents: string[] | string | { aadhar?: boolean; policeVerification?: boolean; experience?: boolean; photo?: boolean; };
}

export type AppStage = 'Applied' | 'Screening' | 'Interviewed' | 'Offer' | 'Joined' | 'Rejected';

export interface Application {
  id: string;
  workerId: string;
  jobId: string;
  captainId: string;
  currentStage: AppStage;
  stages: {
    stage: AppStage;
    at: string;
    note?: string;
  }[];
  workerNote?: string;
  appliedAt: string;
  interviewAt?: string;
  interviewLocation?: string;
}

export type PostType = 'job_available' | 'looking_for_job' | 'tip' | 'success_story' | 'employer_review' | 'salary_review' | 'interview_tip' | 'voice';

export interface Post {
  id: string;
  authorId: string;
  type: PostType;
  content: string;
  likes: string[]; // worker IDs
  comments: {
    id: string;
    authorId: string;
    content: string;
    createdAt: string;
  }[];
  anonymous?: boolean;
  createdAt: string;
  communityId?: string;
  voiceUrl?: string; // New for voice
  voiceDuration?: number; // Voice duration
  transcript?: string;
  jobRef?: {
    id: string;
    role: string;
    location: string;
    salary: string;
    captainName: string;
    captainMobile: string;
  };
  employerRef?: {
    name: string;
    rating: number;
    feedback: string;
  };
}

export interface Community {
  id: string;
  name: string;
  description: string;
  avatar: string;
  icon?: string;
  memberCount?: number;
  memberIds: string[];
  tags: string[];
  employer?: string; // If tied to a company
  category: 'general' | 'employer' | 'skill' | 'location';
}

export type Availability = Worker['availability'];
