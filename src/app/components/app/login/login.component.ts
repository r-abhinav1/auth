import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { HomePageComponent } from "../homepage/homepage.component";
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule, HomePageComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  loginForm: any;
  showIntro:boolean=false;

  // Hardcoded user details
  private users = [
    { username: 'a', password: 'a' },
    { username: 'b', password: 'a' },
    { username: 'c', password: 'a' }
  ];

  constructor(private fb: FormBuilder, private router: Router, private cdr: ChangeDetectorRef) {}  

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
  
        // Trigger animation
        this.showIntro = true;  // Set showIntro to true
        this.cdr.detectChanges();  // Force change detection to show intro

        // Start the transition animation
        this.triggerAnimation();
  
        // Redirect to homepage after animation
        setTimeout(() => {
          this.router.navigate(['/homepage'], { queryParams: { username: matchedUser.username } });
        }, 5000);  // Adjust the timeout to match the animation duration (5s in this case)
        
      } else {
        alert('Invalid username or password.');
      }
    }
  }

  // Method to trigger the animation
  triggerAnimation(): void {
    const intro = document.querySelector(".intro") as HTMLElement;  // Type assertion as HTMLElement
    const logoSpans = document.querySelectorAll(".logo");
  
    // Start the logo animation
    setTimeout(() => {
      logoSpans[0].classList.add("active");
    }, 1000);
  
    setTimeout(() => {
      logoSpans[1].classList.add("active");
      logoSpans[2].classList.add("active");
    }, 2000);
  
    setTimeout(() => {
      logoSpans[0].classList.remove("active");
      logoSpans[2].classList.remove("active");
      logoSpans[0].classList.add("fade");
      logoSpans[2].classList.add("fade");
      logoSpans[1].classList.add("fade");
    }, 3000);
  
    setTimeout(() => {
      logoSpans[1].classList.remove("active");
    }, 4000);
  
    setTimeout(() => {
      if (intro) {
        intro.style.top = "200vh";  // Moves the intro out of view
      }
    }, 5000);
  }



  // Method to redirect to the signup page
  redirectToSignup(): void {
    this.router.navigate(['/signup']);  // Adjust the route to your signup page
  }
}