import { ChangeDetectionStrategy, ChangeDetectorRef, Component, signal } from '@angular/core';
import { Breadcrumb } from './models';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { BreadcrumbElementComponent } from './breadcrumbs/breadcrumb-element/breadcrumb-element.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { ResizeObserverDirective } from './resize-observer.directive';
import { inject } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    AsyncPipe,
    BreadcrumbElementComponent,
    BreadcrumbsComponent,
    ResizeObserverDirective
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  readonly #breadcrumbs: Breadcrumb[] = [];
  readonly #visibleBreadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);
  readonly maxWidth = signal<number>(0);
  private cdr = inject(ChangeDetectorRef);

  protected get visibleBreadcrumbs$(): Observable<Breadcrumb[]> {
    return this.#visibleBreadcrumbs$.asObservable();
  }

  protected addBreadcrumb(): void {
    const index = this.#breadcrumbs.length;
    this.#breadcrumbs.push({
      key: index.toString(),
      label$: of(`Breadcrumb ${index}`),
      url: `/${index}`
    });
    this.#visibleBreadcrumbs$.next([...this.#breadcrumbs]);
  }

  protected returnToCrumb(crumb: Breadcrumb): void {
    if (!crumb) {
      return;
    }
    const index = this.#breadcrumbs.findIndex(b => b.key === crumb.key);
    this.#breadcrumbs.splice(index + 1);
    this.#visibleBreadcrumbs$.next([...this.#breadcrumbs]);
  }

  protected onLimitingContainerDimensionChange(event: DOMRectReadOnly): void {
    this.maxWidth.set(event.width);
    this.cdr.detectChanges()
  }
}
