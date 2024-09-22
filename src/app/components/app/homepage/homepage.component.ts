import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { StoryDialogComponent } from './Stores-Dialog/stories.component';
import { NgForOf, NgIf } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { AlertDialogComponent } from "./alert/alert.component";

interface Story {
  id: number;
  profilePicture: string;
  storyText: string;
  violationImage?: any;
  separatorImageUrl?: any;
  flag: boolean;
  relatedStories: Story[];
}

interface Comment {
  username: string;
  text: string;
}

interface User {
  username: string;
  profilePicture: string;
  stories: Story[];
}

interface Post {
  id: number;
  image: string;
  caption: string;
  showCommentBox: boolean;
  newComment: string;
  comments: Comment[];
}

@Component({
  selector: "app-homepage",
  templateUrl: "./homepage.component.html",
  styleUrls: ["./homepage.component.scss"],
  imports: [FormsModule, NgForOf, NgIf],
  standalone: true
})
export class HomePageComponent implements OnInit, AfterViewInit {
  badWords: string[] = ["fuck", "slut"]; // List of bad words without special characters
  currentUserProfilePicture: string = 'https://via.placeholder.com/80?text=UserProfile';
  currentUserName: string = 'John Doe';
  currentUser!: User;
  allUsers: User[] = [];
  posts: Post[] = [];
  stories: Story[] = [];

  defaultStories: Story[] = [
    { id: 1, profilePicture: 'https://via.placeholder.com/80?text=1', storyText: '', flag: false, relatedStories: [] },
    { id: 2, profilePicture: 'https://via.placeholder.com/80?text=2', storyText: '', flag: false, relatedStories: [] },
    { id: 3, profilePicture: 'https://via.placeholder.com/80?text=3', storyText: '', flag: false, relatedStories: [] }
  ];

  defaultPosts: Post[] = [
    { id: 1, image: 'https://via.placeholder.com/600x400?text=Post+1', caption: 'Beautiful sunset!', showCommentBox: false, newComment: '', comments: [] },
    { id: 2, image: 'https://via.placeholder.com/600x400?text=Post+2', caption: 'Amazing day at the beach!', showCommentBox: false, newComment: '', comments: [] }
  ];

