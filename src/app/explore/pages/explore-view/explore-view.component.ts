import { Component, OnInit, inject, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentSectionComponent } from '../../../feed/components/comment-section/comment-section.component';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ExploreService } from '../../services/explore.service';
import { PostService } from '../../../core/services/post.service';
import { ProfileService } from '../../../profile/services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { User, Post } from '../../../core/models/models';

@Component({
  selector: 'app-explore-view',
  standalone: true,
  templateUrl: './explore-view.component.html',
  imports: [CommonModule, FormsModule, CommentSectionComponent],
})
export class ExploreViewComponent implements OnInit {
  searchQuery: string = '';
  suggestedUsers: User[] = [];
  isSearching: boolean = false;
  searchResults: User[] = [];
  followedInSession: Set<string> = new Set();

  randomPhotos: Post[] = [];
  showModal = false;
  selectedPost: Post | null = null;
  showPostMenu = false;
  openModal(post: Post): void {
    this.selectedPost = post;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPost = null;
    this.showPostMenu = false;
  }

  togglePostMenu(): void {
    this.showPostMenu = !this.showPostMenu;
  }

  getImageUrl(url: string): string {
    return url;
  }

  private exploreService = inject(ExploreService);
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadSuggestedUsers();
      this.loadRandomPhotos();
    }
  }

  loadSuggestedUsers(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.profileService.getUserProfile(currentUser.id).subscribe({
      next: (userProfile: any) => {
        const followingIds = userProfile.followingIds || [];

        this.http.get<User[]>('http://localhost:3000/users').subscribe({
          next: (allUsers) => {
            this.suggestedUsers = allUsers
              .filter(user => user.id !== currentUser.id && !followingIds.includes(user.id))
              .sort(() => Math.random() - 0.5)
              .slice(0, 3);
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    if (query.trim().length > 0) {
      this.isSearching = true;
      this.http.get<User[]>(`http://localhost:3000/users/search?q=${encodeURIComponent(query)}`).subscribe({
        next: (users) => {
          this.searchResults = users;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al buscar usuarios', err);
          this.searchResults = [];
          this.cdr.detectChanges();
        }
      });
    } else {
      this.isSearching = false;
      this.searchResults = [];
    }
  }

  toggleFollow(user: User): void {
    const isCurrentlyFollowing = this.followedInSession.has(user.id);
    
    if (isCurrentlyFollowing) {
      console.log('Dejando de seguir a', user.username);
      this.profileService.unfollowUser(user.id).subscribe({
        next: () => {
          this.followedInSession.delete(user.id);
          this.updateCurrentUserProfile();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al dejar de seguir usuario', error);
        }
      });
    } else {
      console.log('Siguiendo a', user.username);
      this.profileService.followUser(user.id).subscribe({
        next: () => {
          this.followedInSession.add(user.id);
          this.updateCurrentUserProfile();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al seguir usuario', error);
        }
      });
    }
  }

  private updateCurrentUserProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.profileService.getUserProfile(currentUser.id).subscribe(
        (updatedUser) => {
          this.authService.updateCurrentUser(updatedUser);
        }
      );
    }
  }

  isFollowedInSession(userId: string): boolean {
    return this.followedInSession.has(userId);
  }

  viewProfile(username: string): void {
    if (username) {
      this.router.navigate(['/profile', username]);
    }
  }

  loadRandomPhotos(): void {
    this.postService.getAllPosts().subscribe({
      next: (posts) => {
        this.randomPhotos = posts.sort(() => Math.random() - 0.5).slice(0, 6);
        this.cdr.detectChanges();
      }
    });
  }
}
