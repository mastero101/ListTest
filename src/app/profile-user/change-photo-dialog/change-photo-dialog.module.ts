import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangePhotoDialogComponent } from './change-photo-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    ChangePhotoDialogComponent
  ],
  exports: [ChangePhotoDialogComponent]
})
export class ChangePhotoDialogModule { }
