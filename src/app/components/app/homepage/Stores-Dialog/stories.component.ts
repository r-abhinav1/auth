import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card'; // Import MatCardModule
import { MatListModule } from '@angular/material/list'; // Import MatListModule
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf and ngFor
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule for icons

// Define the Story interface
interface Story {
  id: number;
  profilePicture: string;
  storyText: string;
  violationImage?: any;
  separatorImageUrl?: any;
  flag: boolean;
  relatedStories: Story[];
}

@Component({
  selector: 'app-story-dialog',
  templateUrl: './stories.component.html',
  styleUrls: ['./stories.component.scss'],
  standalone: true,
  imports: [MatCardModule, MatListModule, CommonModule, MatIconModule] // Include Angular Material modules
})
export class StoryDialogComponent implements OnInit {
  story: Story;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { story: Story },
    private dialogRef: MatDialogRef<StoryDialogComponent>
  ) {
    this.story = data.story;
  }

  ngOnInit(): void {
    console.log('StoryDialogComponent initialized with data:', this.story);
  }

  get isSpecialStory(): boolean {
    return this.story.profilePicture === 'https://via.placeholder.com/80?text=UserProfile';
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
