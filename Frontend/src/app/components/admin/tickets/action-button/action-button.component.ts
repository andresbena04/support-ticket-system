import { Component } from '@angular/core';
import { ActionButtonsParams } from '../../../../models/models';

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [],
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.css'
})
export class ActionButtonComponent {
data: any;
  onView!: (id: number) => void;

  agInit(params: ActionButtonsParams): void {
    this.data = params.data;
    this.onView = params.onView;
  }

  refresh(params: ActionButtonsParams): boolean {
    this.data = params.data;
    return true;
  }

  buttonClicked(action: string): void {
    const id = this.data.id;
    switch (action) {
      case 'view':
        if (this.onView) {
          this.onView(id);
        }
        break;
    }
  }
}
