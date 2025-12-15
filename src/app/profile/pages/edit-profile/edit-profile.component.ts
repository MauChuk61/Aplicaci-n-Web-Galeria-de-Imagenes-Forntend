import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/models';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile.component.html',
})
export class EditProfileComponent implements OnInit {
  editForm: FormGroup;
  currentUser: User | null = null;
  loading = false;
  submitted = false;
  error = '';
  success = '';
  profileImagePreview: string | null = null;
  selectedFile: File | null = null;
  
  // Errores específicos por campo
  usernameError = '';
  emailError = '';
  passwordError = '';

  constructor(
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.editForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      fullName: [''],
      email: ['', [Validators.email]],
      bio: ['', [Validators.maxLength(150)]],
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(6)]],
      confirmPassword: [''],
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.editForm.patchValue({
        username: this.currentUser.username,
        fullName: (this.currentUser as any).fullName || '',
        email: this.currentUser.email,
        bio: this.currentUser.bio,
      });
      this.profileImagePreview = this.currentUser.profileImage;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';
    this.usernameError = '';
    this.emailError = '';
    this.passwordError = '';

    if (this.editForm.invalid) {
      return;
    }

    // Validar que las contraseñas coincidan si se está cambiando
    const newPassword = this.editForm.get('newPassword')?.value;
    const confirmPassword = this.editForm.get('confirmPassword')?.value;
    const currentPassword = this.editForm.get('currentPassword')?.value;
    
    if (newPassword && newPassword !== confirmPassword) {
      this.passwordError = 'Las contraseñas no coinciden';
      return;
    }

    // Validar que se proporcione la contraseña actual si se quiere cambiar la contraseña
    if (newPassword && !currentPassword) {
      this.passwordError = 'Debes ingresar tu contraseña actual para cambiarla';
      return;
    }

    if (!this.currentUser) {
      return;
    }

    this.loading = true;
    const formData = new FormData();
    formData.append('username', this.editForm.get('username')?.value);
    formData.append('fullName', this.editForm.get('fullName')?.value || '');
    formData.append('email', this.editForm.get('email')?.value);
    formData.append('bio', this.editForm.get('bio')?.value || '');
    
    if (newPassword) {
      formData.append('currentPassword', currentPassword);
      formData.append('newPassword', newPassword);
    }
    
    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile);
    }

    this.profileService.updateProfile(this.currentUser.id, formData).subscribe({
      next: (updatedUser) => {
        // Actualizar el usuario en el AuthService
        this.authService.updateCurrentUser(updatedUser);
        
        this.success = '¡Perfil actualizado exitosamente!';
        this.loading = false;
        
        // Limpiar campos de contraseña después de actualizar
        this.editForm.patchValue({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error al actualizar perfil:', error);
        
        // Restablecer loading primero
        this.loading = false;
        
        // Manejar errores específicos del backend
        const errorMessage = error.error?.message;
        
        if (errorMessage) {
          // Detectar qué campo tiene el error y mostrarlo debajo del campo correspondiente
          if (errorMessage.includes('nombre de usuario')) {
            this.usernameError = errorMessage;
          } else if (errorMessage.includes('correo electrónico') || errorMessage.includes('email')) {
            this.emailError = errorMessage;
          } else if (errorMessage.includes('contraseña')) {
            this.passwordError = errorMessage;
            // Limpiar campos de contraseña si el error es de contraseña
            this.editForm.patchValue({
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
          } else {
            // Error general si no se puede clasificar
            this.error = errorMessage;
          }
        } else if (error.status === 400) {
          this.error = 'Datos inválidos. Por favor verifica tu información.';
        } else if (error.status === 401) {
          this.error = 'No estás autorizado. Por favor inicia sesión nuevamente.';
        } else {
          this.error = 'Error al actualizar el perfil. Por favor intenta de nuevo.';
        }
        
        // Forzar detección de cambios
        this.cdr.markForCheck();
      }
    });
  }
}
