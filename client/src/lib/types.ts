export interface User {
  id: number;
  username: string;
  password: string;
}

export interface Branch {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  comingSoon: boolean;
}

export interface Semester {
  id: number;
  number: number;
  branchId: number;
}

export interface Subject {
  id: number;
  name: string;
  description: string;
  semesterId: number;
  branchId: number;
}

export interface Lecturer {
  id: number;
  name: string;
  title: string;
  institution: string;
  imageUrl?: string;
}

export interface Video {
  id: number;
  title: string;
  description?: string;
  youtubeId: string;
  duration: number;
  subjectId: number;
  lecturerId: number;
  publishedAt?: Date;
}
