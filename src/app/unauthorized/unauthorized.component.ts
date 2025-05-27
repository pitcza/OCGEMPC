import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  template: `
    <div class="unauthorized">
      <h2>Unauthorized</h2>
      <p>You do not have permission to view this page.</p>
    </div>
  `,
  styles: [`
    .unauthorized {
      text-align: center;
      margin-top: 100px;
      color: #c00;
    }
  `]
})
export class UnauthorizedComponent {}
