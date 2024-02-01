import { Directive, ElementRef, EventEmitter, OnDestroy, Output } from '@angular/core';

@Directive({
  selector: '[appResizeObserver]',
  standalone: true
})
export class ResizeObserverDirective implements OnDestroy {
  @Output() appResizeObserver = new EventEmitter<DOMRectReadOnly>();
  private resizeObserver: ResizeObserver | null = null;

  constructor(private readonly elRef: ElementRef) {
    this.listenToResizeObserver();
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  listenToResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      if (!entries || !entries.length) {
        return;
      }
      this.appResizeObserver.emit(entries[0].contentRect);
    });
    this.resizeObserver.observe(this.elRef.nativeElement);
  }
}
