export type Difficulty = 'easy' | 'medium' | 'hard'

export type InterviewRole =
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'Full Stack Developer'
  | 'React Developer'
  | 'Node.js Developer'
  | 'DevOps Engineer'
  | 'Data Scientist'
  | 'Mobile Developer'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface InterviewSession {
  id: string
  role: string
  difficulty: string
  status: string
  messages: Message[]
  createdAt: string
}

export interface InterviewResult {
  id: string
  interviewId: string
  technicalScore: number
  communicationScore: number
  confidenceScore: number
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  summary: string
}
