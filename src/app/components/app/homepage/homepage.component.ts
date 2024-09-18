import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { StoryDialogComponent } from './Stores-Dialog/stories.component';
import { NgForOf, NgIf } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { AlertDialogComponent } from "./alert/alert.component";
import { title } from "process";

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
  id: number; // Added ID to differentiate posts
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
export class HomePageComponent implements OnInit,AfterViewInit  {
  keyword: string = 'special'; // Define the keyword to check for
  currentUserProfilePicture: string = 'https://via.placeholder.com/80?text=UserProfile'; // Default profile picture
  currentUserName: string = 'John Doe'; // Default user name
  currentUser!: User; // Ensure currentUser is always initialized
  allUsers: User[] = []; // Store all users

  posts: Post[] = []; // Define and initialize posts
  stories: Story[] = []; // Define and initialize stories

  defaultStories: Story[] = [
    { id: 1, profilePicture: 'https://via.placeholder.com/80?text=1', storyText: '', flag: false, relatedStories: [] },
    { id: 2, profilePicture: 'https://via.placeholder.com/80?text=2', storyText: '', flag: false, relatedStories: [] },
    { id: 3, profilePicture: 'https://via.placeholder.com/80?text=3', storyText: '', flag: false, relatedStories: [] }
  ]; // Default stories

  defaultPosts: Post[] = [
    { id: 1, image: 'https://via.placeholder.com/600x400?text=Post+1', caption: 'Beautiful sunset!', showCommentBox: false, newComment: '', comments: [] },
    { id: 2, image: 'https://via.placeholder.com/600x400?text=Post+2', caption: 'Amazing day at the beach!', showCommentBox: false, newComment: '', comments: [] }
  ]; // Default posts

  constructor(private dialog: MatDialog, private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Retrieve username from query parameters
    this.activatedRoute.queryParams.subscribe(params => {
      this.currentUserName = params['username'] || this.currentUserName;
    });

   this.currentUserProfilePicture = this.getCurrentUserIdentityPicture();
    this.getCurrentUserProfilePic();


    // Load user data from localStorage
    this.loadUserData();

    // If the user does not exist, create a new one
    if (!this.currentUser) {
      this.createNewUser();
    }

    // Set posts and stories based on the current user
    this.posts = this.getAllPosts(); // Fetch all posts to be shared among users
    this.stories = this.getAllStories(); // Fetch all stories to be shared among users

    // Save all users back to localStorage
    this.saveUserData();
  }

  ngAfterViewInit() {
    //this.startCamera(); // Start camera after the view has been initialized
  }

