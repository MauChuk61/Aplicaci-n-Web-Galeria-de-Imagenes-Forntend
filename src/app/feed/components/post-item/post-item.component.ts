import { Component, Input, OnInit, ChangeDetectorRef, PLATFORM_ID, Inject, ChangeDetectionStrategy, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Post, REACTION_EMOJIS, ReactionType } from '../../../core/models/models';
import { SavedService } from '../../../saved/services/saved.service';
import { LikeService } from '../../../core/services/like.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommentSectionComponent } from '../comment-section/comment-section.component';

@Component({
  selector: 'app-post-item',
  standalone: true,
  imports: [CommonModule, CommentSectionComponent],
  templateUrl: './post-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostItemComponent implements OnInit, AfterViewInit {
  @Input() post!: Post;
  @ViewChild(CommentSectionComponent) commentSection?: CommentSectionComponent;
  
  hasLiked: boolean = false;

  showReactionPicker = false;
  reactionTypes: ReactionType[] = ['like', 'love', 'wow', 'sad', 'angry'];
  reactionEmojis = REACTION_EMOJIS;

  constructor(
    private savedService: SavedService,
    private likeService: LikeService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

     ngOnInit(): void {
       if (isPlatformBrowser(this.platformId)) {
         // console.log eliminado
       }
    
    // Inicializar hasLiked como estaba
    if (this.post.hasLiked !== undefined) {
      this.hasLiked = this.post.hasLiked;
    }
    // Inicializar isSaved en el post para que sea persistente
    if (this.post.isSaved === undefined) {
      this.post.isSaved = false;
    }
  }

     ngAfterViewInit(): void {
       if (isPlatformBrowser(this.platformId)) {
         // console.log eliminado
       }
  }

  toggleReactionPicker(): void {
    this.showReactionPicker = !this.showReactionPicker;
  }

  addReaction(type: ReactionType): void {
    if (!this.post.reactions) {
      this.post.reactions = [];
    }
    
    const existingReaction = this.post.reactions.find(r => r.userId === 'currentUser');
    if (existingReaction) {
      existingReaction.type = type;
    } else {
      this.post.reactions.push({
        id: `reaction-${Date.now()}`,
        postId: this.post.id,
        userId: 'currentUser',
        user: {
          id: 'currentUser',
          username: 'you',
          email: 'user@example.com',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
          bio: '',
          followers: 0,
          following: 0,
          createdAt: new Date(),
        },
        type,
        createdAt: new Date(),
      });
    }
    this.post.likes++;
    this.showReactionPicker = false;
  }

  toggleSavePost(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    // Optimistic UI update - modificar directamente this.post
    if (this.post.isSaved) {
      this.post.isSaved = false;
      this.savedService.unsavePost(this.post.id).subscribe({
        next: () => {
          this.cdr.markForCheck();
        },
        error: () => {
          // Revert on error
          this.post.isSaved = true;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.post.isSaved = true;
      this.savedService.savePost(this.post.id).subscribe({
        next: () => {
          this.cdr.markForCheck();
        },
        error: () => {
          // Revert on error
          this.post.isSaved = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  getReactionCount(type: ReactionType): number {
    return this.post.reactions?.filter(r => r.type === type).length || 0;
  }

  getReactionSummary(): Array<{type: ReactionType, count: number}> {
    const summary: Array<{type: ReactionType, count: number}> = [];
    for (const type of this.reactionTypes) {
      const count = this.getReactionCount(type);
      if (count > 0) {
        summary.push({ type, count });
      }
    }
    return summary;
  }

  getUserReaction(): ReactionType | null {
    const userReaction = this.post.reactions?.find(r => r.userId === 'currentUser');
    return userReaction?.type || null;
  }

  getReactionEmoji(type: ReactionType): string {
    return this.reactionEmojis[type];
  }

  likePost(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    // Optimistic UI update
    if (this.hasLiked) {
      this.hasLiked = false;
      this.post.likes--;
      this.likeService.unlikePost(this.post.id).subscribe({
        next: () => {
          this.cdr.markForCheck();
        },
        error: () => {
          // Revert on error
          this.hasLiked = true;
          this.post.likes++;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.hasLiked = true;
      this.post.likes++;
      this.likeService.likePost(this.post.id).subscribe({
        next: () => {
          this.cdr.markForCheck();
        },
        error: () => {
          // Revert on error
          this.hasLiked = false;
          this.post.likes--;
          this.cdr.markForCheck();
        }
      });
    }
  }

  toggleComments(): void {
    if (this.commentSection) {
      this.commentSection.toggleComments();
    }
  }

  viewProfile(username: string): void {
    if (username) {
      this.router.navigate(['/profile', username]);
    }
  }
}
