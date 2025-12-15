import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../../core/models/models';

@Injectable({
  providedIn: 'root',
})
export class SavedService {
  private apiUrl = 'http://localhost:3000/saved-posts';

  constructor(private http: HttpClient) {}

  getSavedPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }

  savePost(postId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${postId}`, {});
  }

  unsavePost(postId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${postId}`);
  }

  checkSavedStatus(postId: string): Observable<{ isSaved: boolean }> {
    return this.http.get<{ isSaved: boolean }>(`${this.apiUrl}/${postId}/status`);
  }
}
