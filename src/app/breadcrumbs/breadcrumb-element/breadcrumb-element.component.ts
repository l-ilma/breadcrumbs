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
  @Input() first = false;

  @Output() breadcrumbClicked = new EventEmitter<void>();

  @HostBinding('style.display') protected display = 'block';
  // Initially the visibility is hidden because at the moment of the rendering
  // we are still not sure if the breadcrumb fits into the container.
  // Display property could not be used as it sets the element's width to 0.
  @HostBinding('style.visibility') protected visibility = 'hidden';

  #hidden = false;
  #widthBeforeHiding: number = 0;
  #reference = inject(ElementRef);

  get hidden(): boolean { return this.#hidden; }
  // Width of the element before it was hidden (after that its width is 0)
  get widthBeforeHiding(): number { return this.#widthBeforeHiding; }
  get currentWidth(): number { return this.#reference.nativeElement.clientWidth; }

  hide() {
    this.#widthBeforeHiding = this.#reference.nativeElement.clientWidth;
    this.display = 'none';
    this.#hidden = true;
    this.toggleVisibility(false);
  }

  show() {
    this.display = 'block';
    this.#hidden = false;
    this.toggleVisibility(true);
  }

  toggleVisibility(visible: boolean): void {
    if (visible) {
      this.visibility = 'visible';
    } else {
      this.visibility = 'hidden';
    }
  }

  protected onClick(): void {
    if (this.last) {
      return;
    }
    this.breadcrumbClicked.emit();
  }
}
