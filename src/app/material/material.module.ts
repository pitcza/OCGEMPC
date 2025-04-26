import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

const MatModules = [
  CommonModule,
  MatDialogModule 
];

@NgModule({
  declarations: [],
  imports: [MatModules],
  exports: [MatModules]
})

export class MaterialModule { }