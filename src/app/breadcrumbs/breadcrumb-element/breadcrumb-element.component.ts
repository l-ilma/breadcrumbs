import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  inject,
  Input,
  Output
} from '@angular/core';
import { Breadcrumb } from '../../models';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-breadcrumb-element',
  standalone: true,
  imports: [
    AsyncPipe
  ],
  templateUrl: './breadcrumb-element.component.html',
  styleUrl: './breadcrumb-element.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbElementComponent {
  @Input({ required: true }) breadcrumb!: Breadcrumb;
  @Input() last = false;

  @Output() breadcrumbClicked = new EventEmitter<void>();

  @HostBinding('style.display') display = 'block';
  #hidden = false;
  #width: number = 0;
  reference = inject(ElementRef);

  get hidden(): boolean { return this.#hidden; }
  get width(): number { return this.#width; }

  hide() {
    this.#width = this.reference.nativeElement.clientWidth;
    this.display = 'none';
    this.#hidden = true;
  }

  show() {
    this.display = 'block';
    this.#hidden = false;
  }

  protected onClick(): void {
    if (this.last) {
      return;
    }
    this.breadcrumbClicked.emit();
  }
}
