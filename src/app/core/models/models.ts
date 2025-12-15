// User Models
export interface User {
  id: string;
  username: string;
  email: string;
  profileImage: string;
  bio?: string;
  followers: number;
  following: number;
  createdAt: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

// Post Models
export interface Post {
  id: string;
  userId: string;
  user?: User;
  imageUrl: string;
  caption: string;
  likes: number;
  comments?: Comment[];
  reactions?: Reaction[];
  isSaved?: boolean;
  hasLiked?: boolean;
  createdAt: Date;
  isLiked?: boolean;
}

export interface CreatePostRequest {
  image: File;
  caption: string;
}

// Reactions Model
export type ReactionType = 'like' | 'love' | 'wow' | 'sad' | 'angry';

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  wow: '😲',
  sad: '😢',
  angry: '😠',
};

export interface Reaction {
  id: string;
  postId: string;
  userId: string;
  user: User;
  type: ReactionType;
  createdAt: Date;
}

export interface AddReactionRequest {
  postId: string;
  type: ReactionType;
}

// Comment Models
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  likes: number;
  createdAt: Date;
  isLiked?: boolean;
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
}

// Notification Model
export type NotificationType = 'like' | 'love' | 'comment' | 'follow' | 'reaction';

export interface Notification {
  id: string;
  userId: string;
  fromUser: User;
  type: NotificationType;
  postId?: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

