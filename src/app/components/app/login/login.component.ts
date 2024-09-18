import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { HomePageComponent } from "../homepage/homepage.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule, HomePageComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: any;

  // Hardcoded user details
  private users = [
    { username: 'a', password: 'a' },
    { username: 'b', password: 'a' },
    { username: 'c', password: 'a' }
  ];

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const formValues = this.loginForm.value;
  
      // Retrieve users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
  
      // Check if the user exists and the password matches
      const matchedUser = users.find(
        (user: any) => user.username === formValues.username && user.password === formValues.password
      );
  
      if (matchedUser) {
        // User is authenticated, store in sessionStorage
        sessionStorage.setItem('username', matchedUser.username);
  
        this.router.navigate(['/homepage'], { queryParams: { username: matchedUser.username } });
      } else {
        alert('Invalid username or password.');
      }
    }
  }
}
