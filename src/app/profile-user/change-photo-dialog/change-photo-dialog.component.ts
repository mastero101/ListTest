import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-change-photo-dialog',
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule
    ],
    template: `
    <h2 mat-dialog-title>Cambiar foto de perfil</h2>
    
    <mat-dialog-content class="dialog-content">
      <div class="current-photo" *ngIf="data.currentPhoto">
        <img [src]="data.currentPhoto" alt="Foto actual" class="preview-image">
        <p>Foto actual</p>
      </div>
      
      <div class="upload-section">
        <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" style="display: none">
        <button mat-raised-button color="primary" (click)="fileInput.click()">
          <mat-icon>add_photo_alternate</mat-icon>
          Seleccionar imagen
        </button>
        
        <div class="preview" *ngIf="previewUrl">
          <h4>Vista previa:</h4>
          <img [src]="previewUrl" alt="Vista previa" class="preview-image">
        </div>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button 
        mat-raised-button 
        color="primary" 
        [disabled]="!selectedFile"
        (click)="onSave()">
        Guardar cambios
      </button>
    </mat-dialog-actions>
  `,
    styles: [`
    .dialog-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      padding: 1rem 0;
    }
    
    .current-photo, .preview {
      text-align: center;
      margin: 1rem 0;
    }
    
    .preview-image {
      max-width: 200px;
      max-height: 200px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e0e0e0;
    }
    
    .upload-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      width: 100%;
    }
    
    button[mat-raised-button] {
      margin: 0.5rem 0;
    }
  `]
})
export class ChangePhotoDialogComponent {
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    public dialogRef: MatDialogRef<ChangePhotoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentPhoto: string }
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    // Validar tipo de archivo
    if (!file.type.match('image.*')) {
      // Mostrar mensaje de error
      return;
    }

    // Validar tamaño de archivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      // Mostrar mensaje de error
      return;
    }

    this.selectedFile = file;

    // Mostrar vista previa
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }

  onSave(): void {
    if (this.selectedFile && this.previewUrl) {
      // En una aplicación real, aquí subirías el archivo al servidor
      // y devolverías la URL de la imagen subida
      this.dialogRef.close({ 
        photoUrl: this.previewUrl,
        file: this.selectedFile 
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
