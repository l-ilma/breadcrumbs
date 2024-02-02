import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, ElementRef,
  EventEmitter, inject,
  Input, OnChanges,
  Output, QueryList, SimpleChanges, ViewChild, ViewChildren
} from '@angular/core';
import { BreadcrumbElementComponent } from './breadcrumb-element/breadcrumb-element.component';
import { Breadcrumb } from '../models';
import { delay, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [BreadcrumbElementComponent],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsComponent implements OnChanges {
  @Input({ required: true }) breadcrumbs!: Breadcrumb[];
  @Input({ required: true }) maxWidth!: number;

  @ViewChildren(BreadcrumbElementComponent) breadcrumbElements!: QueryList<BreadcrumbElementComponent>;
  @ViewChild('breadcrumbContainer') breadcrumbContainer!: ElementRef;

  @Output() breadcrumbClicked = new EventEmitter<Breadcrumb>();

  #hiddenElements = false;
  #breadcrumbsUpdated = new Subject<{ prevValue: Breadcrumb[], currValue: Breadcrumb[] }>();
  #cdr = inject(ChangeDetectorRef);

  constructor() {
    this.#breadcrumbsUpdated.pipe(delay(0), takeUntilDestroyed())
      .subscribe(({ prevValue, currValue }) => {
        if (prevValue.length === currValue.length) {
          return;
        }
        this.resize(this.getContainerWidthVisibleElements());
        this.#cdr.markForCheck();
      });
  }

  get visibleBreadcrumbs(): Breadcrumb[] {
    return this.breadcrumbs;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['maxWidth']) {
      if (!this.breadcrumbElements || this.breadcrumbElements?.length === 0) {
        return;
      }
      this.resize(this.getContainerWidthVisibleElements());
    }
    if (changes['breadcrumbs']) {
      this.#breadcrumbsUpdated.next({
        prevValue: changes['breadcrumbs'].previousValue,
        currValue: changes['breadcrumbs'].currentValue
      });
    }
  }

  private resize(width: number): void {
    if (width > this.maxWidth) {
      for (let i = 1; i < this.breadcrumbElements.length - 1; i++) {
        if (width <= this.maxWidth) {
          break;
        }
        const breadcrumb = this.breadcrumbElements.get(i) ?? null;
        if (breadcrumb && !breadcrumb.hidden) {
          width -= breadcrumb.currentWidth;
          breadcrumb.hide();
          this.#hiddenElements = true;
        }
      }
    } else {
      let hiddenElements = false;
      if (this.#hiddenElements) {
        for (let i = this.breadcrumbElements.length - 2; i > 0; i--) {
          if (width == this.maxWidth) {
            hiddenElements = true;
            break;
          }
          const breadcrumb = this.breadcrumbElements.get(i) ?? null;
          if (breadcrumb && breadcrumb.hidden) {
            if (width + breadcrumb.widthBeforeHiding > this.maxWidth) {
              hiddenElements = true;
              break;
            }
            width += breadcrumb.widthBeforeHiding;
            breadcrumb.show();
          }
        }
      }
      this.#hiddenElements = hiddenElements;
    }
    // toggle visibility based on the calculated hidden prop
    this.breadcrumbElements.forEach(breadcrumb => {
      breadcrumb.toggleVisibility(!breadcrumb.hidden)
    });
  }

  private getContainerWidthVisibleElements(): number {
    const breadcrumbsWidth = this.breadcrumbElements?.reduce((width, breadcrumb) => {
      return width + breadcrumb.currentWidth;
    }, 0) ?? 0;
    return breadcrumbsWidth + 75;
  }
}
