import { Component, OnInit, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PostService } from '../../../core/services/post.service';
import { Post } from '../../../core/models/models';
import { PostItemComponent } from '../../components/post-item/post-item.component';

@Component({
  selector: 'app-feed-view',
  standalone: true,
  imports: [CommonModule, PostItemComponent],
  templateUrl: './feed-view.component.html',
})
export class FeedViewComponent implements OnInit {
  posts: Post[] = [];
  loading = true;
  error = '';
  currentPage = 1;
  hasMore = true;
  loadingMore = false;

  constructor(
    private postService: PostService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Solo cargar posts en el navegador donde el JWT está disponible
    if (isPlatformBrowser(this.platformId)) {
      this.loadPosts();
    }
  }

  loadPosts(): void {
    this.loading = true;
    this.postService.getFeedPosts(this.currentPage).subscribe({
      next: (response) => {
        this.posts = response.posts;
        this.hasMore = response.hasMore;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.error = 'Error al cargar las publicaciones';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadMorePosts(): void {
    if (this.loadingMore || !this.hasMore) {
      return;
    }

    this.loadingMore = true;
    this.currentPage++;
    
    this.postService.getFeedPosts(this.currentPage).subscribe({
      next: (response) => {
        this.posts = [...this.posts, ...response.posts];
        this.hasMore = response.hasMore;
        this.loadingMore = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading more posts:', error);
        this.loadingMore = false;
        this.currentPage--; // Revertir el incremento
        this.cdr.detectChanges();
      }
    });
  }
}
