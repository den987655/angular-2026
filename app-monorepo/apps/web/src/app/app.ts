import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TuiRoot } from '@taiga-ui/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [TuiRoot, RouterOutlet],
  standalone: true,
})
export class App {
  protected title = 'TgLab Demo';
}
