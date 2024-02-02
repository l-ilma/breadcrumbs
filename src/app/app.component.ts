import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Signal, signal } from '@angular/core';
import { Breadcrumb } from './models';
import { of } from 'rxjs';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { ResizeObserverDirective } from './resize-observer.directive';
import { inject } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BreadcrumbsComponent, ResizeObserverDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  readonly #breadcrumbs= signal<Breadcrumb[]>([
    {
      key: '0',
      label$: of('Breadcrumb 0'),
      url: '/0'
    },
    {
      key: '1',
      label$: of('Breadcrumb 1'),
      url: '/1'
    },
    {
      key: '2',
      label$: of('Breadcrumb 2'),
      url: '/2'
    },
    {
      key: '3',
      label$: of('Breadcrumb 3'),
      url: '/3'
    }
  ]);
  readonly #maxWidth = signal<number>(0);
  readonly #cdr = inject(ChangeDetectorRef);

  protected get visibleBreadcrumbs(): Signal<Breadcrumb[]> {
    return this.#breadcrumbs;
  }

  protected get maxWidth(): Signal<number> {
    return this.#maxWidth;
  }

  protected addBreadcrumb(): void {
    const index = this.#breadcrumbs().length;
    this.#breadcrumbs.update(b => [...b, {
      key: index.toString(),
      label$: of(`Breadcrumb ${index}`),
      url: `/${index}`
    }]);
  }

  protected returnToCrumb(crumb: Breadcrumb): void {
    if (!crumb) {
      return;
    }
    const index = this.#breadcrumbs().findIndex(b => b.key === crumb.key);
    this.#breadcrumbs.update(b => b.slice(0, index + 1));
  }

  protected onLimitingContainerDimensionChange(event: DOMRectReadOnly): void {
    this.#maxWidth.set(event.width);
    this.#cdr.detectChanges();
  }
}
