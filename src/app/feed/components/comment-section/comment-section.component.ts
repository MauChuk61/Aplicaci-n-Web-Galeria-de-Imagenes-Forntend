import { Component, Input, OnInit, AfterViewInit, ChangeDetectorRef, PLATFORM_ID, Inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comment } from '../../../core/models/models';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentSectionComponent implements OnInit, AfterViewInit {
  @Input() postId!: string;
  @Input() autoExpand: boolean = false;
  comments: Comment[] = [];
  newCommentContent: string = '';
  isLoading = false;
  isExpanded = false;
  currentUserId: string = '';
  commentsCount: number = 0;

  constructor(
    private commentService: CommentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.currentUserId = user.id;
      }
    }
  }

  ngAfterViewInit(): void {
    // Cargar el conteo después de que Angular termine de hidratar
    if (isPlatformBrowser(this.platformId)) {
      // Usar setTimeout para asegurar que se ejecute después de la hidratación
      setTimeout(() => {
        this.loadCommentsCount();
        // Si autoExpand es true, expandir y cargar comentarios automáticamente
        if (this.autoExpand) {
          this.isExpanded = true;
          this.loadComments();
        }
      }, 0);
    }
  }

  loadCommentsCount(): void {
    this.commentService.getCommentsCount(this.postId).subscribe({
      next: (count: number) => {
        this.commentsCount = count;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.commentsCount = 0;
        this.cdr.markForCheck();
      }
    });
  }

  toggleComments(): void {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded && this.comments.length === 0) {
      this.loadComments();
    }
  }

  loadComments(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();
    
    this.commentService.getPostComments(this.postId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.commentsCount = comments.length;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading comments:', err);
       // console.log eliminado
        this.cdr.markForCheck();
      }
    });
  }

  addComment(): void {
    console.log('[CommentSection] addComment called, content:', this.newCommentContent);
    
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[CommentSection] Not in browser, aborting');
      return;
    }

    const trimmedContent = this.newCommentContent?.trim();
    if (!trimmedContent) {
      console.log('[CommentSection] Empty content, aborting');
      return;
    }

    if (!this.authService.isAuthenticated()) {
      console.log('[CommentSection] Not authenticated');
      alert('Debes iniciar sesión para comentar');
      return;
    }

    console.log('[CommentSection] Calling API to add comment...');

    this.commentService.addComment({
      postId: this.postId,
      content: trimmedContent
    }).subscribe({
      next: (comment) => {
        console.log('[CommentSection] Comment added successfully:', comment);
        this.newCommentContent = '';
        this.commentsCount++;
        
        // Si la sección está expandida, recargar todos los comentarios para sincronizar
        // Si no está expandida, expandirla y cargar los comentarios
        if (this.isExpanded) {
          this.loadComments();
        } else {
          this.isExpanded = true;
          this.loadComments();
        }
      },
      error: (error) => {
        console.error('[CommentSection] Error adding comment:', error);
        alert('Error al agregar comentario: ' + (error.error?.message || error.message));
        this.cdr.markForCheck();
      }
    });
  }

  deleteComment(commentId: string): void {
    if (!confirm('¿Eliminar este comentario?')) {
      return;
    }

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== commentId);
        this.commentsCount--;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error deleting comment:', error);
        this.cdr.markForCheck();
      }
    });
  }

  isCommentAuthor(comment: Comment): boolean {
    return comment.userId === this.currentUserId;
  }
}
