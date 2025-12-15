import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LikeService {
  private apiUrl = 'http://localhost:3000/posts';

  constructor(private http: HttpClient) {}

  likePost(postId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${postId}/like`, {});
  }

  unlikePost(postId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${postId}/like`);
  }

  checkLikeStatus(postId: string): Observable<{ hasLiked: boolean }> {
    return this.http.get<{ hasLiked: boolean }>(`${this.apiUrl}/${postId}/liked`);
  }
}
