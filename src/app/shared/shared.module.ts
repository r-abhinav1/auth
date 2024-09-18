// shared/shared.module.ts
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const materialModules = [MatCardModule, MatInputModule, MatButtonModule, MatIconModule,ReactiveFormsModule,CommonModule,FormsModule,ReactiveFormsModule  ,MatIconModule,]

@NgModule({
  imports: materialModules,
  exports: materialModules,
})
export class SharedModule { }
