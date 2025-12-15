import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = '';
  
  // Errores específicos por campo
  usernameError = '';
  emailError = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fullName: [''],
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';
    this.usernameError = '';
    this.emailError = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.success = '¡Registro exitoso! Redirigiendo al login...';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1500);
      },
      error: (error) => {
        this.loading = false;
        
        const errorMessage = error.error?.message || error.message;
        
        if (errorMessage) {
          // Detectar si el error es de username o email específicamente
          if (errorMessage.toLowerCase().includes('username')) {
            this.usernameError = 'Este nombre de usuario ya está en uso';
          } else if (errorMessage.toLowerCase().includes('email')) {
            this.emailError = 'Este correo electrónico ya está en uso';
          } else if (errorMessage.includes('email o username')) {
            // Si el mensaje es genérico, mostrar en ambos campos
            this.usernameError = 'El email o username ya está en uso';
            this.emailError = 'El email o username ya está en uso';
          } else {
            this.error = errorMessage;
          }
        } else {
          this.error = 'Error al registrarse. Intenta nuevamente.';
        }
        
        this.cdr.markForCheck();
      }
    });
  }
}
