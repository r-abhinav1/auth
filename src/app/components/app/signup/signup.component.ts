import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as faceapi from 'face-api.js';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-face-detection',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf]
})
export class SignupComponent implements AfterViewInit {
  @ViewChild('video', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  signupForm: FormGroup;
  isCameraOn = false;
  private capturedImages: string[] = [];

  constructor(private fb: FormBuilder, private router: Router) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    if (this.videoElement) {
      this.loadFaceApiModels();
    } else {
      console.error('videoElement is not available');
    }
  }

  async loadFaceApiModels(): Promise<void> {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/assets/models')
      ]);
      this.startVideo();
    } catch (err) {
      console.error('Error loading face-api models:', err);
    }
  }

  startVideo(): void {
    const video = this.videoElement?.nativeElement;

    if (!video) {
      console.error('Video element is not available');
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
        video.play()
          .catch(err => console.error('Error playing video:', err));

        video.addEventListener('play', () => {
          const canvas = faceapi.createCanvasFromMedia(video);
          document.body.append(canvas);
          const displaySize = { width: video.width, height: video.height };
          faceapi.matchDimensions(canvas, displaySize);

          setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceExpressions();
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            const context = canvas.getContext('2d');
            if (context) {
              context.clearRect(0, 0, canvas.width, canvas.height);
              faceapi.draw.drawDetections(canvas, resizedDetections);
              faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
              faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
            }
          }, 100);
        });
      })
      .catch(err => console.error('Error accessing media devices:', err));
  }

  isImageCaptured: boolean = false;

  async captureImage(): Promise<void> {
    const video = this.videoElement?.nativeElement;

    if (!video) {
      console.error('Video element is not available');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.width;
    canvas.height = video.height;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Cannot get canvas context');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    if (detections.length > 0) {
      alert('Face detected!');
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      this.capturedImages.push(imageDataUrl);

      const link = document.createElement('a');
      link.href = imageDataUrl;
      link.download = 'captured_image.jpeg';
      link.click();
      this.isImageCaptured = true;
    } else {
      this.isImageCaptured = false;
      alert('No face detected.');
    }
  }

  onCamera(): void {
    this.isCameraOn = !this.isCameraOn;
    if (this.isCameraOn) {
      this.startVideo();
    }
  }

  profilePicUrl: any;

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePicUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      const formValues = this.signupForm.value;

      let users = JSON.parse(localStorage.getItem('users') || '[]');

      const userExists = users.some((user: any) => user.username === formValues.username);
      const firstCapturedImage = this.capturedImages[0] || '';
      if (!userExists) {
        const newUser = {
          username: formValues.username,
          password: formValues.password,
          profilePicUrl: this.profilePicUrl as string,
          identityPics: firstCapturedImage as string,
          violatedImage: null
        };

        users.push(newUser);

        localStorage.setItem('users', JSON.stringify(users));

        sessionStorage.setItem('username', formValues.username);

        this.router.navigate(['/homepage'], { queryParams: { username: formValues.username } });
      } else {
        alert('User already exists. Please login.');
      }
    }
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}