  loadUserData(): void {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      this.allUsers = JSON.parse(storedUsers);
      this.currentUser = this.allUsers.find(user => user.username === this.currentUserName) ?? this.createNewUser();
    } else {
      // If no users are stored, create a new one
      this.createNewUser();
    }
  }

  createNewUser(): User {
    const newUser: User = {
      username: this.currentUserName,
      profilePicture: this.currentUserProfilePicture,
      stories: [...this.getAllStories()] // Initialize with all stories
    };

    this.allUsers.push(newUser);
    this.currentUser = newUser;
    return newUser;
  }

  getAllPosts(): Post[] {
    // Ensure posts are shared among all users
    const storedPosts = localStorage.getItem('posts');
    if (!storedPosts) {
      localStorage.setItem('posts', JSON.stringify(this.defaultPosts));
      return this.defaultPosts;
    }
    return JSON.parse(storedPosts);
  }

  getAllStories(): Story[] {
    // Ensure stories are shared among all users
    const storedStories = localStorage.getItem('stories');
    console.log("story1",storedStories)
    if (!storedStories) {
      console.log("story3")
      localStorage.setItem('stories', JSON.stringify(this.defaultStories));
      return this.defaultStories;
    }
    return JSON.parse(storedStories);
  }

  saveUserData(): void {
    console.log("story2",this.stories)
    localStorage.setItem('users', JSON.stringify(this.allUsers));
    localStorage.setItem('posts', JSON.stringify(this.posts)); // Save updated posts
    localStorage.setItem('stories', JSON.stringify(this.stories)); // Save updated stories
  }

  openStory(story: Story): void {
    this.dialog.open(StoryDialogComponent, {
      width: '600px',
      height:'500px',
      data: { story }
    });
  }

  toggleCommentBox(post: Post): void {
    post.showCommentBox = !post.showCommentBox;
  }
  @ViewChild('cameraFeed', { static: true }) cameraFeed!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  capturedImageViolation: string[] = []; // Array to store captured images
  startCamera(newComment:any,commentText:any,post:any) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        this.cameraFeed.nativeElement.srcObject = stream; 
        this.ViolationPic(newComment,commentText,post);// Assign the stream to the video element
      })
      .catch((error) => {
        console.error('Error accessing the camera:', error);
      });
  }
  separatorImageUrl:any;
  addComment(post: Post, commentText: string): void {
   this.separatorImageUrl = "https://via.placeholder.com/10x80/000000/000000?text=%20"
    if (commentText.trim()) {
      const newComment: Comment = {
        username: this.currentUserName, // Use the current username
        text: commentText.trim()
      };

      // Add the comment to the correct post
      const existingPost = this.posts.find(p => p.id === post.id);
      if (existingPost) {
     

        // Check if the comment contains the keyword
        if (commentText.includes(this.keyword)) {
          this.startCamera(newComment,commentText,existingPost);
          
       
       
        }
        else
        {
          existingPost.comments.push(newComment);
          this.saveUserData(); 
        }

        post.newComment = '';
        post.showCommentBox = false;
        // Save updated user data
      }
    }
  }

  violationImage:any
  ViolationPic(newComment:any,commentText:any,post:any) {
    const video = this.cameraFeed.nativeElement;
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');

    // Delay the capture to ensure the video feed is ready
    setTimeout(() => {
      // Set canvas dimensions to match the video feed dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame onto the canvas
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert the canvas to a data URL (base64 encoded string)
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        
        // Store the captured image in the array
        this.capturedImageViolation.push(imageDataUrl);
        this.violationImage = imageDataUrl;
        const link = document.createElement('a');
        link.href = imageDataUrl;
        link.download = 'captured_violator_image.jpeg';
        link.click();
        let title = "Violation Error"
        let message = "You have entered a abusive word ;There will be action take on u!!!!!"
         this.dialog.open(AlertDialogComponent, {
           width: '300px',
           data: { title, message }
         });

         
       console.log("violationimage",this.violationImage)
         const newSpecialStory: Story = {
           id: this.stories.length + 1,
           profilePicture: this.currentUserProfilePicture, // Image URL for profile picture
           violationImage: this.violationImage, // Image URL for violation
           separatorImageUrl: this.separatorImageUrl, // Image URL for separator
           storyText: `<strong>${newComment.username}</strong> commented with the keyword: "${commentText}" on post: "${post.caption}"`,
           flag: true,
           relatedStories: []
         };
console.log("violationImageStory",newSpecialStory)
         this.stories.push(newSpecialStory); // Add the special story to all stories

         // Update the related stories for the third story if available
         if (this.stories.length >= 3) {
           this.stories[2].relatedStories.push(newSpecialStory);
         }

         // Also update the current user's stories
         this.currentUser.stories = [...this.stories];
        console.log('Violation_Image:', imageDataUrl);
        this.saveUserData(); // Log the captured image URL for testing purposes
       // this.setViolaterIdentityPicture()
        // Stop the video stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop()); // Stop all tracks
        }
      }
    }, 1000); // Adjust timeout as needed
  }

  onLogout(): void {
//localStorage.clear();
    this.router.navigate(['/login']);
  }


  getCurrentUserProfilePic(): string | null {
    const username = sessionStorage.getItem('username');
  
    if (username) {
      // Retrieve users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
  
      // Find the logged-in user's details
      const matchedUser = users.find((user: any) => user.username === username);
  
      if (matchedUser) {
        return matchedUser.profilePicUrl; // Return the exact profile picture URL for the logged-in user
      }
    }
  
    return 'https://via.placeholder.com/80?text=UserProfile'; // Return null if no user is found or if not logged in
  }


  getCurrentUserIdentityPicture(): string {
    const username = sessionStorage.getItem('username');
  
    if (username) {
      // Retrieve users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
  
      // Find the logged-in user's details
      console.log("matchedUser1",users)
      const matchedUser = users.find((user: any) => user.username === username);
      console.log("matchedUser2",matchedUser)
  
      if (matchedUser) {
        return matchedUser.identityPics; // Return the exact profile picture URL for the logged-in user
      }
    }

 
  
    return 'https://via.placeholder.com/80?text=UserProfile'; // Return null if no user is found or if not logged in
  }

  setViolaterIdentityPicture(): string {
    const username = sessionStorage.getItem('username');
  
    if (username) {
        // Retrieve users from localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
  
        // Find the index of the logged-in user's details
        const userIndex = users.findIndex((user: any) => user.username === username);
        console.log("matchedUser1x", users);
  
        if (userIndex !== -1) {
            // Get the matched user
            const matchedUser = users[userIndex];
            console.log("matchedUser2x", matchedUser);
  
            // Check if the violatedImage property exists, if not add it
            if (!matchedUser.violatedImage) {
                matchedUser.violatedImage = this.violationImage; // Set a default value or any specific value you want
                // Update the user in the array
                users[userIndex] = matchedUser;
                // Save the updated user list back to localStorage
               localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Return the violatedImage if it exists
            if (matchedUser.violatedImage) {
                return matchedUser.violatedImage;
            }
            // Otherwise, return the identityPics URL
            return matchedUser.identityPics; 
        }
    }
  
    return 'https://via.placeholder.com/80?text=DefaultProfile'; // Fallback URL
}

}
