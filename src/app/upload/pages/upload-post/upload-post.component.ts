import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../../core/services/post.service';

@Component({
  selector: 'app-upload-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './upload-post.component.html',
})
export class UploadPostComponent {
  uploadForm: FormGroup;
  loading = false;
  submitted = false;
  preview: string | null = null;
  selectedFile: File | null = null;
  error = '';
  success = '';

  constructor(
    private formBuilder: FormBuilder,
    private postService: PostService,
    private router: Router
  ) {
    this.uploadForm = this.formBuilder.group({
      caption: [''],
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.preview = e.target.result;
      };
      reader.readAsDataURL(file);
      this.error = '';
    } else {
      this.error = 'Por favor selecciona una imagen válida';
      this.selectedFile = null;
      this.preview = null;
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (!this.selectedFile) {
      this.error = 'Debes seleccionar una imagen';
      return;
    }

    this.loading = true;
    
    // Primero subir la imagen
    this.postService.uploadImage(this.selectedFile).subscribe(
      (response) => {
        // Luego crear el post con la URL de la imagen
        const postData = {
          imageUrl: response.imageUrl,
          caption: this.uploadForm.get('caption')?.value || '',
        };
        
        this.postService.createPost(postData).subscribe(
          () => {
            this.success = '¡Publicación subida exitosamente!';
            this.uploadForm.reset();
            this.preview = null;
            this.selectedFile = null;
            this.submitted = false;
            this.loading = false;
            setTimeout(() => {
              this.router.navigate(['/feed']);
            }, 1500);
          },
          (error) => {
            this.error = 'Error al crear la publicación';
            this.loading = false;
          }
        );
      },
      (error) => {
        this.error = 'Error al subir la imagen';
        this.loading = false;
      }
    );
  }
}
