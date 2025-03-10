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
  hideActions!: boolean
  onEdit!: (id: number) => void;
  onDelete!: (id: number) => void;

  agInit(params: ActionButtonsParams): void {
    this.data = params.data;
    this.hideActions = params.hideActions
    this.onEdit = params.onEdit;
    this.onDelete = params.onDelete; 
  }

  refresh(params: ActionButtonsParams): boolean {
    this.data = params.data;
    return true;
  }

  buttonClicked(action: string): void {
    const id = this.data.id;
    switch (action) {
      case 'edit':
        if (this.onEdit) {
          this.onEdit(id);
        }
        break;
      case 'delete':
        if (this.onDelete) {
          this.onDelete(id);
        }
        break;
    }
  }
}
