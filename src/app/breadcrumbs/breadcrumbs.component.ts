import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, DestroyRef, ElementRef,
  EventEmitter, inject,
  Input, OnChanges,
  Output, QueryList, signal, Signal, SimpleChanges, ViewChild, ViewChildren
} from '@angular/core';
import { BreadcrumbElementComponent } from './breadcrumb-element/breadcrumb-element.component';
import { Breadcrumb } from '../models';
import { map, of, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [BreadcrumbElementComponent, NgTemplateOutlet],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsComponent implements OnChanges, AfterViewInit {
  @Input({ required: true }) breadcrumbs!: Breadcrumb[];
  @Input({ required: true }) maxWidth!: number;

  @ViewChildren(BreadcrumbElementComponent) breadcrumbElements!: QueryList<BreadcrumbElementComponent>;
  @ViewChild('breadcrumbContainer') breadcrumbContainer!: ElementRef;

  @Output() breadcrumbClicked = new EventEmitter<Breadcrumb>();

  protected overflowBreadcrumb: Breadcrumb = {
    key: 'overflow',
    label$: of('...')
  };

  #overflow = signal(false);
  #cdr = inject(ChangeDetectorRef);
  #destroyRef = inject(DestroyRef);

  protected get overflow(): Signal<boolean> {
    return this.#overflow;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['maxWidth'] || changes['breadcrumbs'].firstChange) {
      if (!this.breadcrumbElements || this.breadcrumbElements?.length === 0) {
        return;
      }
      this.resize(this.getContainerWidthVisibleElements(), this.overflow() ? 2 : 1);
    }
  }

  ngAfterViewInit(): void {
    this.breadcrumbElements?.changes?.pipe(
      map(elements => elements.toArray()),
      map((elements: BreadcrumbElementComponent[]) =>
        elements.sort((a, b) =>
          this.getBreadcrumbElementIndex(a) - this.getBreadcrumbElementIndex(b))),
      tap((sortedElements) => this.breadcrumbElements.reset(sortedElements)),
      takeUntilDestroyed(this.#destroyRef)
    ).subscribe(val => {
      console.log('list changes', this.overflow(), val);
      this.resize(this.getContainerWidthVisibleElements(), this.overflow() ? 2 : 1);
      this.#cdr.detectChanges();
    })
  }

  private resize(width: number, index = 1): void {
    if (width > this.maxWidth) {
      for (let i = index; i < this.breadcrumbElements.length - 1; i++) {
        if (width <= this.maxWidth) {
          break;
        }
        const breadcrumb = this.breadcrumbElements.get(i) ?? null;
        if (breadcrumb && !breadcrumb.hidden) {
          width -= breadcrumb.currentWidth;
          breadcrumb.hide();
          this.#overflow.set(true);
        }
      }
    } else {
      let hiddenElements = false;
      if (this.overflow()) {
        for (let i = this.breadcrumbElements.length - 2; i >= index; i--) {
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
      this.#overflow.set(hiddenElements);
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

  private getBreadcrumbElementIndex(breadcrumbElement: BreadcrumbElementComponent): number {
    if (breadcrumbElement.breadcrumb.key === 'overflow') {
      return 1;
    }
    return this.breadcrumbs.findIndex(b => b.key === breadcrumbElement.breadcrumb.key);
  }
}
