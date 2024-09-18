import { Routes } from '@angular/router';
import { LoginComponent } from './components/app/login/login.component';
import { SignupComponent } from './components/app/signup/signup.component';
import { HomePageComponent } from './components/app/homepage/homepage.component';


export const routes: Routes = [
    {path:'login' , component:LoginComponent},
    {path:'signup' , component:SignupComponent},
    {path:'homepage' , component:HomePageComponent},
];