  constructor(private dialog: MatDialog, private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.currentUserName = params['username'] || this.currentUserName;
    });

    this.currentUserProfilePicture = this.getCurrentUserIdentityPicture();
    this.getCurrentUserProfilePic();
    this.loadUserData();

    if (!this.currentUser) {
      this.createNewUser();
    }

    this.posts = this.getAllPosts();
    this.stories = this.getAllStories();

    this.saveUserData();
  }

  ngAfterViewInit() {}

  loadUserData(): void {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      this.allUsers = JSON.parse(storedUsers);
      this.currentUser = this.allUsers.find(user => user.username === this.currentUserName) ?? this.createNewUser();
    } else {
      this.createNewUser();
    }
  }

  createNewUser(): User {
    const newUser: User = {
      username: this.currentUserName,
      profilePicture: this.currentUserProfilePicture,
      stories: [...this.getAllStories()]
    };

    this.allUsers.push(newUser);
    this.currentUser = newUser;
    return newUser;
  }

  getAllPosts(): Post[] {
    const storedPosts = localStorage.getItem('posts');
    if (!storedPosts) {
      localStorage.setItem('posts', JSON.stringify(this.defaultPosts));
      return this.defaultPosts;
    }
    return JSON.parse(storedPosts);
  }

  getAllStories(): Story[] {
    const storedStories = localStorage.getItem('stories');
    if (!storedStories) {
      localStorage.setItem('stories', JSON.stringify(this.defaultStories));
      return this.defaultStories;
    }
    return JSON.parse(storedStories);
  }

  saveUserData(): void {
    localStorage.setItem('users', JSON.stringify(this.allUsers));
    localStorage.setItem('posts', JSON.stringify(this.posts));
    localStorage.setItem('stories', JSON.stringify(this.stories));
  }

  containsBadWord(input: string): boolean {
    return this.badWords.some(badWord => {
      // Create a regex that allows any non-alphanumeric characters between the letters and allows special characters to replace letters
      const regex = new RegExp(badWord.split('').join('[^a-zA-Z0-9]*'), 'i');
      return regex.test(input);
    });
  }

  openStory(story: Story): void {
    this.dialog.open(StoryDialogComponent, {
      width: '600px',
      height: '500px',
      data: { story }
    });
  }

  toggleCommentBox(post: Post): void {
    post.showCommentBox = !post.showCommentBox;
  }

  @ViewChild('cameraFeed', { static: true }) cameraFeed!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  capturedImageViolation: string[] = [];
  separatorImageUrl: any;

  startCamera(newComment: any, commentText: any, post: any) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        this.cameraFeed.nativeElement.srcObject = stream; 
        this.ViolationPic(newComment, commentText, post);
      })
      .catch((error) => {
        console.error('Error accessing the camera:', error);
      });
  }

  addComment(post: Post, commentText: string): void {
    this.separatorImageUrl = "https://via.placeholder.com/10x80/000000/000000?text=%20";
    if (commentText.trim()) {
      const newComment: Comment = {
        username: this.currentUserName,
        text: commentText.trim()
      };

      const existingPost = this.posts.find(p => p.id === post.id);
      if (existingPost) {
        if (this.containsBadWord(commentText)) {
          this.startCamera(newComment, commentText, existingPost);
        } else {
          existingPost.comments.push(newComment);
          this.saveUserData();
        }

        post.newComment = '';
        post.showCommentBox = false;
      }
    }
  }

  violationImage: any;

  ViolationPic(newComment: any, commentText: any, post: any) {
    const video = this.cameraFeed.nativeElement;
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');

    setTimeout(() => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');

        this.capturedImageViolation.push(imageDataUrl);
        this.violationImage = imageDataUrl;

        const link = document.createElement('a');
        link.href = imageDataUrl;
        link.download = 'captured_violator_image.jpeg';
        link.click();

        const title = "Violation Error";
        const message = "You have entered an abusive word; there will be action taken on you!";
        this.dialog.open(AlertDialogComponent, {
          width: '300px',
          data: { title, message }
        });

        const newSpecialStory: Story = {
          id: this.stories.length + 1,
          profilePicture: this.currentUserProfilePicture,
          violationImage: this.violationImage,
          separatorImageUrl: this.separatorImageUrl,
          storyText: `<strong>${newComment.username}</strong> commented with the keyword: "${commentText}" on post: "${post.caption}"`,
          flag: true,
          relatedStories: []
        };

        this.stories.push(newSpecialStory);

        if (this.stories.length >= 3) {
          this.stories[2].relatedStories.push(newSpecialStory);
        }

        this.currentUser.stories = [...this.stories];
        this.saveUserData();

        const stream = video.srcObject as MediaStream;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
        }
      }
    }, 1000);
  }

  onLogout(): void {
    this.router.navigate(['/login']);
  }

  getCurrentUserProfilePic(): string | null {
    const username = sessionStorage.getItem('username');
    if (username) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const matchedUser = users.find((user: any) => user.username === username);
      if (matchedUser) {
        return matchedUser.profilePicUrl;
      }
    }
    return 'https://via.placeholder.com/80?text=UserProfile';
  }

  getCurrentUserIdentityPicture(): string {
    const username = sessionStorage.getItem('username');
    if (username) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const matchedUser = users.find((user: any) => user.username === username);
      if (matchedUser) {
        return matchedUser.identityPics;
      }
    }
    return 'https://via.placeholder.com/80?text=UserProfile';
  }

  setViolaterIdentityPicture(): string {
    const username = sessionStorage.getItem('username');
    if (username) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((user: any) => user.username === username);
      if (userIndex !== -1) {
        const matchedUser = users[userIndex];
        if (!matchedUser.violatedImage) {
          matchedUser.violatedImage = this.violationImage;
          users[userIndex] = matchedUser;
          localStorage.setItem('users', JSON.stringify(users));
        }
        return matchedUser.violatedImage || matchedUser.identityPics;
      }
    }
    return 'https://via.placeholder.com/80?text=DefaultProfile';
  }
}
