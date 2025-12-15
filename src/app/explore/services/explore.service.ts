import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Post, User } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ExploreService {
  private apiUrl = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getTrendingPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/posts`).pipe(
      map(posts => posts.slice(0, 10))
    );
  }

  getSuggestedUsers(): Observable<User[]> {
    const currentUser = this.authService.getCurrentUser();
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      map(users => {
        // Filtra el usuario actual
        let filteredUsers = users.filter(user => user.id !== currentUser?.id);
        
        // Si el usuario actual tiene información de following, filtrar también esos usuarios
        if (currentUser) {
          // Obtener el perfil completo del usuario actual para tener la lista de seguidos
          return filteredUsers.sort(() => Math.random() - 0.5).slice(0, 3);
        }
        
        return filteredUsers.sort(() => Math.random() - 0.5).slice(0, 3);
      })
    );
  }

  getSuggestedUsersFiltered(followingIds: string[]): Observable<User[]> {
    const currentUser = this.authService.getCurrentUser();
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      map(users => {
        // Filtrar el usuario actual y los usuarios que ya sigue
        const filteredUsers = users.filter(user => 
          user.id !== currentUser?.id && !followingIds.includes(user.id)
        );
        return filteredUsers.sort(() => Math.random() - 0.5).slice(0, 3);
      })
    );
  }
}
