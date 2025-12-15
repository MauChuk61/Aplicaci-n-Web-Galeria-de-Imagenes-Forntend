import { Component, OnInit, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { PostService } from '../../../core/services/post.service';
import { MessageService } from '../../../messages/services/message.service';
import { Post, User } from '../../../core/models/models';
import { CommentSectionComponent } from '../../../feed/components/comment-section/comment-section.component';

@Component({
  selector: 'app-view-profile',
  standalone: true,
  imports: [CommonModule, CommentSectionComponent],
  templateUrl: './view-profile.component.html',
})
export class ViewProfileComponent implements OnInit {
  user: User | null = null;
  userPosts: Post[] = [];
  loading = true;
  isFollowing = false;
  selectedPost: Post | null = null;
  showEditModal = false;
  showCaptionEditModal = false;
  showPostMenu = false;
  isOwnProfile = false;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private postService: PostService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    public router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `http://localhost:3000/${url.replace(/^\//, '')}`;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.route.params.subscribe(params => {
        const username = params['username'];
        const currentUser = this.authService.getCurrentUser();
        
        if (username) {
          // Cargar perfil por username
          this.loadProfileByUsername(username, currentUser);
        } else if (currentUser) {
          // Cargar perfil propio
          this.loadProfile(currentUser.id);
        }
      });
    }
  }

  loadProfileByUsername(username: string, currentUser: any): void {
    this.loading = true;
    this.profileService.getUserProfileByUsername(username).subscribe(
      (user) => {
        this.user = user;
        this.isOwnProfile = currentUser?.id === user.id;
        // Si es nuestro propio perfil, actualizar el usuario en el servicio
        if (this.isOwnProfile) {
          this.authService.updateCurrentUser(user);
        }
        this.cdr.markForCheck();
        this.loadUserPosts(user.id);
        if (!this.isOwnProfile && currentUser) {
          this.checkFollowStatus(user.id);
        }
      },
      (error) => {
        console.error('Error loading profile by username:', error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    );
  }

  loadProfile(userId: string): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    this.isOwnProfile = currentUser?.id === userId;
    
    console.log('[ViewProfile] loadProfile called with userId:', userId);
    // console.log eliminado
    // console.log eliminado
    
    this.profileService.getUserProfile(userId).subscribe(
      (user) => {
        // console.log eliminado
        this.user = user;
        // Si es nuestro propio perfil, actualizar el usuario en el servicio
        if (this.isOwnProfile) {
          this.authService.updateCurrentUser(user);
        }
        this.cdr.markForCheck();
        this.loadUserPosts(userId);
        if (!this.isOwnProfile) {
          this.checkFollowStatus(userId);
        }
      },
      (error) => {
        console.error('Error loading profile:', error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    );
  }

  checkFollowStatus(userId: string): void {
    this.profileService.isFollowing(userId).subscribe(
      (response) => {
        this.isFollowing = response.isFollowing;
        this.cdr.markForCheck();
      },
      (error) => {
        console.error('Error checking follow status:', error);
      }
    );
  }

  loadUserPosts(userId: string): void {
    this.postService.getUserPosts(userId).subscribe(
      (posts) => {
        this.userPosts = posts;
        this.loading = false;
        this.cdr.markForCheck();
      },
      (error) => {
        console.error('Error loading posts:', error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    );
  }

  openEditModal(post: Post): void {
    this.selectedPost = post;
    this.showEditModal = true;
    this.showPostMenu = false;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.showPostMenu = false;
    this.selectedPost = null;
  }

  togglePostMenu(): void {
    this.showPostMenu = !this.showPostMenu;
  }

  editPost(): void {
    this.showEditModal = false;
    this.showCaptionEditModal = true;
    this.showPostMenu = false;
  }

  closeCaptionEditModal(): void {
    this.showCaptionEditModal = false;
    this.showEditModal = true;
  }

  confirmDeletePost(): void {
    if (!this.selectedPost) return;
    this.showPostMenu = false;
    this.deletePost(this.selectedPost.id);
  }

  updatePost(postId: string, caption: string): void {
    this.postService.updatePost(postId, { caption }).subscribe(
      () => {
        const post = this.userPosts.find(p => p.id === postId);
        if (post) {
          post.caption = caption;
        }
        this.closeEditModal();
      },
      (error) => {
        console.error('Error updating post:', error);
      }
    );
  }

  deletePost(postId: string): void {
    if (confirm('¿Estás seguro de eliminar esta publicación?')) {
      this.postService.deletePost(postId).subscribe(
        () => {
          this.userPosts = this.userPosts.filter(p => p.id !== postId);
          this.closeEditModal();
        },
        (error) => {
          console.error('Error deleting post:', error);
        }
      );
    }
  }

  toggleFollow(): void {
    if (!this.user) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    if (this.isFollowing) {
      this.profileService.unfollowUser(this.user.id).subscribe(
        () => {
          this.isFollowing = false;
          // Actualizar seguidores del perfil que estamos viendo
          if (this.user && typeof this.user.followers === 'number') {
            this.user.followers -= 1;
          }
          // Recargar el perfil del usuario actual para actualizar el contador
          this.reloadCurrentUserProfile(currentUser.id);
          this.cdr.markForCheck();
        },
        (error) => {
          console.error('Error unfollowing:', error);
          alert('Error al dejar de seguir: ' + (error.error?.message || 'Error desconocido'));
        }
      );
    } else {
      this.profileService.followUser(this.user.id).subscribe(
        () => {
          this.isFollowing = true;
          // Actualizar seguidores del perfil que estamos viendo
          if (this.user && typeof this.user.followers === 'number') {
            this.user.followers += 1;
          }
          // Recargar el perfil del usuario actual para actualizar el contador
          this.reloadCurrentUserProfile(currentUser.id);
          this.cdr.markForCheck();
        },
        (error) => {
          console.error('Error following:', error);
          alert('Error al seguir: ' + (error.error?.message || 'Error desconocido'));
        }
      );
    }
  }

  private reloadCurrentUserProfile(userId: string): void {
    this.profileService.getUserProfile(userId).subscribe(
      (updatedUser) => {
        this.authService.updateCurrentUser(updatedUser);
        console.log('Usuario actual actualizado:', updatedUser);
      },
      (error) => {
        console.error('Error recargando perfil del usuario actual:', error);
      }
    );
  }

  sendMessage(): void {
    if (!this.user) return;
    
    const recipientId = this.user.id; // Ya es string
    
    // Primero intentar encontrar una conversación existente
    this.messageService.getConversations().subscribe({
      next: (conversations) => {
        // Buscar si ya existe una conversación con este usuario
        const existingConversation = conversations.find(
          conv => conv.otherUser && conv.otherUser.id === Number(recipientId)
        );
        
        if (existingConversation) {
          // Si existe, navegar a esa conversación
          this.router.navigate(['/messages', existingConversation.id]);
        } else {
          // Si no existe, crear conversación vacía
          this.messageService.createConversation(recipientId).subscribe({
            next: (conversation) => {
              this.router.navigate(['/messages', conversation.id]);
            },
            error: (error) => {
              console.error('Error creating conversation:', error);
              alert('Error al iniciar la conversación. Por favor intenta nuevamente.');
            }
          });
        }
      },
      error: (error) => {
        console.error('Error getting conversations:', error);
        // Si falla al obtener conversaciones, intentar crear una nueva
        this.messageService.sendMessage(recipientId, '👋 Hola!').subscribe({
          next: (message) => {
            this.router.navigate(['/messages', message.conversationId]);
          },
          error: (err) => {
            console.error('Error creating conversation:', err);
            alert('Error al iniciar la conversación. Por favor intenta nuevamente.');
          }
        });
      }
    });
  }
}
