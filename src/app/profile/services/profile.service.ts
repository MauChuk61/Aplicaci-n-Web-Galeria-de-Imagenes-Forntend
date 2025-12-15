import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Post } from '../../core/models/models';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private http: HttpClient) {}

  getUserProfile(userId: string): Observable<User> {
    return this.http.get<User>(`http://localhost:3000/users/${userId}`);
  }

  getUserProfileByUsername(username: string): Observable<User> {
    return this.http.get<User>(`http://localhost:3000/users/username/${username}`);
  }

  updateProfile(userId: string, data: any): Observable<User> {
    return this.http.put<User>(`http://localhost:3000/users/${userId}/profile`, data);
  }

  getUserPosts(userId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`http://localhost:3000/posts/user/${userId}`);
  }

  followUser(userId: string): Observable<any> {
    return this.http.post(`http://localhost:3000/users/${userId}/follow`, {});
  }

  unfollowUser(userId: string): Observable<any> {
    return this.http.delete(`http://localhost:3000/users/${userId}/follow`);
  }

  isFollowing(userId: string): Observable<{ isFollowing: boolean }> {
    return this.http.get<{ isFollowing: boolean }>(`http://localhost:3000/users/${userId}/is-following`);
  }
}
