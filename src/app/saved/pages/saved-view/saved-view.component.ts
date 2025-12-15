import { Component, OnInit, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SavedService } from '../../services/saved.service';
import { Post } from '../../../core/models/models';
import { CommentSectionComponent } from '../../../feed/components/comment-section/comment-section.component';

@Component({
  selector: 'app-saved-view',
  standalone: true,
  imports: [CommonModule, CommentSectionComponent],
  templateUrl: './saved-view.component.html',
})
export class SavedViewComponent implements OnInit {
  savedPosts: Post[] = [];
  isLoading = true;
  showModal = false;
  selectedPost: Post | null = null;
  showPostMenu = false;

  constructor(
    private savedService: SavedService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadSavedPosts();
    }
  }

  loadSavedPosts(): void {
    this.isLoading = true;
    this.savedService.getSavedPosts().subscribe({
      next: (posts) => {
        this.savedPosts = posts;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando posts guardados:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  removeSavedPost(postId: string): void {
    this.savedService.unsavePost(postId).subscribe(() => {
      this.savedPosts = this.savedPosts.filter(p => p.id !== postId);
      if (this.selectedPost?.id === postId) {
        this.closeModal();
      }
    });
  }

  openModal(post: Post): void {
    this.selectedPost = post;
    this.showModal = true;
    this.showPostMenu = false;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPost = null;
    this.showPostMenu = false;
  }

  togglePostMenu(): void {
    this.showPostMenu = !this.showPostMenu;
  }

  getImageUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
  }

  removeFromModal(): void {
    if (this.selectedPost) {
      this.removeSavedPost(this.selectedPost.id);
    }
  }
}
